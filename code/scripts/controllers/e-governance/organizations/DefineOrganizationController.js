const {WebcController} = WebCardinal.controllers;
import OrganizationService from "../../services/e-governance/OrganizationService.js";
import * as Loader from "../../WebcSpinnerController.js";

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
        if (!this.model.newOrganization.value.trim().length) {
            return console.error("Organization name cannot be empty!");
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
                placeholder: "Organization name (e.g. Novartis)",
                value: ""
            }
        };
    }
}