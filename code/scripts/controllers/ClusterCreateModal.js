import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';

const initModel = {
    title: 'Add a new Blockchain Network',
    name: {
        name: 'name',
        required: true,
        placeholder: 'Cluster name',
        value: ''
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
    link: {
        label: 'Link to the GIT project with cluster configuration or other configuration UI',
        name: 'link',
        required: true,
        placeholder: 'Link',
        value: ''
    }
}

export default class ClusterCreateModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.model = this.setModel(JSON.parse(JSON.stringify(initModel)))

        this._attachHandlerChangeAutoStop();
        this._attachHandlerCreateCluster();

        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });
    }

    _attachHandlerChangeAutoStop() {
        this.model.onChange('autoStop.value', () => {
            this.model.date.readOnly = this.model.autoStop.value == 0;
        });
    }

    _attachHandlerCreateCluster() {

        this.on('cls:create', (event) => {
            if (this.__displayErrorMessages(event)) {
                return;
            }
            this._respondWithResult(event)
        });
    }

    _respondWithResult(event) {
        let toReturnObject = {
            name: this.model.name.value,
            autoStop: this.model.autoStop.value==1,
            date: this.model.date.value,
            link: this.model.link.value,
        }

        this._finishProcess(event, toReturnObject)
    }

    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };

    __displayErrorMessages = (event) => {
        return this.__displayErrorRequiredField(event, 'name', this.model.name.value) ||
             this.__displayErrorRequiredField(event, 'link', this.model.link.value) ;
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
}
