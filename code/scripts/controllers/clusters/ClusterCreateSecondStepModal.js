import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';
import ClusterControllerApi from "../../../ClustersControllerApi.js";

const initModel = {
    title: '',
    name: {
        placeholder: "Job to be executed",
        label: 'Select the job to be executed',
        required: true,
        options: []
    },
    autoStop: {
        name: "autoStop",
        required: true,
        checkboxLabel: "AutoStop",
        checkedValue: 1,
        uncheckedValue: 0,
        value: ''
    },
    date: {
        input: {
            name: "date-to-start",
            required: false,
            value: ''
        },
        readOnly: true
    },
    pipelineToken: {
        required: true,
        placeholder: 'Pipeline access token',
        label: 'Pipeline access token',
        value: ''
    }
}

export default class ClusterCreateSecondStepModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        initModel.title = this.model.title || 'Create a Blockchain Network';
        initModel.name.value = this.model.name || '';
        initModel.pipelineToken.value = this.model.pipelineToken || '';
        initModel.autoStop.checked = this.model.autoStop || '';
        initModel.date.value = this.model.date || '';
        initModel.jenkins = this.model.jenkins ;
        initModel.user = this.model.user ;
        initModel.token = this.model.token ;

        this.ClusterControllerApi = new ClusterControllerApi();

        this.model = this.setModel(JSON.parse(JSON.stringify(initModel)))
        this.ClusterControllerApi.listJenkinsPipelines(this.model.jenkins, this.model.user, this.model.token,(err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Clusters", data);
            this.model.name.options = data.map(pipeline => {
                return {
                    label: pipeline.name,
                    value: pipeline.name
                }
            });
        })

        this._attachHandlerChangeAutoStop();
        this._attachHandlerPrevStep();
        this._attachHandlerNextStep();

        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });
    }

    _attachHandlerChangeAutoStop() {
        this.model.onChange('autoStop.value', () => {
            this.model.date.readOnly = this.model.autoStop.value == 0;
        });
    }

    _attachHandlerPrevStep() {
        this.on('cls:prev', (event) => {
            this._finishProcess(event, {
                redirect: 'addClusterFirstStepModal'
            })
        });
    }

    _attachHandlerNextStep() {
        this.on('cls:next', (event) => {
            if (this.__displayErrorMessages(event)) {
                return;
            }
            let toReturnObject = {
                redirect: 'addClusterThirdStepModal',
                data: {
                    name: this.model.name.value,
                    autoStop: this.model.autoStop.value == 1,
                    date: this.model.date.value,
                    pipelineToken: this.model.pipelineToken.value
                }
            }
            this._finishProcess(event, toReturnObject)
        });
    }

    __displayErrorMessages = (event) => {
        return this.__displayErrorRequiredField(event, 'name', this.model.name.value);
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
