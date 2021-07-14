const {WebcController} = WebCardinal.controllers;
import OrganizationService from "../services/OrganizationService.js";
import * as Loader from "../WebcSpinnerController.js";
import {validateFormRequiredFields} from "../../utils/utils.js";

export default class DefineOrganizationController extends WebcController {
    constructor(...props) {
        super(...props);

        this.model = this.getFormViewModel();
        this.OrganizationService = new OrganizationService(this.DSUStorage);

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

    createOrganization() {
        if (!validateFormRequiredFields.call(this)) {
            return;
        }

        Loader.displayLoader();
        this.OrganizationService.createOrganization(this.model.newOrganization.value, (err, result) => {
            Loader.hideLoader();
            if (err) {
                return console.error(err);
            }

            this.navigateToPageTag("organization-dashboard");
        });
    }

    importOrganization() {
        const blockchainDomainFiles = this.querySelector("#upload-files");
        if (blockchainDomainFiles && blockchainDomainFiles.files.length) {
            console.log(blockchainDomainFiles.files);
        }
    }

    getFormViewModel() {
        return {
            newOrganization: {
                placeholder: this.translate("organizationNamePlaceholder"),
                value: "",
                name: this.translate("organizationName")
            }
        };
    }
}