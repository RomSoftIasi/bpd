const {WebcController} = WebCardinal.controllers;
import BlockchainDomainService from "../../services/e-governance/BlockchainDomainService.js";
import * as Loader from "../../WebcSpinnerController.js";
import {getFormattedDate} from "../../../utils/utils.js";

export default class BlockchainDomainsController extends WebcController {
    constructor(...props) {
        super(...props);

        const {organizationUid} = this.getState();
        this.model = {
            organizationUid: organizationUid,
            blockchainDomains: []
        };
        this.BlockchainDomainService = new BlockchainDomainService(this.DSUStorage);

        this.initNavigationListeners();
        this.displayBlockchainDomainsList();
    }

    initNavigationListeners() {
        this.onTagClick("back", () => {
            this.history.goBack();
        });

        this.onTagClick("initiate-blockchain-network", () => {
            this.navigateToPageTag("initiate-blockchain-network", {
                organizationUid: this.model.organizationUid
            });
        });

        this.onTagClick("join-blockchain-network", () => {
            this.navigateToPageTag("join-blockchain-network", {
                organizationUid: this.model.organizationUid
            });
        });

        this.onTagClick("edit", (model) => {
            this.navigateToPageTag("edit-blockchain-network", {
                organizationUid: this.model.organizationUid,
                blockchainDomainUid: model.uid
            });
        });

        this.onTagClick("view", (model) => {
            this.navigateToPageTag("view-blockchain-network", {
                organizationUid: this.model.organizationUid,
                blockchainDomainUid: model.uid
            });
        });

        this.onTagClick("manage-blockchain-domain", (model) => {
            this.navigateToPageTag("manage-blockchain-network", {
                organizationUid: this.model.organizationUid,
                blockchainDomainUid: model.uid
            });
        });
    }

    displayBlockchainDomainsList() {
        Loader.displayLoader();
        this.BlockchainDomainService.listBlockchainDomains(this.model.organizationUid, (err, blockchainDomains) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            this.model.hasBlockchainDomains = blockchainDomains.length > 0;
            this.model.blockchainDomains = blockchainDomains.map((domain, index) => {
                domain.lastInstallDate = domain.lastInstallDate ? getFormattedDate(domain.lastInstallDate) : "";
                domain.options = this.getOptionsViewModel(domain.isOwner, domain.uid);
                if (domain.isInstalling) {
                    this.checkForBlockchainDomainStatus(domain, index);
                }
                if(domain.isPendingRemove) {
                    this.checkForBlockchainDomainRemove(domain, index);
                }
                return domain;
            });
            Loader.hideLoader();
        });
    }

    checkForBlockchainDomainRemove(blockchainDomainData, index) {
        this.BlockchainDomainService.waitForClusterRemoveToFinish(blockchainDomainData.subdomain, (err, result) => {
            Loader.hideLoader();
            if (err) {
                return console.error(err);
            }

            console.log(result);
            blockchainDomainData.isReadyToInstall = true;
            blockchainDomainData.isInstalling = false;
            blockchainDomainData.isInstalled = false;
            blockchainDomainData.isInstallFailed = false;
            blockchainDomainData.isPendingRemove = false;
            blockchainDomainData.deploymentLogs = "";
            this.BlockchainDomainService.updateBlockchainDomainData(this.model.organizationUid, blockchainDomainData, (err, result) => {
                if (err) {
                    return console.error(err);
                }

                console.log(result);
                blockchainDomainData.lastInstallDate = getFormattedDate(blockchainDomainData.lastInstallDate);
                this.model.blockchainDomains[index] = blockchainDomainData;
                this.BlockchainDomainService.removeClusterStatus(blockchainDomainData.subdomain, (err, result) =>{
                    console.log(err, result);
                });
            });
        });
    }

    checkForBlockchainDomainStatus(blockchainDomainData, index) {
        this.BlockchainDomainService.waitForClusterInstallationToFinish(blockchainDomainData.subdomain, (err, result) => {
            blockchainDomainData.isInstalling = false;
            blockchainDomainData.isReadyToInstall = false;
            blockchainDomainData.isPendingRemove = false;
            if (err) {
                blockchainDomainData.isInstalled = false;
                blockchainDomainData.isInstallFailed = true;
                blockchainDomainData.deploymentLogs = err;
                console.error(err);
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

            this.BlockchainDomainService.updateDeploymentLogs(this.model.organizationUid, blockchainDomainData, jenkinsData, (err, result) => {
                if (err) {
                    return console.error(err);
                }

                console.log(result);
                blockchainDomainData.lastInstallDate = getFormattedDate(blockchainDomainData.lastInstallDate);
                this.model.blockchainDomains[index] = blockchainDomainData;
            });
        });
    }

    getOptionsViewModel(isOwner, blockchainDomainUid) {
        const options = [{
            tag: "view",
            name: "View",
            uid: blockchainDomainUid
        }];

        if (isOwner) {
            options.push({
                tag: "edit",
                name: "Edit",
                uid: blockchainDomainUid
            });
        }

        return options;
    }
}