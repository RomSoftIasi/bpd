const {WebcController} = WebCardinal.controllers;
import BlockchainDomainService from "../services/BlockchainDomainService.js";
import * as Loader from "../WebcSpinnerController.js";
import {validateFormRequiredFields} from "../../utils/utils.js";
import {getBlockchainDomainFormViewModel} from "../../view-models/blockchainDomain.js";

export default class InitiateBlockchainDomainController extends WebcController {
    constructor(...props) {
        super(...props);

        const organizationUid = this.getState().organizationUid;
        this.model = {
            organizationUid: organizationUid,
            blockchainDomainModel: {...getBlockchainDomainFormViewModel.call(this)}
        };
        this.BlockchainDomainService = new BlockchainDomainService(this.DSUStorage);

        this.initNavigationListeners();
    }

    initNavigationListeners() {
        this.onTagClick("back", () => {
            this.history.goBack();
        });

        this.onTagClick("save-network", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.saveNetwork();
        });
    }

    saveNetwork() {
        if (!this.isValidForm()) {
            return;
        }

        const blockchainDomainData = this.getDomainData();
        Loader.displayLoader();
        this.BlockchainDomainService.createBlockchainDomain(this.model.organizationUid, blockchainDomainData, (err, result) => {
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

    getDomainData() {
        const domainData = {};
        const domainModel = this.model.toObject("blockchainDomainModel");
        Object.keys(domainModel).forEach(key => {
            domainData[key] = domainModel[key].value;
        });

        return domainData;
    }

    isValidForm() {
        // TODO: Update with other types of validations
        return validateFormRequiredFields.call(this);
    }
}