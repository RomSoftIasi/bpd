import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';

const initModel = {
    title: '',
    endpoint: {
        name: 'endpoint',
        label: 'Endpoint',
        required: true,
        placeholder: 'Endpoint',
        value: ''
    },
    jenkins: {
        name: 'jenkins',
        label: 'Jenkins',
        required: true,
        placeholder: 'http://jenkins/CI/Server/URL',
        value: 'http://jenkins/CI/Server/URL'
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
    }
}

export default class ClusterCreateFirstStepModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        initModel.title = this.model.title || 'Create a Blockchain Network';
        initModel.endpoint.value = this.model.endpoint || window.location.origin;
        initModel.jenkins.value = this.model.jenkins || initModel.jenkins.value;
        initModel.user.value = this.model.user || initModel.user.value;
        initModel.token.value = this.model.token || initModel.token.value;

        this.model = this.setModel(JSON.parse(JSON.stringify(initModel)))

        this._attachHandlerNextStep();

        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });
    }

    _attachHandlerNextStep() {
        this.on('cls:next', (event) => {
            if (this.__displayErrorMessages(event)) {
                return;
            }
            let toReturnObject = {
                redirect: 'addClusterSecondStepModal',
                data: {
                    jenkins: this.model.jenkins.value,
                    user: this.model.user.value,
                    token: this.model.token.value
                }
            }
            this._finishProcess(event, toReturnObject)
        });
    }

    __displayErrorMessages = (event) => {
        return this.__displayErrorRequiredField(event, 'jenkins', this.model.jenkins.value) ||
            this.__displayErrorRequiredField(event, 'user', this.model.user.value) ||
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
