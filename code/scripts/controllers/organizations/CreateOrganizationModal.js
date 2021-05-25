const {WebcController} = WebCardinal.controllers;

export default class CreateOrganizationModal extends WebcController {
    constructor(...props) {
        super(...props);

        this.model = this.getCreateOrganizationViewModel();

        this.attachCreateOrganizationHandler();
        this.attachCreateWithQRCodeHandler();
        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });
    }

    attachCreateOrganizationHandler = () => {
        this.onTagClick('org:create', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            if (this.displayErrorMessages(event)) {
                return;
            }

            let result = {
                name: this.model.name.value,
                jenkinsURL: this.model.jenkinsURL.value
            };

            this.send("confirmed", result);
        });
    }

    attachCreateWithQRCodeHandler = () => {
        this.onTagClick('org:create-with-qrcode', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            let result = {
                qrCodeImportRedirect: true
            };

            this.send("confirmed", result);
        });
    }

    displayErrorMessages = (event) => {
        return this.displayErrorRequiredField(event, this.model.name.label, this.model.name.value)
    }

    displayErrorRequiredField(event, fieldName, field) {
        if (field === undefined || field === null || field.length === 0) {
            this.emitFeedback(event, fieldName.toUpperCase() + " field is required.", "alert-danger");
            return true;
        }

        return false;
    }

    emitFeedback(event, message, alertType) {
        if (typeof this.feedbackEmitter === 'function') {
            this.feedbackEmitter(message, "Validation", alertType)
        }
    }

    getCreateOrganizationViewModel() {
        return {
            name: {
                name: 'name',
                label: 'Organization Name',
                required: true,
                placeholder: 'Organization name',
                value: ''
            },
            jenkinsURL: {
                name: 'Jenkins CI server URL',
                label: 'Jenkins CI server URL',
                placeholder: 'Jenkins CI server URL',
                value: 'http://Jenkins/CI/Server/URL'
            }
        }
    }
}
