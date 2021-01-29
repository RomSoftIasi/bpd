import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';

const initModel = {
    title: 'Manage Blockchain Network Deployment',
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
        debugger
        this.model = this.setModel(this._getParsedModel(this.model))

        this._attachHandlerChangeAutoStop();
        this._attachHandlerSaveCluster();
        this._attachHandlerMonitoringCluster();
        this._attachHandlerDeleteCluster();
        this._attachHandlerGovernanceCluster();
    }

    _attachHandlerChangeAutoStop() {
        this.model.onChange('autoStop.value', () => {
            this.model.date.readOnly = this.model.autoStop.value == 0;
        });
    }

    _getParsedModel(receivedModel) {
        let model = JSON.parse(JSON.stringify(initModel));
        let existingCluster = receivedModel.cluster;
        model = {
            organizationUid: receivedModel.organizationUid,
            ...model,
            clusterUid: existingCluster.uid,
            name: {
                ...model.name,
                value: existingCluster.name
            },
            autoStop: {
                ...model.autoStop,
                value: existingCluster.autoStop
            },
            date: {
                ...model.date,
                readOnly: existingCluster.autoStop === 0
            },
            link: {
                ...model.link,
                value: existingCluster.link
            }
        }
        return model;
    }

    _attachHandlerSaveCluster() {
        this.on('cls:save', (event) => {
            let toReturnObject = {
                uid: this.model.uid,
                name: this.model.name.value,
                autoStop: this.model.autoStop.value,
                date: this.model.date.value,
                link: this.model.link.value,
            }
            this._finishProcess(event, toReturnObject)
        });
    }

    _attachHandlerMonitoringCluster() {
        this.on('cls:monitoring', (event) => {
            debugger
            let toSendObject = {
                organizationUid: this.model.organizationUid,
                clusterUid: this.model.clusterUid
            }
            this.closeModal();
            this.History.navigateToPageByTag('monitoring', toSendObject);
        });
    }

    _attachHandlerGovernanceCluster() {
        this.on('cls:governance', (event) => {
            debugger
            let toSendObject = {
                organizationUid: this.model.organizationUid,
                clusterUid: this.model.clusterUid
            }
            this.History.navigateToPageByTag('governance', toSendObject);
        });
    }

    _attachHandlerDeleteCluster() {
        this.on('cls:delete', (event) => {
            this._finishProcess(event, {delete: true})
        });
    }

    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };
}
