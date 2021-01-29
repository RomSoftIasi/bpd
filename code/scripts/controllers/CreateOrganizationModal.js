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

        this.setModel(JSON.parse(JSON.stringify(initModel)));
        this._kubernetesConfigCreate();
        this._attachHandlerKubernetesConfigCreate();
        this._attachHandlerKubernetesConfigRemove();
        this._attachHandlerOrganizationCreate();
        this._attachHandlerOrganizationImport();
    }

    _kubernetesConfigCreate() {
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

    _attachHandlerKubernetesConfigCreate() {
        this.on('org:add-kubernetes-config', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this._kubernetesConfigCreate();
        });
    }

    _attachHandlerKubernetesConfigRemove() {
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

    _attachHandlerOrganizationCreate() {
        this.on('org:create', (event) => {
            let kubernetesConfig = this.model.kubernetesConfig
                .filter(kc => kc.key.value && kc.value.value)
                .map(kc => {
                    return {
                        id: kc.id.value,
                        value: kc.value.value,
                        key: kc.key.value,
                    }
                })

            let toReturnObject = {
                name: this.model.name.value,
                hosting: this.model.hosting.value,
                endpoint: this.model.endpoint.value,
                secretKey: this.model.secretKey.value,
                kubernetesConfig: kubernetesConfig,
            }

            this._finishProcess(event, toReturnObject)
        });
    }

    _attachHandlerOrganizationImport() {
        this.on('org:create-with-qrcode', (event) => {
            this._finishProcess(event, {
                qrCodeImportRedirect: true
            })
        });
    }

    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };
}
