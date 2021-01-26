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

        this.model.onChange('autoStop.value', () => {
            this.model.date.readOnly = this.model.autoStop.value == 0;
        });

        this.on('cls:create', (event) => {
            this.respondWithResult(event)
        });
    }

    respondWithResult(event) {
        let toReturnObject = {
            name: this.model.name.value,
            autoStop: this.model.autoStop.value,
            date: this.model.date.value,
            link: this.model.link.value,
        }
        this._finishProcess(event, toReturnObject)
    }

    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };
}
