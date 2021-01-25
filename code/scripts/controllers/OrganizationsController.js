import ContainerController from '../../../cardinal/controllers/base-controllers/ContainerController.js';
import OrganizationService from "./Services/OrganizationService.js";

export default class OrganizationsController extends ContainerController {

    constructor(element, history) {
        super(element, history);

        // reset model
        this.setModel({});

        // get model
        this.OrganisationService = new OrganizationService(this.DSUStorage);
        this.OrganisationService.getOrganizationModel((err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            //bind
            this.setModel(data);

            // SHORTCIRCUIT FOR DEVELOPMENT -- TO BE REMOVED
            let aux = {
                name: "this.model.name.value",
                hosting: "this.model.hosting.value",
                endpoint: "this.model.endpoint.value",
                secretKey: "this.model.secretKey.value",
                kubernetesConfig: []
            }
            this.OrganisationService.saveOrganization(aux, (err, updatedOrg) => {
                if (err) {
                    console.log(err);
                    return;
                }
                this.model.organizations.push(updatedOrg);
            });
            // END OF SHORTCIRCUIT

        });


        //attach handlers
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
                //todo : show spinner/loading stuff
                this.OrganisationService.saveOrganization(data, (err, updatedOrg) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    this.model.organizations.push(updatedOrg);
                });

            })

        })
    }

    _attachHandlerEditOrg() {
        this.on('org:edit', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log(e);
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
            this.showModal('shareQRCodeModal', qrCodeModalModel);
        });
    }

    _attachHandlerRemoveOrg() {
        this.on('org:remove', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            const uid = e.data;
            const orgIndex = this.model.organizations.findIndex((org) => org.uid === uid);
            if (orgIndex === -1) {
                console.log('org not found @uid', uid, this.model.organizations);
                return;
            }
            this.model.organizations.splice(orgIndex, 1);
        });
    }
}




