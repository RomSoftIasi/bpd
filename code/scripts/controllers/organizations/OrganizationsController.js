const {WebcController} = WebCardinal.controllers;
import OrganizationService from "../services/OrganizationService.js";
import ClusterControllerApi from "../../../ClustersControllerApi.js";

export default class OrganizationsController extends WebcController {
    constructor(...props) {
        super(...props);

        this.model = {
            organizations: []
        };

        this.OrganisationService = new OrganizationService(this.DSUStorage);
        this.OrganisationService.getOrganizationModel((err, data) => {
            if (err) {
                console.log(err);
                return;
            }

            this.model = JSON.parse(JSON.stringify(data));
        });

        this.ClusterControllerApi = new ClusterControllerApi();

        this.attachHandlerCreateOrg();
        this.attachHandlerEditOrg();
        this.attachHandlerManageCluster();
        this.attachHandlerQRCodeShare();
        this.attachHandlerRemoveOrg();
    }

    modalErrorHandler = (event) => {
        const error = event.detail || null

        if (error && error !== true) {
            console.error(error);
        }
    }

    attachHandlerCreateOrg() {
        this.onTagClick('org:create', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            const modalConfiguration = {
                controller: 'organizations/CreateOrganizationModal',
                disableBackdropClosing: false
            };

            this.showModalFromTemplate('organizations/add-organization-modal',
                (event) => {
                    const response = event.detail;
                    console.log(response);

                    if (response.qrCodeImportRedirect === true) {
                        return this.openCreateWithQRCodeModal();
                    }

                    //todo : show spinner/loading stuff
                    this.OrganisationService.saveOrganization(response, (err, updatedOrg) => {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        this.model.organizations.push(updatedOrg);
                    });
                }, this.modalErrorHandler, modalConfiguration);
        })
    }

    openCreateWithQRCodeModal() {
        const modalConfiguration = {
            controller: 'QRCodeImportController',
            disableBackdropClosing: false
        };

        this.showModalFromTemplate('qrcode-import-modal',
            (event) => {
                const response = event.detail;
                console.log(response);

                //todo : show spinner/loading stuff
                this.OrganisationService.mountOrganization(response.keySSI, (err, org) => {
                    if (err) {
                        return console.log(err);
                    }

                    this.model.organizations.push(org);
                })
            }, this.modalErrorHandler, modalConfiguration);
    }

    attachHandlerEditOrg() {
        this.onTagClick('org:edit', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            const modalConfiguration = {
                model: model,
                controller: 'organizations/EditOrganizationModal',
                disableBackdropClosing: false
            };

            this.showModalFromTemplate('organizations/edit-organization-modal',
                (event) => {
                    const response = event.detail;
                    console.log(response);

                    //todo : show spinner/loading stuff
                    model.name = response.name;
                    model.jenkinsURL = response.jenkinsURL;
                    this.OrganisationService.updateOrganization(model, (err) => {
                        if (err) {
                            return console.error(err);
                        }

                        const orgIndex = this.model.organizations.findIndex((org) => org.uid === model.uid);
                        if (orgIndex === -1) {
                            return console.error('Org not found @uid', model.uid);
                        }

                        this.model.organizations[orgIndex] = model;
                    });
                }, this.modalErrorHandler, modalConfiguration);
        });
    }

    attachHandlerQRCodeShare() {
        this.onTagClick('org:getQRCode', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            model.description = 'Scan the code above to get your organization data';
            const modalConfiguration = {
                model: model,
                controller: 'ShareQRCodeController',
                disableBackdropClosing: false,
                disableFooter: true
            };

            this.showModalFromTemplate('share-qrcode-modal',
                (event) => {
                    const response = event.detail;
                    console.log(response);

                }, this.modalErrorHandler, modalConfiguration);
        });
    }

    attachHandlerManageCluster() {
        this.onTagClick('org:manage-clusters', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            const orgUid = model.uid;
            this.navigateToPageTag('view-clusters', orgUid);
        });
    }

    attachHandlerRemoveOrg() {
        this.onTagClick('org:remove', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            const modalConfiguration = {
                model: model,
                controller: 'organizations/DeleteOrganizationController',
                disableBackdropClosing: false
            };

            this.showModalFromTemplate('organizations/delete-organization-modal',
                (event) => {
                    const response = event.detail;
                    console.log(response);

                    const orgIndex = this.model.organizations.findIndex((org) => org.uid === model.uid);
                    if (orgIndex === -1) {
                        return console.error('Org not found @uid', model.uid);
                    }

                    this.model.organizations.splice(orgIndex, 1);
                }, this.modalErrorHandler, modalConfiguration);
        });
    }
}