import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';

const initModel = {
    title: 'Add a new organization',
    name: {
        name: 'name',
        required: true,
        placeholder: 'Organization name',
        value: ''
    },
    hosting: {
        placeholder: "Choose a hosting type",
        required: true,
        options: [
            {
                label: 'AWS',
                value: 'aws'
            },
            {
                label: 'Google Cloud',
                value: 'gcloud'
            },
            {
                label: 'Azure',
                value: 'azure'
            }
        ]
    },
    endpoint: {
        name: 'endpoint',
        required: true,
        placeholder: 'Endpoint',
        value: ''
    },
    secretKey: {
        name: 'secretKey',
        required: true,
        placeholder: 'Secret Key',
        value: ''
    },
    kubernetesConfig: [

    ],
    loadWithQR: "Load with QRCode"
}

export default class CreateOrganizationModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.model = this.setModel(this.getParsedModel(this.model))
        this._createNewKubernetesConfig();
        this._onCreateKubernetesConfig();
        this._onRemoveKubernetesConfig();
        this._onCreateOrganization();
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
                name: {
                    ...model.name,
                    value: existingOrganization.name
                },
                hosting: {
                    ...model.hosting,
                    value: existingOrganization.hosting
                },
                endpoint: {
                    ...model.endpoint,
                    value: existingOrganization.endpoint
                },
                secretKey: {
                    ...model.secretKey,
                    value: existingOrganization.secretKey
                },
                kubernetesConfig: existingOrganization.kubernetesConfig
            }
        }

        return {
            ...model,
            createOrg: createOrg,
        };
    }

    _createNewKubernetesConfig() {
        const id = (Date.now() + Math.random()).toString().replace('.', '');
        this.model.kubernetesConfig.push({
            key: {
                placeholder: 'Key',
                name: 'Key'
            },
            value: {
                placeholder: 'Value',
                name: 'Value'
            },
            id: {
                value: id
            }
        });
    }

    _onCreateKubernetesConfig() {
        this.on('org:add-kubernetes-config', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this._createNewKubernetesConfig();
        });
    }

    _onRemoveKubernetesConfig() {
        this.on('org:remove-kubernetes-config', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            for (let i = 0; i < this.model.kubernetesConfig.length; i++) {
                const cfg = this.model.kubernetesConfig[i];

                if (typeof cfg.id === 'undefined') {
                    continue;
                }

                if (cfg.id.value !== e.data) {
                    continue;
                }

                this.model.kubernetesConfig.splice(i, 1);
            }
        });
    }

    _onCreateOrganization() {
        this.on('org:create', (event) => {
            let toReturnObject = {
                name: this.model.name.value,
                hosting: this.model.hosting.value,
                endpoint: this.model.endpoint.value,
                secretKey: this.model.secretKey.value,
            }
            this._finishProcess(event, toReturnObject)
        });
    }

    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };
}
