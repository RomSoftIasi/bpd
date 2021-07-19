const {WebcController} = WebCardinal.controllers;
import BlockchainDomainService from "../services/BlockchainDomainService.js";
import * as Loader from "../WebcSpinnerController.js";
import {validateFormRequiredFields} from "../../utils/utils.js";
import {getBlockchainDomainFormViewModel, getReadOnlyFields} from "../../view-models/blockchainDomain.js";
import {displayValidationErrorModal, validateFormFields} from "./Validator.js";

export default class EditBlockchainDomainController extends WebcController {
    constructor(...props) {
        super(...props);

        const {organizationUid, blockchainDomainUid} = this.getState();
        this.model = {
            organizationUid: organizationUid,
            blockchainDomainUid: blockchainDomainUid,
            blockchainDomainModel: {...getBlockchainDomainFormViewModel.call(this)}
        };
        this.BlockchainDomainService = new BlockchainDomainService(this.DSUStorage);

        this.initNavigationListeners();
        this.getBlockchainDomainInformation(organizationUid, blockchainDomainUid);
    }

    initNavigationListeners() {
        this.onTagClick("back", () => {
            this.history.goBack();
        });

        this.onTagClick("update-network", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            if (this.model.previousBlockchainDomainData.isInstalling) {
                // Block updating domain data when installation is in progress to avoid overwriting deployment logs
                return this.navigateToPageTag("blockchain-domains-dashboard", {
                    organizationUid: this.model.organizationUid
                });
            }

            this.updateNetwork();
        });
    }

    getBlockchainDomainInformation(organizationUid, blockchainDomainUid) {
        Loader.displayLoader();
        this.BlockchainDomainService.getBlockchainDomainData(organizationUid, blockchainDomainUid, (err, blockchainDomainData) => {
            Loader.hideLoader();
            if (err) {
                return console.error(err);
            }

            const {status} = this.translationModel.statuses[blockchainDomainData.dataStatus];
            this.model.dataStatus = blockchainDomainData.dataStatus;
            this.model.status = status;
            this.model.organizationUid = organizationUid;
            this.model.previousBlockchainDomainData = blockchainDomainData;
            this.setDomainData(blockchainDomainData);
            this.model.blockchainDomainModel.blockchainDomainUid = blockchainDomainUid;
        });
    }

    updateNetwork() {
        if (!this.isValidForm()) {
            return;
        }

        Loader.displayLoader();
        const {organizationUid, blockchainDomainUid} = this.model;
        const blockchainDomainData = {
            ...this.model.toObject("previousBlockchainDomainData"),
            ...this.getDomainData()
        };
        this.BlockchainDomainService.isExistingBlockchainDomain(organizationUid, blockchainDomainData, blockchainDomainUid, (err, foundDomain) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            if (foundDomain) {
                Loader.hideLoader();
                return displayValidationErrorModal.call(this, blockchainDomainData, foundDomain);
            }

            this.BlockchainDomainService.updateDomain(organizationUid, blockchainDomainData, (err, result) => {
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

    setDomainData(domainData) {
        const readOnlyFields = getReadOnlyFields(domainData.dataStatus);
        const domainModel = this.model.toObject("blockchainDomainModel");
        Object.keys(domainModel).forEach(key => {
            this.model.blockchainDomainModel[key].value = domainData[key];
            this.model.blockchainDomainModel[key].readonly = readOnlyFields.findIndex(field => field === key) !== -1;
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