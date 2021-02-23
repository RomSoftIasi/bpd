import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';
import ClusterService from "../services/ClusterService.js";

const initModel = {
    title: 'Manage DSU Types',
    dsuTypes: []
}

export default class DSUTypesApproveModal extends ModalController {
    constructor(element, history) {
        super(element, history);
        let receivedModel = this.History.getState();
        this.model = this.setModel({
            ...receivedModel,
            ...this.getParsedModel(this.model)
        })
        this.ClusterService = new ClusterService(this.DSUStorage);

        this.ClusterService.getCluster(receivedModel.organizationUid, receivedModel.clusterUid, (err, cluster) => {
            if (err) {
                console.log(err);
                return;
            }
            this.model.cluster = cluster;
            this.model.dsuTypes = this.model.cluster.dsuTypes || [];
        })

        this._createNewDsuType();
        this._attachHandlerCreateDSUType();
        this._attachHandlerApproveDSUType();
        this._attachHandlerOpenDSUType();
        this._attachHandlerReviewDSUType();
        this._attachHandlerFinishDSUType();
    }

    getParsedModel(receivedModel) {
        let model = JSON.parse(JSON.stringify(initModel));
        let existingOrganization = receivedModel.organization;
        let createOrg = true;
        if (existingOrganization) {
            createOrg = false;
            model = {
                ...model,
                title: 'Edit the organization',
                dsuTypes: existingOrganization.dsuTypes
            }
        }

        return {
            ...model,
            createOrg: createOrg,
        };
    }

    _createNewDsuType() {
        const id = (Date.now() + Math.random()).toString().replace('.', '');
        this.model.dsuTypes.push({
            id: {
                value: id
            },
            approved: false,
            reviewed: false,
            seed: {
                placeholder: 'Seed',
                name: 'Seed',
                readOnly: false
            },
            name: {
                placeholder: 'Name',
                name: 'Name',
                readOnly: false
            }
        });
    }

    _attachHandlerCreateDSUType() {
        this.on('dsu:add-dsuType-config', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this._createNewDsuType();
        });
    }

    _attachHandlerApproveDSUType() {
        this.on('dsu:approve', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            let dsuTypes = this.model.dsuTypes;
            let dsuTypeIndex = dsuTypes.findIndex(dsuType => dsuType.id.value === e.data)
            if (dsuTypeIndex === -1) {
                return;
            }
            dsuTypes[dsuTypeIndex].approved = true;
            dsuTypes[dsuTypeIndex].name.readOnly = true;
            dsuTypes[dsuTypeIndex].seed.readOnly = true;
            this.model.dsuTypes = JSON.parse(JSON.stringify(dsuTypes));
        });
    }

    _attachHandlerReviewDSUType() {
        this.on('dsu:review', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            let dsuTypes = this.model.dsuTypes;
            let dsuTypeIndex = dsuTypes.findIndex(dsuType => dsuType.id.value === e.data)
            if (dsuTypeIndex === -1) {
                return;
            }
            let toReturnObject = {
                redirect: 'ssapp-review',
                seed: dsuTypes[dsuTypeIndex].seed.value
            }
            let toSendObject = {
                organizationUid: this.model.organizationUid,
                clusterUid: this.model.uid,
                seed: dsuTypes[dsuTypeIndex].seed.value
            }
            this.History.navigateToPageByTag('ssapp-review', toSendObject);
        });
    }

    _attachHandlerOpenDSUType() {
        this.on('dsu:open', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            let dsuTypes = this.model.dsuTypes;
            let dsuTypeIndex = dsuTypes.findIndex(dsuType => dsuType.id.value === e.data)
            if (dsuTypeIndex === -1) {
                return;
            }
            let toSendObject = {
                organizationUid: this.model.organizationUid,
                clusterUid: this.model.uid,
                seed: dsuTypes[dsuTypeIndex].seed.value
            }
            this.History.navigateToPageByTag('ssapp-review', toSendObject);
        });
    }

    _attachHandlerFinishDSUType() {
        this.on('dsu:finish', (event) => {
            this.model.cluster.dsuTypes = this.model.dsuTypes;
            this.ClusterService.updateCluster(this.model.organizationUid, this.model.cluster, (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }
            })
            this._finishProcess(event, {})
        });
    }

    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };
}
