import ModalController from "../../../cardinal/controllers/base-controllers/ModalController.js";
import OrganizationService from "./Services/OrganizationService.js";


export default class DeleteOrganizationController extends ModalController {
    constructor(element, history) {
        super(element, history);
        this._initListeners();
        this.OrganisationService = new OrganizationService(this.DSUStorage);

    }

    _initListeners() {
        this.on('delete', this._handleDeleteModalActions.bind(this));
    };

    _handleDeleteModalActions(event) {
        event.stopImmediatePropagation();

        if (event.data === 'confirm-delete') {

            const uid =  this.model.selectedItemName;
            this.OrganisationService.unmountOrganization(uid, (err, result) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log('Removed organization with @uid', uid);
              this.responseCallback(undefined, {
                            success: true
                        });

            });

        }

        this.responseCallback();
    }
}