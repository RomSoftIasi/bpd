const {WebcController} = WebCardinal.controllers;
import OrganizationService from "../services/OrganizationService.js";
import BlockchainDomainService from "../services/BlockchainDomainService.js";
import * as Loader from "../WebcSpinnerController.js";
import {getFormattedDate} from "../../utils/utils.js";

export default class OrganizationsController extends WebcController {
    constructor(...props) {
        super(...props);

        this.model = {organizations: []};
        this.OrganizationService = new OrganizationService();
        this.BlockchainDomainService = new BlockchainDomainService();

        this.initNavigationListeners();
        this.displayOrganizationsList();
    }

    initNavigationListeners() {
        this.onTagClick("add-organization", () => {
            this.navigateToPageTag("define-organization");
        });

        this.onTagClick("edit", (model) => {
            this.navigateToPageTag("edit-organization", {
                organizationUid: model.uid
            });
        });

        this.onTagClick("view", (model) => {
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

            this.model.hasOrganizations = organizationsList.length > 0;
            const updatedOrganizationsModel = [];
            const updateModel = (organizationsList) => {
                if (!organizationsList.length) {
                    this.model.organizations = [...updatedOrganizationsModel];
                    return Loader.hideLoader();
                }

                const organization = organizationsList.pop();
                organization.createdAt = getFormattedDate(organization.createdAt);
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
            name: this.translate("view"),
            uid: organizationUid
        }, {
            tag: "edit",
            name: this.translate("edit"),
            uid: organizationUid
        }];
    }
}