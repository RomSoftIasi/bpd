import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';

const initModel = {
    title: 'Manage DSU Types',
    dsuTypes: []
}

export default class DSUTypesApproveModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.model = this.setModel(this.getParsedModel(this.model))
        this._createNewDsuType();
        this._onDSUTypeCreate();
        this._onDSUTypeApprove();
        this._onDSUTypeReview();
        this._onDSUFinish();
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
            approved: true,
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

    _onDSUTypeCreate() {
        this.on('dsu:add-dsuType-config', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this._createNewDsuType();
        });
    }

    _onDSUTypeApprove() {
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

    _onDSUTypeReview() {
        this.on('dsu:review', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            let dsuTypes = this.model.dsuTypes;
            let dsuTypeIndex = dsuTypes.findIndex(dsuType => dsuType.id.value === e.data)
            if (dsuTypeIndex === -1) {
                return;
            }
            dsuTypes[dsuTypeIndex].approved = false;
            dsuTypes[dsuTypeIndex].name.readOnly = true;
            dsuTypes[dsuTypeIndex].seed.readOnly = true;
            this.model.dsuTypes = JSON.parse(JSON.stringify(dsuTypes));
        });
    }

    _onDSUFinish() {
        this.on('dsu:finish', (event) => {
            let toReturnObject = {
                dsuTypes: this.model.dsuTypes
            }
            this._finishProcess(event, toReturnObject)
        });
    }

    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };
}
