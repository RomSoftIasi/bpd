const {WebcController} = WebCardinal.controllers;
import OrganizationService from "../services/OrganizationService.js";
import BlockchainDomainService from "../services/BlockchainDomainService.js";
import * as Loader from "../WebcSpinnerController.js";
import {validateFormRequiredFields} from "../../utils/utils.js";
import {getOrganizationFormViewModel} from "../../view-models/organization.js";

export default class DefineOrganizationController extends WebcController {
    constructor(...props) {
        super(...props);

        const {organizationUid} = this.getState();
        this.model = getOrganizationFormViewModel.call(this);
        this.model.organizationUid = organizationUid;
        this.OrganizationService = new OrganizationService(this.DSUStorage);
        this.BlockchainDomainService = new BlockchainDomainService(this.DSUStorage);

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

        this.onTagClick("remove-organization", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.removeOrganizationHandler();
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
        if (!validateFormRequiredFields.call(this)) {
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

    removeOrganizationHandler() {
        Loader.displayLoader();
        this.BlockchainDomainService.listBlockchainDomains(this.model.organizationUid, (err, domainsList) => {
            Loader.hideLoader();
            if (err) {
                return console.error(err);
            }

            if (domainsList.length) {
                const errorMessage = this.translate("removeOrganizationError");
                const modalConfiguration = {
                    model: {errorMessage: errorMessage},
                    controller: 'ErrorModalController',
                    disableBackdropClosing: false,
                    disableCancelButton: true,
                    confirmButtonText: this.translate("modal.confirmButtonText")
                };
                this.showModalFromTemplate('error-modal', () => { }, () => { }, modalConfiguration);
                return;
            }

            const modalConfiguration = {
                controller: 'ConfirmModalController',
                disableBackdropClosing: false
            };

            this.showModalFromTemplate('confirm-modal',
                () => {
                    this.removeOrganization();
                }, (event) => {
                    const error = event.detail || null

                    if (error && error !== true) {
                        console.error(error);
                    }
                }, modalConfiguration);
        });
    }

    removeOrganization() {
        Loader.displayLoader();
        this.OrganizationService.unmountOrganization(this.model.organizationUid, (err, result) => {
            Loader.hideLoader();
            if (err) {
                return console.error(err);
            }

            console.log(result);
            this.navigateToPageTag("organization-dashboard");
        });
    }
}