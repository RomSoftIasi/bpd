const {WebcController} = WebCardinal.controllers;
import OrganizationService from "../../services/e-governance/OrganizationService.js";
import * as Loader from "../../WebcSpinnerController.js";

export default class EditOrganizationController extends WebcController {
    constructor(...props) {
        super(...props);

        const {organizationUid} = this.getState();
        this.model = this.getFormViewModel();
        this.model.organizationUid = organizationUid;
        this.OrganizationService = new OrganizationService(this.DSUStorage);

        this.initNavigationListeners();
        this.getOrganizationData();
    }

    initNavigationListeners() {
        this.onTagClick("back", () => {
            this.history.goBack();
        });

        this.onTagClick("update-organization", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.updateOrganization();
        });
    }

    getOrganizationData() {
        Loader.displayLoader();
        this.OrganizationService.getOrganizationData(this.model.organizationUid, (err, organizationData) => {
            Loader.hideLoader();
            if (err) {
                return console.error(err);
            }

            this.model.newOrganization.value = organizationData.name;
            this.model.organizationData = organizationData;
        });
    }

    updateOrganization() {
        if (!this.validateRequiredFields()) {
            return;
        }

        const organizationData = this.model.toObject("organizationData");
        organizationData.name = this.model.newOrganization.value;
        Loader.displayLoader();
        this.OrganizationService.updateOrganizationData(organizationData, (err, result) => {
            Loader.hideLoader();
            if (err) {
                return console.error(err);
            }

            console.log(result);
            this.navigateToPageTag("organization-dashboard");
        });
    }

    validateRequiredFields() {
        return true;
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