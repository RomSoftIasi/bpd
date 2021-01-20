import ContainerController from '../../cardinal/controllers/base-controllers/ContainerController.js';
import OrganizationService from '../controllers/Services/OrganizationService.js';
export default class BPDController extends ContainerController {

    constructor(element) {
        super(element);

        // reset model
        this.setModel({});

        // get model
        this.OrganisationService = new OrganizationService(this.DSUStorage);
        this.OrganisationService.getOrganizationModel( (err,data) => {
            if (err){
                console.log(err);
                return;
            }
            //bind
            this.setModel(data);
        });



        //attach handlers
        this._attachHandlerCreateOrg();
        this._attachHandlerEditOrg();
    }



    _attachHandlerCreateOrg(){
        this.on('org:create', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            this.showModal('addOrganizationModal',{},(err, data) => {
                if (err)
                {
                    console.log(err);
                    return;
                }
                //todo : show spinner/loading stuff
                this.OrganisationService.saveOrganization(data, (err, updatedOrg) => {
                    if (err)
                    {
                        console.log(err);
                        return;
                    }
                    this.model.organizations.push(updatedOrg);
                });

            })

        })
    }

    _attachHandlerEditOrg(){
        this.on('org:edit',(e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log(e);
            const uid = e.data;
            const orgIndex = this.model.organizations.findIndex((org) => org.uid === uid);
            if (orgIndex === -1)
            {
                console.log('org not found @uid', uid, this.model.organizations);
                return;
            }

            const orgToEdit = this.model.organizations[orgIndex];
            this.showModal('editOrganizationModal',orgToEdit, (err, data) => {
                if (err)
                {
                    console.log(err);
                    return;
                }
                this.model.organizations[orgIndex] = data;
            })
        })
    }




}




