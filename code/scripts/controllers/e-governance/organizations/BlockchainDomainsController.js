const {WebcController} = WebCardinal.controllers;
import BlockchainDomainService from "../../services/e-governance/BlockchainDomainService.js";
import * as Loader from "../../WebcSpinnerController.js";

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

            this.model.blockchainDomains = blockchainDomains.map(domain => {
                domain.options = this.getOptionsViewModel(domain.isOwner, domain.uid);
                return domain;
            });
            Loader.hideLoader();
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