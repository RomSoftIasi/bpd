const {WebcController} = WebCardinal.controllers;
import GovernanceService from "../../services/GovernanceService.js";
import * as Loader from "../../WebcSpinnerController.js";

export default class BlockchainDomainsController extends WebcController {
    constructor(...props) {
        super(...props);

        const uid = this.history.win.history.state.state;
        this.model = {
            uid: uid,
            blockchainDomains: []
        };
        this.GovernanceService = new GovernanceService(this.DSUStorage);

        this.initNavigationListeners();
        this.displayBlockchainDomainsList();
    }

    initNavigationListeners() {
        this.onTagClick("back", (model, target, event) =>{
            event.preventDefault();
            event.stopImmediatePropagation();

            window.history.back();
        });

        this.onTagClick("initiate-blockchain-network", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.navigateToPageTag("initiate-blockchain-network");
        });

        this.onTagClick("join-blockchain-network", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.navigateToPageTag("join-blockchain-network");
        });

        this.onTagClick("edit-blockchain-network", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.navigateToPageTag("edit-blockchain-network", model.uid);
        });

        this.onTagClick("view-blockchain-network", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.navigateToPageTag("view-blockchain-network", model.uid);
        });

        this.onTagClick("manage-blockchain-network", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.navigateToPageTag("manage-blockchain-network", model.uid);
        });
    }

    displayBlockchainDomainsList() {
        Loader.displayLoader();
        this.GovernanceService.listBlockchainDomains(this.model.uid, (err, blockchainDomains) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            this.model.blockchainDomains = blockchainDomains;
            Loader.hideLoader();
        });
    }
}