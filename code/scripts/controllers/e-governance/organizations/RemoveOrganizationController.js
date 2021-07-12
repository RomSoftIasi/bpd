const {WebcController} = WebCardinal.controllers;

export default class RemoveOrganizationController extends WebcController {
    constructor(...props) {
        super(...props);

        this.handleConfirm();
        this.handleCancel();
    }

    handleConfirm() {
        this.onTagClick('confirm', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.send("confirmed", undefined);
        });
    }

    handleCancel() {
        this.onTagClick('cancel', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.send("closed", undefined);
        });
    }
}