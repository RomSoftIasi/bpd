const {WebcController} = WebCardinal.controllers;
import OrganizationService from "../../services/e-governance/OrganizationService.js";
import BlockchainDomainService from "../../services/e-governance/BlockchainDomainService.js";
import * as Loader from "../../WebcSpinnerController.js";

export default class OrganizationsController extends WebcController {
    constructor(...props) {
        super(...props);

        this.model = {organizations: []};
        this.OrganizationService = new OrganizationService(this.DSUStorage);
        this.BlockchainDomainService = new BlockchainDomainService(this.DSUStorage);

        this.initNavigationListeners();
        this.displayOrganizationsList();
    }

    initNavigationListeners() {
        this.onTagClick("add-organization", () => {
            this.navigateToPageTag("manage-organizations");
        });

        this.onTagClick("edit-organization", (model) => {
            this.navigateToPageTag("edit-organization", {
                organizationUid: model.uid
            });
        });

        this.onTagClick("view-organization", (model) => {
            this.navigateToPageTag("view-organization", {
                organizationUid: model.uid
            });
        });

        this.onTagClick("manage-blockchain-domains", (model) => {
            this.navigateToPageTag("blockchain-domains-dashboard", {
                organizationUid: model.uid
            });
        });
    }

    displayOrganizationsList() {
        Loader.displayLoader();
        this.OrganizationService.listOrganizations((err, organizationsList) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            const updatedOrganizationsModel = []
            const updateModel = (organizationsList) => {
                if (!organizationsList.length) {
                    this.model.organizations = [...updatedOrganizationsModel];
                    return Loader.hideLoader();
                }

                const organization = organizationsList.pop();
                organization.options = this.getOptionsViewModel(organization.uid);

                this.BlockchainDomainService.listBlockchainDomains(organization.uid, (err, blockchainDomainsList) => {
                    if (err) {
                        console.error(err);
                    } else {
                        organization.numberOfClusters = blockchainDomainsList.length;
                    }

                    updatedOrganizationsModel.push(organization);
                    updateModel(organizationsList);
                });
            };

            updateModel(organizationsList);
        });
    }

    getOptionsViewModel(organizationUid) {
        return [{
            tag: "view",
            name: "View",
            uid: organizationUid
        }, {
            tag: "edit",
            name: "Edit",
            uid: organizationUid
        }];
    }
}