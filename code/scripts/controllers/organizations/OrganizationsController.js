const { WebcController } = WebCardinal.controllers;
import OrganizationService from "../services/OrganizationService.js";
import ClusterControllerApi from "../../../ClustersControllerApi.js";
import deleteViewModel from "../../models/deleteViewModel.js";

export default class OrganizationsController extends WebcController {

    constructor(element, history) {
        super(element, history);

        this.setModel({});

        this.OrganisationService = new OrganizationService(this.DSUStorage);
        this.OrganisationService.getOrganizationModel((err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            this.setModel(data);
        });

        this.ClusterControllerApi = new ClusterControllerApi();

        this._attachHandlerCreateOrg();
        this._attachHandlerEditOrg();
        this._attachHandlerManageCluster();
        this._attachHandlerQRCodeShare();
        this._attachHandlerRemoveOrg();
    }

    _attachHandlerCreateOrg() {
        this.on('org:create', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.showModal('addOrganizationModal', {}, (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }

                if (data.qrCodeImportRedirect) {
                    this.showModal('qrCodeImportModal', {}, (err, keySSIModel) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        const keySSI = keySSIModel.value;
                        this.OrganisationService.mountOrganization(keySSI, (err, org) => {
                            if (err) {
                                return console.log(err);
                            }
                            this.model.organizations.push(org);
                        })
                    });
                } else {
                    //todo : show spinner/loading stuff
                    this.OrganisationService.saveOrganization(data, (err, updatedOrg) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        this.model.organizations.push(updatedOrg);
                    });
                }
            })
        })
    }

    _attachHandlerEditOrg() {
        this.on('org:edit', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            const uid = e.data;
            const orgIndex = this.model.organizations.findIndex((org) => org.uid === uid);
            if (orgIndex === -1) {
                console.log('org not found @uid', uid, this.model.organizations);
                return;
            }

            const orgToEdit = this.model.organizations[orgIndex];
            this.showModal('editOrganizationModal', orgToEdit, (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }
                //todo : show spinner/loading stuff
                this.OrganisationService.updateOrganization(data, (err) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    this.model.organizations[orgIndex] = data;
                });
            })
        })
    }

    _attachHandlerManageCluster() {
        this.on('org:manage-clusters', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            const orgUid = e.data;
            this.History.navigateToPageByTag('view-clusters', orgUid);
        });
    }

    _attachHandlerQRCodeShare() {
        this.on('org:getQRCode', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            const uid = e.data;
            const orgIndex = this.model.organizations.findIndex((org) => org.uid === uid);
            if (orgIndex === -1) {
                console.log('org not found @uid', uid, this.model.organizations);
                return;
            }

            const orgToShare = this.model.organizations[orgIndex];

            let qrCodeModalModel = {
                title: `QRCode for ${orgToShare.name}`,
                description: `Scan the code above to get your organization data`,
                data: {
                    identifier: orgToShare.uid
                }
            }
            console.log('Org to share UID : ', orgToShare.uid);
            this.showModal('shareQRCodeModal', qrCodeModalModel);
        });
    }

    _attachHandlerRemoveOrg() {
        this.on('org:remove', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            const uid = e.data;
            deleteViewModel.selectedItemName = e.data;

            this.showModal('deleteOrganizationModal', deleteViewModel, (err, response) => {
                if (err) {
                    return this.feedbackEmitter(err, null, "an error occured");
                }

                if (response.success) {
                    const orgIndex = this.model.organizations.findIndex((org) => org.uid === uid);
                    if (orgIndex === -1) {
                        console.log('Org not found @uid', uid, this.model.organizations);
                        return;
                    }

                    this.model.organizations.splice(orgIndex, 1);
                }
            });
        });
    }
}