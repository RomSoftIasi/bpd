import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';

const initModel = {
    title: '',
    disableAll: false,
    name: {
        name: 'name',
        label: 'Blockchain name',
        required: true
    },
    jenkins: {
        name: 'jenkins',
        label: 'Jenkins',
        required: true,
    },
    user: {
        name: 'user',
        label: 'User',
        required: true,
    },
    token: {
        name: 'token',
        label: 'Authorization token',
        required: true,
    },
    config: {
        label: "Deployment configuration",
        name: "configuration",
        required: true
    }
}

export default class InitiateEditNetworkModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        initModel.title = this.model.title || 'Initiate Network';
        initModel.jenkins.value = this.model.jenkins;
        initModel.user.value = this.model.user;
        initModel.token.value = this.model.token;
        initModel.name.value = this.model.name;
        initModel.config.value = this.model.config;
        initModel.clusterStatus = this.model.clusterStatus;
        initModel.clusterOperation = this.model.clusterOperation;
        this.model = this.setModel(JSON.parse(JSON.stringify(initModel)))
        this.model.disableAll = this.model.clusterStatus === 'Installed' || this.model.clusterStatus === 'Pending'

        this._attachHandlerUpdateNetwork();

        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });
    }

    _attachHandlerUpdateNetwork() {
        this.on('cls:update', (event) => {
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
