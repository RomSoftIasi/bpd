const {WebcController} = WebCardinal.controllers;
import GovernanceService from "../../services/GovernanceService.js";
import * as Loader from "../../WebcSpinnerController.js";

export default class OrganizationsController extends WebcController {
    constructor(...props) {
        super(...props);

        this.model = {organizations: []};
        this.GovernanceService = new GovernanceService(this.DSUStorage);

        this.initNavigationListeners();
        this.displayOrganizationsList();
    }

    initNavigationListeners() {
        this.onTagClick("add-organization", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.navigateToPageTag("manage-organizations");
        });

        this.onTagClick("edit-organization", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.navigateToPageTag("edit-organization", model.uid);
        });

        this.onTagClick("view-organization", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.navigateToPageTag("view-organization", model.uid);
        });

        this.onTagClick("manage-blockchain-domains", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.navigateToPageTag("blockchain-domains-dashboard", model.uid);
        });
    }

    displayOrganizationsList() {
        Loader.displayLoader();
        this.GovernanceService.listOrganizations((err, organizationsList) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            this.model.organizations = organizationsList.map(organization => {
                organization.options = this.getOptionsViewModel();
                return organization;
            });
            Loader.hideLoader();
        });
    }

    getOptionsViewModel() {
        return [{
            tag: "view",
            name: "View"
        }, {
            tag: "edit",
            name: "Edit"
        }];
    }
}