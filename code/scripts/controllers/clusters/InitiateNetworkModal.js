import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';

const initModel = {
    title: '',
    clusterOperation: 'initiateNetwork',
    clusterStatus: 'None',
    disableAll: false,
    name: {
        name: 'name',
        label: 'Blockchain name',
        required: true,
        placeholder: 'Enter blockchain name (eg. ePI)',
        value: ''
    },
    jenkins: {
        name: 'jenkins',
        label: 'Jenkins',
        required: true,
        placeholder: 'http://jenkins/CI/Server/URL'
    },
    user: {
        name: 'user',
        label: 'User',
        required: true,
        placeholder: 'Jenkins user name'
    },
    token: {
        name: 'token',
        label: 'Authorization token',
        required: true,
        placeholder: 'Jenkins authorization token'
    },
    config: {
        label: "Deployment configuration",
        name: "configuration",
        required: true,
        placeholder: "{\n" +
            "\t\"registry\": \"docker.io\"\n" +
            "}",
        value: "{\n" +
            "\t\"registry\": \"docker.io\"\n" +
            "}"
    }
}

export default class InitiateNetworkModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        initModel.title = this.model.title || 'Initiate Network';
        initModel.jenkins.value = this.model.jenkins || initModel.jenkins.value;
        initModel.user.value = this.model.user || initModel.user.value;
        initModel.token.value = this.model.token || initModel.token.value;
        initModel.name.value = this.model.name || initModel.name.value;
        initModel.config.value = this.model.config || initModel.config.value;
        initModel.clusterStatus = this.model.clusterStatus || 'None';
        this.model = this.setModel(JSON.parse(JSON.stringify(initModel)))
        this.model.disableAll = this.model.clusterStatus === 'Installed' || this.model.clusterStatus === 'Pending'

        this._attachHandlerSaveNetwork();

        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });
    }

    _attachHandlerSaveNetwork() {
        this.on('cls:save', (event) => {
            if (this.__displayErrorMessages(event)) {
                return;
            }
            let toReturnObject = {
                data: {
                    name: this.model.name.value,
                    jenkins: this.model.jenkins.value,
                    user: this.model.user.value,
                    token: this.model.token.value,
                    config: this.model.config.value,
                    clusterOperation: this.model.clusterOperation,
                    clusterStatus: this.model.clusterStatus
                }
            }
            this._finishProcess(event, toReturnObject)
        });
    }

    __displayErrorMessages = (event) => {
        return this.__displayErrorRequiredField(event, 'jenkins', this.model.jenkins.value) ||
            this.__displayErrorRequiredField(event, 'user', this.model.user.value) ||
            this.__displayErrorRequiredField(event, 'name', this.model.user.value) ||
            this.__displayErrorRequiredField(event, 'token', this.model.token.value);
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
