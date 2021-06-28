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

            this.navigateToPageTag("add-organization");
        });

        this.onTagClick("manage", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.navigateToPageTag("manage-blockchain-domain");
        });
    }

    displayOrganizationsList() {
        Loader.displayLoader();
        this.GovernanceService.listOrganizations((err, organizationsList) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            this.model.organizations = organizationsList;
            Loader.hideLoader();
        });
    }
}