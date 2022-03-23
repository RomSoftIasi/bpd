import DSUService from "./DSUService.js";
import ClusterControllerApi from "./ClustersControllerApi.js";

const pskPath = require("swarmutils").path;

export default class BlockchainDomainService extends DSUService {

    ORGANIZATION_PATH = "/organizations";
    BLOCKCHAIN_DOMAINS_PATH = "/blockchain-domains";

    constructor() {
        super();

        this.ClusterControllerApi = new ClusterControllerApi();
    }

    createBlockchainDomain(organizationUid, blockchainDomainData, callback) {
        const blockchainDomainsPath = this.getBlockchainDomainsPath(organizationUid);
        this.createDSUAndMount(blockchainDomainsPath, (err, keySSI) => {
            if (err) {
                return callback(err);
            }

            blockchainDomainData.keySSI = keySSI;
            blockchainDomainData.uid = keySSI;
            blockchainDomainData.isOwner = true;
            blockchainDomainData.type = "Owner";
            blockchainDomainData.isInstalled = false;
            blockchainDomainData.isInstalling = false;
            blockchainDomainData.isInstallFailed = false;
            blockchainDomainData.isUninstalling = false;
            blockchainDomainData.deploymentLogs = "";
            blockchainDomainData.dataStatus = this.getBlockchainDomainInstallStatus(blockchainDomainData);
            this.updateEntity(blockchainDomainData, blockchainDomainsPath, callback);
        });
    }

    updateDomain(organizationUid, blockchainDomainData, callback) {
        blockchainDomainData.dataStatus = this.getBlockchainDomainInstallStatus(blockchainDomainData);
        const blockchainDomainsPath = this.getBlockchainDomainsPath(organizationUid);
        this.updateEntity(blockchainDomainData, blockchainDomainsPath, (err) => {
            callback(err, blockchainDomainData);
        });
    }

    listBlockchainDomains(organizationUid, callback) {
        const blockchainDomainsPath = this.getBlockchainDomainsPath(organizationUid);
        this.getEntities(blockchainDomainsPath, callback);
    }

    isExistingBlockchainDomain(organizationUid, domainData, domainUid, callback) {
        if (typeof domainUid === "function") {
            callback = domainUid;
            domainUid = null;
        }

        this.listBlockchainDomains(organizationUid, (err, domainsList) => {
            if (err) {
                return callback(err);
            }

            const blockchainDomain = domainsList.find(domain => {
                let found = domain.mainDomain.trim() === domainData.mainDomain.trim()
                    || domain.subdomain.trim() === domainData.subdomain.trim();
                if (domainUid) {
                    found &= (domain.uid !== domainUid);
                }

                return found;
            });

            return callback(undefined, blockchainDomain);
        });
    }

    removeBlockchainDomainDefinition(organizationUid, blockchainDomainUid, callback) {
        const blockchainDomainsPath = this.getBlockchainDomainsPath(organizationUid);
        this.unmountEntity(blockchainDomainUid, blockchainDomainsPath, callback);
    }

    getBlockchainDomainData(organizationUid, blockchainDomainUid, callback) {
        const blockchainDomainsPath = this.getBlockchainDomainsPath(organizationUid, blockchainDomainUid);
        this.getEntity(blockchainDomainUid, blockchainDomainsPath, callback);
    }

    getBlockchainDomainsPath(uid) {
        return pskPath.join(this.ORGANIZATION_PATH, uid, this.BLOCKCHAIN_DOMAINS_PATH);
    }

    getBlockchainDomainInstallStatus(blockchainDomainData) {
        let dataStatus = "ready";
        if (blockchainDomainData.isInstalled) {
            dataStatus = "installed";
        }

        if (blockchainDomainData.isInstalling) {
            dataStatus = "installing";
        }

        if (blockchainDomainData.isInstallFailed) {
            dataStatus = "failed";
        }

        if (blockchainDomainData.isUninstalling) {
            dataStatus = "uninstalling";
        }

        return dataStatus;
    }

    initiateInstallCluster(clusterDetails, callback) {
        const usecaseRepository = clusterDetails.githubUsecaseRepository || "";
        let clusterOperation = "initiateNetworkWithDefaultConfiguration";
        if (clusterDetails.blockchainTypes === 'Quorum') {
            clusterOperation = "initiateNetworkUsingBlockchain";
        }

        let installClusterInfo = {
            blockchainNetwork: clusterDetails.subdomain,
            user: clusterDetails.jenkinsUserName,
            token: clusterDetails.jenkinsToken,
            jenkins: clusterDetails.jenkins,
            clusterOperation: clusterOperation,
            configMap: clusterDetails.deploymentConfiguration,
            clusterStatus: clusterDetails.dataStatus,
            parametrizedPipeline: {
                domain: clusterDetails.mainDomain,
                subdomain: clusterDetails.subdomain,
                vaultdomain: clusterDetails.vaultDomain,
                usecaseRepository: usecaseRepository,
                workspace: usecaseRepository.split(".git")[0].split("/").pop()
            }
        };

        console.log(installClusterInfo);
        console.log(clusterDetails);
        this.ClusterControllerApi.startDeployCluster(installClusterInfo, callback);
    }

    waitForClusterInstallationToFinish(blockchainNetworkName, callback) {
        this.ClusterControllerApi.loopUntilClusterIsInstalled(blockchainNetworkName, callback);
    }

    initiateUninstallCluster(clusterDetails, callback) {
        let clusterOperation = "uninstallNetworkWithDefaultConfiguration";
        if (clusterDetails.blockchainTypes === 'Quorum') {
            clusterOperation = "uninstallNetworkUsingBlockchain";
        }

        let removeClusterInfo = {
            blockchainNetwork: clusterDetails.subdomain,
            user: clusterDetails.jenkinsUserName,
            token: clusterDetails.jenkinsToken,
            jenkins: clusterDetails.jenkins,
            clusterOperation: clusterOperation,
            configMap: clusterDetails.deploymentConfiguration,
            clusterStatus: clusterDetails.dataStatus,
            parametrizedPipeline: {
                domain: clusterDetails.mainDomain,
                subdomain: clusterDetails.subdomain,
                vaultdomain: clusterDetails.vaultDomain
            }
        };

        console.log(removeClusterInfo);
        console.log(clusterDetails);
        this.ClusterControllerApi.startRemoveCluster(removeClusterInfo, callback);
    }

    waitForClusterRemoval(blockchainNetworkName, callback) {
        this.ClusterControllerApi.loopUntilClusterIsInstalled(blockchainNetworkName, callback);
    }

    parseDeploymentLogs(deploymentLogs, jenkinsData, callback) {
        if (deploymentLogs && typeof deploymentLogs === "string") {
            deploymentLogs = JSON.parse(deploymentLogs);
        }
        if (deploymentLogs.errType === "internalError") {
            return this.buildInternalErrorLogs(deploymentLogs, jenkinsData, callback);
        }

        let log = "";
        const pipelines = JSON.parse(deploymentLogs.pipelines);
        const exceptionErrorPipeline = pipelines.find(pipeline => pipeline.result === "EXCEPTION");
        if (exceptionErrorPipeline) {
            return this.buildInternalErrorLogs(JSON.parse(exceptionErrorPipeline.log), jenkinsData, callback);
        }

        const hasFailedPipelines = pipelines.findIndex(pipeline => pipeline.result === "FAILURE") !== -1;
        const builds = pipelines.map(el => {
            return {
                buildNo: el.buildNo,
                pipeline: el.name
            };
        });

        const getLogs = (jenkinsPipeline, buildNo) => {
            this.ClusterControllerApi.getPipelineLogs(jenkinsPipeline, buildNo, jenkinsData, (err, data) => {
                if (err) {
                    log += (`Failed to retrieve logs\nJenkins pipeline: ${jenkinsPipeline}\n$Build no.: ${buildNo}\n`);
                    console.log(err);
                } else {
                    log += (`${data.message}\n`);
                }

                if (builds.length === 0) {
                    return callback(undefined, {
                        logDetails: log,
                        hasFailedPipelines: hasFailedPipelines
                    });
                } else {
                    const cElem = builds.shift();
                    getLogs(cElem.pipeline, cElem.buildNo);
                }
            });
        };

        const cElem = builds.shift();
        getLogs(cElem.pipeline, cElem.buildNo);
    }

    buildInternalErrorLogs(deploymentLogs, jenkinsData, callback) {
        const log = JSON.stringify({
            error: deploymentLogs.errMessage,
            jenkinsData: deploymentLogs.jenkinsData || jenkinsData
        });

        return callback(undefined, {
            logDetails: log,
            hasFailedPipelines: true
        });
    }

    removeClusterStatus(blockchainNetworkName, callback) {
        this.ClusterControllerApi.pipelineStatusRemove(blockchainNetworkName, callback);
    }

    updateDeploymentLogs(organizationUid, blockchainDomainData, jenkinsData, callback) {
        this.parseDeploymentLogs(blockchainDomainData.deploymentLogs, jenkinsData, (err, logs) => {
            if (err) {
                return callback(err);
            }

            blockchainDomainData.deploymentLogs = logs.logDetails;
            blockchainDomainData.lastInstallDate = Date.now();
            if (logs.hasFailedPipelines) {
                blockchainDomainData.isInstalled = false;
                blockchainDomainData.isInstallFailed = true;
            }
            this.updateDomain(organizationUid, blockchainDomainData, (err, result) => {
                if (err) {
                    return callback(err);
                }

                console.log(result);
                this.removeClusterStatus(blockchainDomainData.subdomain, callback);
            });
        });
    }

    initiateUpgradeCluster(clusterDetails, callback) {
        const usecaseRepository = clusterDetails.githubUsecaseRepository || "";
        let clusterOperation = "upgradeNetworkUsingDefaultConfiguration";
        if (clusterDetails.blockchainTypes === 'Quorum') {
            clusterOperation = "upgradeNetworkUsingBlockchain";
        }
        let installClusterInfo = {
            blockchainNetwork: clusterDetails.subdomain,
            user: clusterDetails.jenkinsUserName,
            token: clusterDetails.jenkinsToken,
            jenkins: clusterDetails.jenkins,
            clusterOperation: clusterOperation,
            configMap: clusterDetails.deploymentConfiguration,
            clusterStatus: clusterDetails.dataStatus,
            parametrizedPipeline: {
                domain: clusterDetails.mainDomain,
                subdomain: clusterDetails.subdomain,
                vaultdomain: clusterDetails.vaultDomain,
                usecaseRepository: usecaseRepository,
                workspace: usecaseRepository.split(".git")[0].split("/").pop()
            }
        };

        console.log(installClusterInfo);
        console.log(clusterDetails);
        this.ClusterControllerApi.startDeployCluster(installClusterInfo, callback);
    }

    initiateRetryInstallCluster(clusterDetails, callback) {
        const usecaseRepository = clusterDetails.githubUsecaseRepository || "";
        let clusterOperation = "retryInitiateNetworkWithDefaultConfiguration";
        if (clusterDetails.blockchainTypes === 'Quorum') {
            clusterOperation = "retryInitiateNetworkWithBlockchain";
        }

        let installClusterInfo = {
            blockchainNetwork: clusterDetails.subdomain,
            user: clusterDetails.jenkinsUserName,
            token: clusterDetails.jenkinsToken,
            jenkins: clusterDetails.jenkins,
            clusterOperation: clusterOperation,
            configMap: clusterDetails.deploymentConfiguration,
            clusterStatus: clusterDetails.dataStatus,
            parametrizedPipeline: {
                domain: clusterDetails.mainDomain,
                subdomain: clusterDetails.subdomain,
                vaultdomain: clusterDetails.vaultDomain,
                usecaseRepository: usecaseRepository,
                workspace: usecaseRepository.split(".git")[0].split("/").pop()
            }
        };

        console.log(installClusterInfo);
        console.log(clusterDetails);
        this.ClusterControllerApi.startDeployCluster(installClusterInfo, callback);
    }
}
