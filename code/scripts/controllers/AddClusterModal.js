import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';

const initModel = {
    title: 'Add a new cluster',
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

export default class AddClusterModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.model = this.setModel(this.getParsedModel(this.model))
        debugger

        this.model.onChange('autoStop.value', () => {
            this.model.date.readOnly = this.model.autoStop.value == 0;
        });

        this.createCluster();
        this.saveCluster();
        this.deleteCluster();
    }

    getParsedModel(receivedModel) {
        let model = JSON.parse(JSON.stringify(initModel));
        let existingCluster = receivedModel.cluster;
        let createCluster = true;
        if (existingCluster) {
            createCluster = false;
            model = {
                ...model,
                title: 'Manage Cluster Deployment',
                name: {
                    ...model.name,
                    value: existingCluster.name
                },
                autoStop: {
                    ...model.autoStop,
                    value: existingCluster.config.autoStop
                },
                date: {
                    ...model.date,
                    readOnly: existingCluster.config.autoStop === 0
                },
                link: {
                    ...model.link,
                    value: existingCluster.config.configRepoUrl
                }
            }
        }

        return {
            ...model,
            createCluster: createCluster,
        };
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

    createCluster() {
        this.on('cls:create', (event) => this.respondWithResult(event));
    }

    saveCluster() {
        this.on('cls:save', (event) => this.respondWithResult(event));
    }

    deleteCluster() {
        this.on('cls:delete', (event) => {
            this._finishProcess(event, {})
        });
    }


    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };
}
