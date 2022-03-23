const {WebcController} = WebCardinal.controllers;
import OrganizationService from "../services/OrganizationService.js";
import * as Loader from "../WebcSpinnerController.js";
import {validateFormRequiredFields} from "../../utils/utils.js";
import {getOrganizationFormViewModel} from "../../view-models/organization.js";
import {displayValidationErrorModal, validateFormFields} from "./Validator.js";

export default class DefineOrganizationController extends WebcController {
    constructor(...props) {
        super(...props);

        this.model = getOrganizationFormViewModel.call(this);
        this.OrganizationService = new OrganizationService();

        this.initNavigationListeners();
    }

    initNavigationListeners() {
        this.onTagClick("back", () => {
            this.history.goBack();
        });

        this.onTagClick("create-organization", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.createOrganization();
        });

        this.onTagClick("import-organization", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.importOrganization();
        });
    }

    importOrganization() {
        const blockchainDomainFiles = this.querySelector("#upload-files");
        if (blockchainDomainFiles && blockchainDomainFiles.files.length) {
            console.log(blockchainDomainFiles.files);
        }
    }

    createOrganization() {
        if (!this.isValidForm()) {
            return;
        }

        Loader.displayLoader();
        const organizationName = this.model.newOrganization.value;
        this.OrganizationService.isExistingOrganization(organizationName, (err, organizationExists) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            if (organizationExists) {
                Loader.hideLoader();
                return displayValidationErrorModal.call(this);
            }

            this.OrganizationService.createOrganization(organizationName, (err, result) => {
                Loader.hideLoader();
                if (err) {
                    return console.error(err);
                }

                console.log(result);
                this.navigateToPageTag("organization-dashboard");
            });
        });
    }

    isValidForm() {
        return validateFormRequiredFields.call(this) && validateFormFields.call(this);
    }
}