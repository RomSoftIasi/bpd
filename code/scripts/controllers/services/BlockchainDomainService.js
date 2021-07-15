import ClusterControllerApi from "./ClustersControllerApi.js";

export default class BlockchainDomainService {

    ORGANIZATION_PATH = "/organizations";
    BLOCKCHAIN_DOMAINS_PATH = "/blockchain-domains";

    constructor(DSUStorage) {
        this.DSUStorage = DSUStorage;
        this.ClusterControllerApi = new ClusterControllerApi();
    }

    createBlockchainDomain(organizationUid, blockchainDomainData, callback) {
        const blockchainDomainsPath = this.getBlockchainDomainsPath(organizationUid);
        this.DSUStorage.call('createSSIAndMount', blockchainDomainsPath, (err, keySSI) => {
            if (err) {
                callback(err, undefined);
                return;
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
            this.updateDomain(organizationUid, blockchainDomainData, callback);
        });
    }

    updateDomain(organizationUid, blockchainDomainData, callback) {
        blockchainDomainData.dataStatus = this.getBlockchainDomainInstallStatus(blockchainDomainData);
        const blockchainDomainDataPath = this.getBlockchainDomainDataPath(organizationUid, blockchainDomainData.uid);
        this.DSUStorage.setObject(blockchainDomainDataPath, blockchainDomainData, (err) => {
            callback(err, blockchainDomainData);
        });
    }

    listBlockchainDomains(organizationUid, callback) {
        const blockchainDomainsPath = this.getBlockchainDomainsPath(organizationUid);
        this.DSUStorage.call('listDSUs', blockchainDomainsPath, (err, blockchainDomainsIdentifierList) => {
            if (err) {
                return callback(err);
            }

            const blockchainDomainsList = [];
            const getBlockchainDomainDSU = (blockchainDomainsIdentifierList) => {
                if (!blockchainDomainsIdentifierList.length) {
                    return callback(undefined, blockchainDomainsList);
                }

                const id = blockchainDomainsIdentifierList.pop();
                this.getBlockchainDomainData(organizationUid, id.identifier, (err, blockchainDomainData) => {
                    if (err) {
                        return callback(err);
                    }

                    blockchainDomainsList.push(blockchainDomainData);
                    getBlockchainDomainDSU(blockchainDomainsIdentifierList);
                });
            };

            getBlockchainDomainDSU(blockchainDomainsIdentifierList);
        });
    }

    getBlockchainDomainData(organizationUid, blockchainDomainUid, callback) {
        const blockchainDomainDataPath = this.getBlockchainDomainDataPath(organizationUid, blockchainDomainUid);
        this.DSUStorage.getObject(blockchainDomainDataPath, callback);
    }

    waitForClusterRemoval(blockchainNetworkName, callback) {
        this.ClusterControllerApi.loopUntilClusterIsInstalled(blockchainNetworkName, callback);
    }

    initiateUninstallCluster(clusterDetails, callback) {
        let removeClusterInfo = {
            blockchainNetwork: clusterDetails.subdomain,
            user: clusterDetails.jenkinsUserName,
            token: clusterDetails.jenkinsToken,
            jenkins: clusterDetails.jenkins,
            clusterOperation: "uninstallNetworkWithDefaultConfiguration",
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

    getBlockchainDomainsPath(uid) {
        return `${this.ORGANIZATION_PATH}/${uid}${this.BLOCKCHAIN_DOMAINS_PATH}`;
    }

    getBlockchainDomainDataPath(organizationUid, blockchainDomainUid) {
        return `${this.getBlockchainDomainsPath(organizationUid)}/${blockchainDomainUid}/data.json`;
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

    waitForClusterInstallationToFinish(blockchainNetworkName, callback) {
        this.ClusterControllerApi.loopUntilClusterIsInstalled(blockchainNetworkName, callback);
    }

    initiateInstallCluster(clusterDetails, callback) {
        const usecaseRepository = clusterDetails.githubUsecaseRepository || "";

        let installClusterInfo = {
            blockchainNetwork: clusterDetails.subdomain,
            user: clusterDetails.jenkinsUserName,
            token: clusterDetails.jenkinsToken,
            jenkins: clusterDetails.jenkins,
            clusterOperation: "initiateNetworkWithDefaultConfiguration",
            configMap: clusterDetails.deploymentConfiguration,
            clusterStatus: clusterDetails.dataStatus,
            parametrizedPipeline: {
                domain: clusterDetails.mainDomain,
                subdomain: clusterDetails.subdomain,
                vaultdomain: clusterDetails.vaultDomain,
                usecaseRepository: usecaseRepository,
                workspace: usecaseRepository.split(".git")[0].split("/").pop()
            }
        }

        console.log(installClusterInfo);
        console.log(clusterDetails);
        this.ClusterControllerApi.startDeployCluster(installClusterInfo, callback);
    }

    parseDeploymentLogs(deploymentLogs, jenkinsData, callback) {
        if (deploymentLogs && typeof deploymentLogs === "string") {
            deploymentLogs = JSON.parse(deploymentLogs);
            if (deploymentLogs.errType === "internalError") {
                return this.buildInternalErrorLogs(deploymentLogs, jenkinsData, callback);
            }
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
        }

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

    removeBlockchainDomainDefinition(organizationUid, blockchainDomainUid, callback) {
        const clusterPath = `${this.BLOCKCHAIN_DOMAINS_PATH}/${blockchainDomainUid}`;
        this.DSUStorage.call("clusterUnmount", organizationUid, clusterPath, callback);
    }

    initiateUpgradeCluster(clusterDetails, callback) {
        const usecaseRepository = clusterDetails.githubUsecaseRepository || "";

        let installClusterInfo = {
            blockchainNetwork: clusterDetails.subdomain,
            user: clusterDetails.jenkinsUserName,
            token: clusterDetails.jenkinsToken,
            jenkins: clusterDetails.jenkins,
            clusterOperation: "upgradeNetworkUsingDefaultConfiguration",
            configMap: clusterDetails.deploymentConfiguration,
            clusterStatus: clusterDetails.dataStatus,
            parametrizedPipeline: {
                domain: clusterDetails.mainDomain,
                subdomain: clusterDetails.subdomain,
                vaultdomain: clusterDetails.vaultDomain,
                usecaseRepository: usecaseRepository,
                workspace: usecaseRepository.split(".git")[0].split("/").pop()
            }
        }

        console.log(installClusterInfo);
        console.log(clusterDetails);
        this.ClusterControllerApi.startDeployCluster(installClusterInfo, callback);
    }

    initiateRetryInstallCluster(clusterDetails, callback) {
        const usecaseRepository = clusterDetails.githubUsecaseRepository || "";

        let installClusterInfo = {
            blockchainNetwork: clusterDetails.subdomain,
            user: clusterDetails.jenkinsUserName,
            token: clusterDetails.jenkinsToken,
            jenkins: clusterDetails.jenkins,
            clusterOperation: "retryInitiateNetworkWithDefaultConfiguration",
            configMap: clusterDetails.deploymentConfiguration,
            clusterStatus: clusterDetails.dataStatus,
            parametrizedPipeline: {
                domain: clusterDetails.mainDomain,
                subdomain: clusterDetails.subdomain,
                vaultdomain: clusterDetails.vaultDomain,
                usecaseRepository: usecaseRepository,
                workspace: usecaseRepository.split(".git")[0].split("/").pop()
            }
        }

        console.log(installClusterInfo);
        console.log(clusterDetails);
        this.ClusterControllerApi.startDeployCluster(installClusterInfo, callback);
    }
}
