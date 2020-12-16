import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';

const initModel = {
    title: 'Manage DSU Types',
    dsuTypes: []
}

export default class DSUTypesApproveModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.model = this.setModel(this.getParsedModel(this.model))
        this.createNewDsuType();
        this.addDsuType();
        this.approveDsuType();
        this.finish();
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

    createNewDsuType() {
        const id = (Date.now() + Math.random()).toString().replace('.', '');
        this.model.dsuTypes.push({
            id: {
                value: id
            },
            approved: false,
            seed: {
                placeholder: 'Seed',
                name: 'Seed',
                readOnly: false
            }
        });
    }

    addDsuType() {
        this.on('org:add-dsuType-config', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.createNewDsuType();
        });
    }

    approveDsuType() {
        this.on('dsu:approve', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            let dsuTypes = this.model.dsuTypes;
            let dsuTypeIndex = dsuTypes.findIndex(dsuType => dsuType.id.value === e.data)
            if (dsuTypeIndex === -1) {
                return;
            }
            dsuTypes[dsuTypeIndex].approved = true;
            dsuTypes[dsuTypeIndex].seed.readOnly = true;
            this.model.dsuTypes = JSON.parse(JSON.stringify(dsuTypes));
        });
    }

    finish() {
        this.on('org:finish', (event) => {
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
