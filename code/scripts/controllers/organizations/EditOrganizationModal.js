const {WebcController} = WebCardinal.controllers;

export default class EditOrganizationModal extends WebcController {
    constructor(...props) {
        super(...props);

        this.onUpdateOrganization();
        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });

        this.model = this.getEditOrganizationViewModel();
    }

    onUpdateOrganization() {
        this.onTagClick('org:update', (model, target, event) => {
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

    displayErrorMessages = (event) => {
        return this.displayErrorRequiredField(event, 'Organization name', this.model.name.value);
    }

    displayErrorRequiredField(event, fieldName, field) {
        if (field === undefined || field === null || field.length === 0) {
            this.emitFeedback(event, fieldName.toUpperCase() + " field is required.", "alert-danger")
            return true;
        }
        return false;
    }

    emitFeedback(event, message, alertType) {
        if (typeof this.feedbackEmitter === 'function') {
            this.feedbackEmitter(message, "Validation", alertType)
        }
    }

    getEditOrganizationViewModel() {
        return {
            name: {
                name: 'name',
                label: 'Organization name',
                required: true,
                placeholder: 'Organization name',
                value: this.model.name
            },
            jenkinsURL: {
                name: 'Jenkins CI server URL',
                label: 'Jenkins CI server URL',
                placeholder: 'Jenkins CI server URL',
                value: this.model.jenkinsURL
            }
        }
    }
}
