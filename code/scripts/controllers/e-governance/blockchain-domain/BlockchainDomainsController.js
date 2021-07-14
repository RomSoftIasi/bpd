const {WebcController} = WebCardinal.controllers;
import BlockchainDomainService from "../../services/e-governance/BlockchainDomainService.js";
import {getNotificationServiceInstance} from "../../services/e-governance/NotificationService.js";
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
        this.NotificationService = getNotificationServiceInstance(this.DSUStorage);

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

                const {shortStatus} = this.translationModel.statuses[domain.dataStatus];
                domain.shortStatus = shortStatus;

                if (domain.isInstalling) {
                    this.checkForInstallPipelineStatus(domain, index);
                }
                if (domain.isUninstalling) {
                    this.checkForUninstallPipelineStatus(domain, index);
                }

                return domain;
            });
            Loader.hideLoader();
        });
    }

    checkForInstallPipelineStatus(blockchainDomainData, index) {
        this.NotificationService.checkForInstallPipelineStatus(this.model.organizationUid, blockchainDomainData, (err, updatedBlockchainDomainData) => {
            if (err) {
                return console.error(err);
            }

            console.log(updatedBlockchainDomainData);
            updatedBlockchainDomainData.lastInstallDate = getFormattedDate(updatedBlockchainDomainData.lastInstallDate);
            this.model.blockchainDomains[index] = updatedBlockchainDomainData;
        });
    }

    checkForUninstallPipelineStatus(blockchainDomainData, index) {
        this.NotificationService.checkForUninstallPipelineStatus(this.model.organizationUid, blockchainDomainData, (err, updatedBlockchainDomainData) => {
            if (err) {
                return console.error(err);
            }

            console.log(updatedBlockchainDomainData);
            updatedBlockchainDomainData.lastInstallDate = getFormattedDate(updatedBlockchainDomainData.lastInstallDate);
            this.model.blockchainDomains[index] = updatedBlockchainDomainData;
        });
    }

    getOptionsViewModel(isOwner, blockchainDomainUid) {
        const options = [{
            tag: "view",
            name: this.translate("view"),
            uid: blockchainDomainUid
        }];

        if (isOwner) {
            options.push({
                tag: "edit",
                name: this.translate("edit"),
                uid: blockchainDomainUid
            });
        }

        return options;
    }
}