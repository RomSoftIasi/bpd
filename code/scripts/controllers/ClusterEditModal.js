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

export default class ClusterEditModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.model = this.setModel(this.getParsedModel(this.model))

        this.model.onChange('autoStop.value', () => {
            this.model.date.readOnly = this.model.autoStop.value == 0;
        });

        this._onClusterCreate();
        this._onClusterSave();
        this._onClusterMonitoring();
        this._onClusterDelete();
        this._onClusterGovernance();
    }

    getParsedModel(receivedModel) {
        let model = JSON.parse(JSON.stringify(initModel));
        let existingCluster = receivedModel.cluster;
        let createCluster = true;
        if (existingCluster) {
            createCluster = false;
            model = {
                ...model,
                title: 'Manage Blockchain Network Deployment',
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

    _onClusterCreate() {
        this.on('cls:create', (event) => this.respondWithResult(event));
    }

    _onClusterSave() {
        this.on('cls:save', (event) => this.respondWithResult(event));
    }

    _onClusterMonitoring() {
        this.on('cls:monitoring', (event) => {
            let toReturnObject = {
                redirect: 'monitoring'
            }
            this._finishProcess(event, toReturnObject)
        });
    }

    _onClusterGovernance() {
        this.on('cls:governance', (event) => {
            let toReturnObject = {
                redirect: 'governance'
            }
            this._finishProcess(event, toReturnObject)
        });
    }

    _onClusterDelete() {
        this.on('cls:delete', (event) => {
            this._finishProcess(event, {})
        });
    }

    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };
}
