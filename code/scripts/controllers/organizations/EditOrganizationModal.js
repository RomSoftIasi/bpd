import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';

const initModel = {
    title: 'Add a new organization',
    name: {
        name: 'name',
        label: 'Organization name',
        required: true,
        placeholder: 'Organization name',
        value: ''
    },
    jenkinsURL: {
        name: 'Jenkins CI server URL',
        label: 'Jenkins CI server URL',
        placeholder: 'Jenkins CI server URL',
        value: 'http://Jenkins/CI/Server/URL'
    },
    loadWithQR: "Load with QRCode"
}

export default class EditOrganizationModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.setModel(this.getParsedModel(this.model))
        this._onUpdateOrganization();
        this._initListeners();
    }

    _initListeners = () => {
        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });
    };

    getParsedModel(receivedModel) {
        let model = JSON.parse(JSON.stringify(initModel));
        model = {
            ...model,
            uid: receivedModel.uid,
            title: 'Edit the organization',
            name: {
                ...model.name,
                value: receivedModel.name
            },
            jenkinsURL: {
                ...model.jenkinsURL,
                value: receivedModel.jenkinsURL
            }
        }
        return model;
    }

    _onUpdateOrganization() {
        this.on('org:update', (event) => {
            if (this.__displayErrorMessages(event)) {
                return;
            }

            let toReturnObject = {
                uid: this.model.uid,
                name: this.model.name.value,
                jenkinsURL: this.model.jenkinsURL.value,
            }
            if (typeof this.model.uid !== undefined) {
                toReturnObject.uid = this.model.uid;
            }
            this._finishProcess(event, toReturnObject)
        });
    }

    __displayErrorMessages = (event) => {
        return this.__displayErrorRequiredField(event, 'Organization name', this.model.name.value);
    }

    __displayErrorRequiredField(event, fieldName, field) {
        if (field === undefined || field === null || field.length === 0) {
            this._emitFeedback(event, fieldName.toUpperCase() + " field is required.", "alert-danger")
            return true;
        }
        return false;
    }

    _emitFeedback(event, message, alertType) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (typeof this.feedbackEmitter === 'function') {
            this.feedbackEmitter(message, "Validation", alertType)
        }
    }

    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };
}
