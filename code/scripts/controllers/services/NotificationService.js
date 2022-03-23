import BlockchainDomainService from "./BlockchainDomainService.js";

class NotificationService {

    constructor() {
        this.BlockchainDomainService = new BlockchainDomainService();

        this.installCallback = null;
        this.uninstallCallback = null;
    }

    checkForInstallPipelineStatus(organizationUid, blockchainDomainData, callback) {
        if (this.installCallback) {
            // If a callback is already assigned, do not register again the pipeline status listener, only update the notification callback
            this.installCallback = callback;
            return;
        }

        // Set the callback that will provide the updated model when the pipeline finishes the execution
        this.installCallback = callback;
        this.BlockchainDomainService.waitForClusterInstallationToFinish(blockchainDomainData.subdomain, (err, result) => {
            blockchainDomainData.isInstalling = false;
            blockchainDomainData.isReadyToInstall = false;
            blockchainDomainData.isUninstalling = false;
            if (err) {
                console.error(err);
                if (typeof err === "object") {
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

            this.BlockchainDomainService.updateDeploymentLogs(organizationUid, blockchainDomainData, jenkinsData, (err, result) => {
                console.log(err, result);
                this.installCallback(err, blockchainDomainData);
                // Reset the notification callback when the process is completed
                this.installCallback = null;
            });
        });
    }

    checkForUninstallPipelineStatus(organizationUid, blockchainDomainData, callback) {
        if (this.uninstallCallback) {
            // If a callback is already assigned, do not register again the pipeline status listener, only update the notification callback
            this.uninstallCallback = callback;
            return;
        }

        // Set the callback that will provide the updated model when the pipeline finishes the execution
        this.uninstallCallback = callback;
        this.BlockchainDomainService.waitForClusterRemoval(blockchainDomainData.subdomain, (err, result) => {
            if (err) {
                return console.error(err);
            }

            console.log(result);
            blockchainDomainData.isReadyToInstall = true;
            blockchainDomainData.isInstalling = false;
            blockchainDomainData.isInstalled = false;
            blockchainDomainData.isInstallFailed = false;
            blockchainDomainData.isUninstalling = false;
            blockchainDomainData.deploymentLogs = "";
            this.BlockchainDomainService.updateDomain(organizationUid, blockchainDomainData, (err, result) => {
                if (err) {
                    return console.error(err);
                }

                console.log(result);
                this.BlockchainDomainService.removeClusterStatus(blockchainDomainData.subdomain, (err, result) => {
                    console.log(err, result);
                    this.uninstallCallback(err, blockchainDomainData);
                    // Reset the notification callback when the process is completed
                    this.uninstallCallback = null;
                });
            });
        });
    }
}

let notificationServiceInstance = null;
const getNotificationServiceInstance = function () {
    if (notificationServiceInstance) {
        return notificationServiceInstance;
    }

    notificationServiceInstance = new NotificationService();
    return notificationServiceInstance;
};

export {
    getNotificationServiceInstance
};