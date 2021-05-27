const {WebcController} = WebCardinal.controllers;

export default class QRCodeImportController extends WebcController {
    constructor(...props) {
        super(...props);

        this.model = {
            keySSI: {
                placeholder: "KeySSI",
                value: ""
            }
        };

        this.importOnClick();
        this.on('openFeedback', (message) => {
            this.feedbackEmitter = message;
        });
    }

    importOnClick() {
        this.onTagClick('import:send', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            if (this.displayErrorRequiredField("KeySSI", this.model.keySSI.value)) {
                return;
            }

            this.send("confirmed", {keySSI: this.model.keySSI.value});
        });
    }

    displayErrorRequiredField(fieldName, field) {
        if (field === undefined || field === null || field.length === 0) {
            this.emitFeedback(fieldName + " field is required.", "alert-danger");
            return true;
        }

        return false;
    }

    emitFeedback(message, alertType) {
        if (typeof this.feedbackEmitter === 'function') {
            this.feedbackEmitter(message, "Validation", alertType)
        }
    }
}
