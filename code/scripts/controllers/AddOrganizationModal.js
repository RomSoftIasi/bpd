import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';

const model = {
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

export default class AddOrganizationModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.model = this.setModel(JSON.parse(JSON.stringify(model)))
        this.createNewKubernetesConfig();
        this.addKubernetesConfig();
        this.removeKubernetesConfig();

        // Add new key:value config pair for Kubernetes cluster
        this.createOrganization();
    }

    createNewKubernetesConfig() {
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

    addKubernetesConfig() {
        this.on('org:add-kubernetes-config', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.createNewKubernetesConfig();
        });
    }

    removeKubernetesConfig() {
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

    createOrganization() {
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
