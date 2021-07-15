const {WebcController} = WebCardinal.controllers;
import BlockchainDomainService from "../services/BlockchainDomainService.js";
import * as Loader from "../WebcSpinnerController.js";
import {validateFormRequiredFields} from "../../utils/utils.js";
import {getBlockchainDomainFormViewModel} from "../../view-models/blockchainDomain.js";

export default class EditBlockchainDomainController extends WebcController {
    constructor(...props) {
        super(...props);

        const {organizationUid, blockchainDomainUid} = this.getState();
        this.model = {blockchainDomainModel: {...getBlockchainDomainFormViewModel.call(this)}};
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
        const blockchainDomainData = {
            ...this.model.toObject("previousBlockchainDomainData"),
            ...this.getDomainData()
        };
        this.BlockchainDomainService.updateDomain(this.model.organizationUid, blockchainDomainData, (err, result) => {
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

    setDomainData(domainData) {
        const domainModel = this.model.toObject("blockchainDomainModel");
        Object.keys(domainModel).forEach(key => {
            this.model.blockchainDomainModel[key].value = domainData[key];
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