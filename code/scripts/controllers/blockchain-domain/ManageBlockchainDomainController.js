const {WebcController} = WebCardinal.controllers;
import BlockchainDomainService from "../services/BlockchainDomainService.js";
import {getNotificationServiceInstance} from "../services/NotificationService.js";
import * as Loader from "../WebcSpinnerController.js";

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
        this.NotificationService = getNotificationServiceInstance(this.DSUStorage);

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

        this.onTagClick("uninstall", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.uninstallBlockchainDomain();
        });

        this.onTagClick("remove", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.removeBlockchainDomainHandler();
        });

        this.onTagClick("upgrade", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.upgradeBlockchainDomain();
        });

        this.onTagClick("retry", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.retryBlockchainDomainInstallation();
        });
    }

    updateDisplayConditions(blockchainDomainData) {
        const {isInstalling, isInstalled, isInstallFailed, isUninstalling} = blockchainDomainData;
        this.model.isReadyToInstall = !(isInstalling || isInstalled || isInstallFailed || isUninstalling);
        this.model.displayConfiguration = this.model.isReadyToInstall || isInstalling;
        this.model.displayLogs = isInstalled || isInstallFailed;
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
                const {status} = this.translationModel.statuses[blockchainDomainData.dataStatus];
                this.model.blockchainDomainModel.status = status;
                this.updateDisplayConditions(blockchainDomainData);

                if (this.model.blockchainDomainModel.isInstalling) {
                    this.checkForInstallPipelineStatus(blockchainDomainData);
                }

                if (this.model.blockchainDomainModel.isUninstalling) {
                    this.checkForUninstallPipelineStatus(blockchainDomainData);
                }
            });
    }

    checkForInstallPipelineStatus(blockchainDomainData) {
        this.NotificationService.checkForInstallPipelineStatus(this.model.organizationUid, blockchainDomainData, (err, updatedBlockchainDomainData) => {
            if (err) {
                return console.error(err);
            }

            console.log(updatedBlockchainDomainData);
            this.model.blockchainDomainModel = updatedBlockchainDomainData;
            this.updateDisplayConditions(updatedBlockchainDomainData);
        });
    }

    checkForUninstallPipelineStatus(blockchainDomainData) {
        this.NotificationService.checkForUninstallPipelineStatus(this.model.organizationUid, blockchainDomainData, (err, updatedBlockchainDomainData) => {
            if (err) {
                return console.error(err);
            }

            console.log(updatedBlockchainDomainData);
            this.model.blockchainDomainModel = updatedBlockchainDomainData;
            this.updateDisplayConditions(updatedBlockchainDomainData);
        });
    }

    uninstallBlockchainDomain() {
        Loader.displayLoader();
        const blockchainDomainData = this.model.toObject("blockchainDomainModel");
        blockchainDomainData.isInstalling = false;
        blockchainDomainData.isReadyToInstall = false;
        blockchainDomainData.isInstalled = false;
        blockchainDomainData.isInstallFailed = false;
        blockchainDomainData.isUninstalling = true;

        this.BlockchainDomainService.updateDomain(this.model.organizationUid, blockchainDomainData, (err, result) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            console.log(result);
            this.BlockchainDomainService.initiateUninstallCluster(blockchainDomainData, (err, result) => {
                Loader.hideLoader();
                if (err) {
                    return console.error(err);
                }

                console.log(result);
                this.navigateToPageTag("blockchain-domains-dashboard", {
                    organizationUid: this.model.organizationUid
                });
            });
        });
    }

    installBlockchainDomain() {
        const blockchainDomainData = this.model.toObject("blockchainDomainModel");
        blockchainDomainData.isInstalling = true;
        blockchainDomainData.isReadyToInstall = false;
        blockchainDomainData.isInstalled = false;
        blockchainDomainData.isInstallFailed = false;
        blockchainDomainData.isUninstalling = false;

        Loader.displayLoader();
        this.BlockchainDomainService.updateDomain(this.model.organizationUid, blockchainDomainData, (err, result) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            console.log(result);
            this.BlockchainDomainService.initiateInstallCluster(blockchainDomainData, (err, result) => {
                Loader.hideLoader();
                if (err) {
                    console.log(err);
                    blockchainDomainData.isInstalling = false;
                    blockchainDomainData.isInstalled = true;
                    blockchainDomainData.deploymentLogs = JSON.stringify(err);
                    this.BlockchainDomainService.updateDeploymentLogs(this.model.organizationUid, blockchainDomainData, null, (err, result) => {
                        console.log(err, result);
                    });
                }

                console.log(result);
                this.navigateToPageTag("blockchain-domains-dashboard", {
                    organizationUid: this.model.organizationUid
                });
            });
        });
    }

    removeBlockchainDomainHandler() {
        const modalConfiguration = {
            controller: 'ConfirmModalController',
            disableBackdropClosing: false
        };

        this.showModalFromTemplate('confirm-modal',
            () => {
                this.removeBlockchainDomainDefinition();
            }, (event) => {
                const error = event.detail || null

                if (error && error !== true) {
                    console.error(error);
                }
            }, modalConfiguration);
    }

    removeBlockchainDomainDefinition() {
        Loader.displayLoader();
        const {organizationUid, blockchainDomainUid} = this.model;
        this.BlockchainDomainService.removeBlockchainDomainDefinition(organizationUid, blockchainDomainUid, (err, result) => {
            Loader.hideLoader();
            if (err) {
                return console.error(err);
            }

            console.log(result);
            this.navigateToPageTag("blockchain-domains-dashboard", {
                organizationUid: organizationUid
            });
        });
    }

    upgradeBlockchainDomain() {
        const blockchainDomainData = this.model.toObject("blockchainDomainModel");
        blockchainDomainData.isInstalling = true;
        blockchainDomainData.isReadyToInstall = false;
        blockchainDomainData.isInstalled = false;
        blockchainDomainData.isInstallFailed = false;
        blockchainDomainData.isUninstalling = false;

        Loader.displayLoader();
        this.BlockchainDomainService.updateDomain(this.model.organizationUid, blockchainDomainData, (err, result) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            console.log(result);
            this.BlockchainDomainService.initiateUpgradeCluster(blockchainDomainData, (err, result) => {
                Loader.hideLoader();
                if (err) {
                    console.log(err);
                    blockchainDomainData.isInstalling = false;
                    blockchainDomainData.isInstalled = true;
                    blockchainDomainData.deploymentLogs = JSON.stringify(err);
                    this.BlockchainDomainService.updateDeploymentLogs(this.model.organizationUid, blockchainDomainData, null, (err, result) => {
                        console.log(err, result);
                    });
                }

                console.log(result);
                this.navigateToPageTag("blockchain-domains-dashboard", {
                    organizationUid: this.model.organizationUid
                });
            });
        });
    }

    retryBlockchainDomainInstallation() {
        const blockchainDomainData = this.model.toObject("blockchainDomainModel");
        blockchainDomainData.isInstalling = true;
        blockchainDomainData.isReadyToInstall = false;
        blockchainDomainData.isInstalled = false;
        blockchainDomainData.isInstallFailed = false;
        blockchainDomainData.isUninstalling = false;

        Loader.displayLoader();
        this.BlockchainDomainService.updateDomain(this.model.organizationUid, blockchainDomainData, (err, result) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            console.log(result);
            this.BlockchainDomainService.initiateRetryInstallCluster(blockchainDomainData, (err, result) => {
                Loader.hideLoader();
                if (err) {
                    console.log(err);
                    blockchainDomainData.isInstalling = false;
                    blockchainDomainData.isInstalled = true;
                    blockchainDomainData.deploymentLogs = JSON.stringify(err);
                    this.BlockchainDomainService.updateDeploymentLogs(this.model.organizationUid, blockchainDomainData, null, (err, result) => {
                        console.log(err, result);
                    });
                }

                console.log(result);
                this.navigateToPageTag("blockchain-domains-dashboard", {
                    organizationUid: this.model.organizationUid
                });
            });
        });
    }
}