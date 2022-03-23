const {WebcController} = WebCardinal.controllers;
import OrganizationService from "../services/OrganizationService.js";
import BlockchainDomainService from "../services/BlockchainDomainService.js";
import * as Loader from "../WebcSpinnerController.js";
import {validateFormRequiredFields} from "../../utils/utils.js";
import {getOrganizationFormViewModel} from "../../view-models/organization.js";
import {displayValidationErrorModal, validateFormFields} from "./Validator.js";

export default class DefineOrganizationController extends WebcController {
    constructor(...props) {
        super(...props);

        const {organizationUid} = this.getState();
        this.model = getOrganizationFormViewModel.call(this);
        this.model.organizationUid = organizationUid;
        this.OrganizationService = new OrganizationService();
        this.BlockchainDomainService = new BlockchainDomainService();

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
        if (!this.isValidForm()) {
            return;
        }

        Loader.displayLoader();
        const organizationName = this.model.newOrganization.value;
        this.OrganizationService.isExistingOrganization(organizationName, this.model.organizationUid, (err, organizationExists) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            if (organizationExists) {
                Loader.hideLoader();
                return displayValidationErrorModal.call(this);
            }

            const organizationData = this.model.toObject("organizationData");
            organizationData.name = organizationName;
            Loader.displayLoader();
            this.OrganizationService.updateOrganizationData(organizationData, (err, result) => {
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
                this.showModalFromTemplate('error-modal', () => {
                }, () => {
                }, modalConfiguration);
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