import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';

const initModel = {
    title: 'Add a new organization',
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
    },
    loadWithQR: "Load with QRCode"
}

export default class CreateOrganizationModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.setModel(JSON.parse(JSON.stringify(initModel)));
        this._initListeners();
    }

    _initListeners = () => {
        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });

        this.on('org:create', this._attachHandlerOrganizationCreate);
        this.on('org:create-with-qrcode', this._attachHandlerOrganizationImport);
    };

    _attachHandlerOrganizationCreate = (event) => {
        if (this.__displayErrorMessages(event)) {
            return;
        }

        let toReturnObject = {
            name: this.model.name.value,
            jenkinsURL: this.model.jenkinsURL.value
        }
        this._finishProcess(event, toReturnObject)
    }

    _attachHandlerOrganizationImport = (event) => {
        this._finishProcess(event, {
            qrCodeImportRedirect: true
        })
    }

    __displayErrorMessages = (event) => {
        return this.__displayErrorRequiredField(event, 'Organization name', this.model.name.value)
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
