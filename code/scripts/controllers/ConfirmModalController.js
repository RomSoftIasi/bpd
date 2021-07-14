const {WebcController} = WebCardinal.controllers;

export default class ConfirmModalController extends WebcController {
    constructor(...props) {
        super(...props);

        this.model = {};
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