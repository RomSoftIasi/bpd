const {WebcController} = WebCardinal.controllers;
import OrganizationService from "../services/OrganizationService.js";
import * as Loader from "../WebcSpinnerController.js";

export default class DeleteOrganizationController extends WebcController {
    constructor(...props) {
        super(...props);

        this.OrganisationService = new OrganizationService(this.DSUStorage);

        console.log(this.model);

        this.handleDeleteConfirmed();
        this.handleDeleteCanceled();
    }

    handleDeleteConfirmed() {
        this.onTagClick('delete:confirmed', (model, target, event) =>{
            event.preventDefault();
            event.stopImmediatePropagation();

            Loader.displayLoader();
            this.OrganisationService.unmountOrganization(this.model.uid, (err, result) => {
                Loader.hideLoader();
                if (err) {
                    return this.send("closed", err);
                }

                console.log('Removed organization with @uid', this.model.uid);
                this.send("confirmed", result);
            });
        });
    }

    handleDeleteCanceled() {
        this.onTagClick('delete:canceled', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.send("closed", undefined);
        });
    }
}