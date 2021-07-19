const {WebcController} = WebCardinal.controllers;
import BlockchainDomainService from "../services/BlockchainDomainService.js";
import * as Loader from "../WebcSpinnerController.js";
import {validateFormRequiredFields} from "../../utils/utils.js";
import {getBlockchainDomainFormViewModel} from "../../view-models/blockchainDomain.js";
import {displayValidationErrorModal, validateFormFields} from "./Validator.js";

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

        Loader.displayLoader();
        const blockchainDomainData = this.getDomainData();
        const {organizationUid} = this.model;
        this.BlockchainDomainService.isExistingBlockchainDomain(organizationUid, blockchainDomainData, (err, foundDomain) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            if (foundDomain) {
                Loader.hideLoader();
                return displayValidationErrorModal.call(this, blockchainDomainData, foundDomain);
            }

            this.BlockchainDomainService.createBlockchainDomain(organizationUid, blockchainDomainData, (err, result) => {
                Loader.hideLoader();
                if (err) {
                    return console.error(err);
                }

                console.log(result);
                this.navigateToPageTag("blockchain-domains-dashboard", {
                    organizationUid: organizationUid
                });
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
        return validateFormRequiredFields.call(this) && validateFormFields.call(this);
    }
}