import BPDController from "./base-controllers/BPDController.js";

export default class OrganizationsController extends BPDController {

    constructor(element) {
        super(element);

        // reset model
        this.setModel({});

        // get model
        this.OrganisationService.getOrganizationModel((err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            //bind
            this.setModel(data);
        });


        //attach handlers
        this._attachHandlerCreateOrg();
        this._attachHandlerEditOrg();
        this._attachHandlerManageCluster();
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
            this.redirect(`/cluster/index#orgUid=${orgUid}`);
        });
    }
}




