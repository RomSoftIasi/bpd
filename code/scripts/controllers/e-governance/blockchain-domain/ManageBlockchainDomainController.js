const {WebcController} = WebCardinal.controllers;
import BlockchainDomainService from "../../services/e-governance/BlockchainDomainService.js";
import * as Loader from "../../WebcSpinnerController.js";

export default class ManageBlockchainDomainController extends WebcController {
    constructor(...props) {
        super(...props);

        const {organizationUid, blockchainDomainUid} = this.getState();
        this.model = {
            organizationUid: organizationUid,
            blockchainDomainUid: blockchainDomainUid,
            blockchainDomainModel: {}
        };

        this.BlockchainDomainService = new BlockchainDomainService(this.DSUStorage);

        this.initNavigationListeners();
        this.getBlockchainDomainInformation();
    }

    initNavigationListeners() {
        this.onTagClick("back", () => {
            this.history.goBack();
        });

        this.onTagClick("install", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.installBlockchainDomain();
        });

        this.onTagClick("remove", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.removeBlockchainDomain();
        });
    }

    getBlockchainDomainInformation() {
        Loader.displayLoader();
        this.BlockchainDomainService.getBlockchainDomainData(this.model.organizationUid, this.model.blockchainDomainUid,
            (err, blockchainDomainData) => {
                Loader.hideLoader();
                if (err) {
                    return console.error(err);
                }

                this.model.blockchainDomainModel = blockchainDomainData;
                const {isInstalling, isInstalled, isInstallFailed} = blockchainDomainData;
                this.model.isReadyToInstall = !(isInstalling || isInstalled || isInstallFailed);
                this.model.displayConfiguration = this.model.isReadyToInstall || isInstalling;
                this.model.displayLogs = isInstalled || isInstallFailed;
            });
    }

    removeBlockchainDomain() {
        this.BlockchainDomainService.removeBlockchainDomain(this.model.organizationUid, this.model.blockchainDomainUid, (err, result) => {
            Loader.hideLoader();
            if (err) {
                return console.error(err);
            }

            console.log(result);
            this.navigateToPageTag("blockchain-domains-dashboard", {
                organizationUid: this.model.organizationUid
            });
        });
    }

    installBlockchainDomain() {
        const blockchainDomainData = this.model.toObject("blockchainDomainModel");
        blockchainDomainData.isInstalling = true;
        blockchainDomainData.isReadyToInstall = false;
        blockchainDomainData.isInstalled = false;
        blockchainDomainData.isInstallFailed = false;

        Loader.displayLoader();
        this.BlockchainDomainService.updateBlockchainDomainData(this.model.organizationUid, blockchainDomainData, (err, result) => {
            Loader.hideLoader();
            if (err) {
                return console.error(err);
            }

            this.startDeployCluster(blockchainDomainData);

            console.log(result);
            this.navigateToPageTag("blockchain-domains-dashboard", {
                organizationUid: this.model.organizationUid
            });
        });
    }

    startDeployCluster(blockchainDomainData) {
        this.BlockchainDomainService.initiateAndWaitToInstallCluster(blockchainDomainData, (err, result) => {
            console.log("[INSTALL]", err, result);
            blockchainDomainData.isInstalling = false;
            blockchainDomainData.isReadyToInstall = false;
            if (err) {
                if(typeof err === "object") {
                    err = JSON.stringify(err);
                }
                blockchainDomainData.deploymentLogs = err;
                blockchainDomainData.isInstalled = false;
                blockchainDomainData.isInstallFailed = true;
            } else {
                if (result.pipelinesStatus === "ERROR") {
                    blockchainDomainData.isInstalled = false;
                    blockchainDomainData.isInstallFailed = true;
                } else {
                    blockchainDomainData.isInstalled = true;
                    blockchainDomainData.isInstallFailed = false;
                }
                blockchainDomainData.deploymentLogs = result;
            }

            const jenkinsData = {
                user: blockchainDomainData.jenkinsUserName,
                token: blockchainDomainData.jenkinsToken,
                jenkins: blockchainDomainData.jenkins
            };
            this.updateDeploymentLogs(blockchainDomainData, jenkinsData, (err, result) => {
                if (err) {
                    return console.error(err);
                }

                console.log(result);
            });
        });
    }

    updateDeploymentLogs(blockchainDomainData, jenkinsData, callback) {
        this.BlockchainDomainService.parseDeploymentLogs(blockchainDomainData.deploymentLogs, jenkinsData, (err, logs) => {
            if (err) {
                return callback(err);
            }

            blockchainDomainData.deploymentLogs = logs.logDetails;
            if (logs.hasFailedPipelines) {
                blockchainDomainData.isInstalled = false;
                blockchainDomainData.isInstallFailed = true;
            }
            this.BlockchainDomainService.updateBlockchainDomainData(this.model.organizationUid, blockchainDomainData, (err, result) => {
                if (err) {
                    return callback(err);
                }

                console.log(result);
                this.BlockchainDomainService.removeClusterStatus(blockchainDomainData.subdomain, callback);
            });
        });
    }
}