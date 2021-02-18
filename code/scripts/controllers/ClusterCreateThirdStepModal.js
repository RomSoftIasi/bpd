import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';

const initModel = {
    title: '',
    config: {
        label: "Deployment configuration",
        name: "configuration",
        required: true,
        placeholder: "{\n" +
            "\t\"registry\": \"docker.io\"\n" +
            "}",
        value: ''
    },
}

export default class ClusterCreateThirdStepModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        initModel.title = this.model.title || 'Create a Blockchain Network';
        initModel.config.value = this.model.config || '';
        this.model = this.setModel(JSON.parse(JSON.stringify(initModel)))

        this._attachHandlerPrevStep();
        this._attachHandlerNextStep();

        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });
    }

    _attachHandlerPrevStep() {
        this.on('cls:prev', (event) => {
            this._finishProcess(event, {
                redirect: 'addClusterSecondStepModal'
            })
        });
    }
    _attachHandlerNextStep() {
        this.on('cls:next', (event) => {
            let toReturnObject = {
                data: {
                    config: this.model.config.value
                }
            }
            this._finishProcess(event, toReturnObject)
        });
    }

    __displayErrorMessages = (event) => {
        return this.__displayErrorRequiredField(event, 'name', this.model.config.value);
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
