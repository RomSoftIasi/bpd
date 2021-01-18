import BPDController from "./base-controllers/BPDController.js";

export default class OrganizationsController extends BPDController {

    constructor(element) {
        super(element);

        this.model = this.orgModel.registerBindings((data) => {
            const model = this.setModel(data);
            console.log(model);
            return model;
        });


        //DEV INTENDED
        let tempObj = {
            name: "Organization A",
            uid: 1,
            kubernetesConfig: [],
            hosting: 'aws',
            endpoint: 'localhost:8080',
            secretKey: 'crh43c7r6c32cbx6vcbcvghecxfgffg3cb764c3v'
        }

        const ORGANIZATION_PATH = "/organizations";
        this.DSUStorage.call("createSSIAndMount", ORGANIZATION_PATH, (err, keySSI) => {
            if (err) {
                return console.log(err);
            }
            tempObj.keySSI = keySSI;
            this.DSUStorage.call("listDSUs", "/", (err, dsuList) => {
                if (err) {
                    return console.log(err);
                }

                this.DSUStorage.setObject(ORGANIZATION_PATH + '/' + keySSI + '/data.json', JSON.stringify(tempObj), (err) => {
                    debugger
                    if (err) {
                        return console.log(err);
                    }
                    this.DSUStorage.getItem(ORGANIZATION_PATH + '/' + keySSI + '/data.json', (err, content) => {
                        if (err) {
                            return console.log(err);
                        }
                        let textDecoder = new TextDecoder("utf-8");
                        let organization = JSON.parse(textDecoder.decode(content));
                    })
                });
            });
        })


        // END DEV INTENDED CODE


        this._setupFormData();
        this._onOpenFeedback();
        this._onQRCodeShare();
        this._onOrganizationCreate();
        this._onOrganizationEdit();
        this._onOrganizationRemove();
        this._onOrganizationSave();
        this._onClusterManage();
        this._onKubernetesAdd();
        this._onKubernetesRemove();

        window.addEventListener('hashchange', (e) => {
            console.log('hash changed');
            this._setupFormData();
        });
    }

    _onOpenFeedback() {
        this.on('openFeedback', (e) => {
            this.feedbackEmitter = e.detail;
        });
    }

    _onQRCodeShare() {
        this.on('org:getQRCode', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            let organization = this.orgModel.getOrganization(e.data);
            if (organization === -1) {
                return;
            }
            let qrCodeModalModel = {
                title: `QRCode for ${organization.name}`,
                description: `Scan the code above to get your organization data`,
                data: {
                    identifier: JSON.stringify(organization)
                }
            }
            this.showModal('shareQRCodeModal', qrCodeModalModel);
        });
    }

    _onOrganizationCreate() {
        this.on('org:create', (e) => {
            this.showModal('addOrganizationModal', {}, (err, response) => {
                if (err) {
                    return console.log(err);
                }
            });
        });
    }

    _onOrganizationEdit() {
        this.on('org:edit', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            let organization = {organization: this.orgModel.getOrganization(e.data)}
            this.showModal('addOrganizationModal', organization, (err, response) => {
                if (err) {
                    return console.log(err);
                }
            });
        });
    }

    _onOrganizationRemove() {
        this.on('org:remove', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            const orgUid = e.data;
            this._removeOrganization(orgUid);
        });
    }

    _onOrganizationSave() {
        this.on('org:save', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.orgModel.saveOrganization((err, data) => {
                this._onSaveOrganization(err, data);
            });
        });
    }

    _onClusterManage() {
        this.on('org:manage-clusters', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            const orgUid = e.data;
            this.redirect(`/cluster/index#orgUid=${orgUid}`);
        });
    }

    _onKubernetesAdd() {
        this.on('org:add-kubernetes-config', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.orgModel.prepareNewKubernetesConfig();
        });
    }

    _onKubernetesRemove() {
        this.on('org:remove-kubernetes-config', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.orgModel.removeKubernetesConfig(e.data);
        });
    }

    /**
     * Remove organization
     * @param {string} orgUId
     */
    _removeOrganization(orgUid) {
        const orgName = this.orgModel.getOrganizationName(orgUid);

        this.orgModel.removeOrganization(orgUid);
    }

    /**
     * Called after model attempts to save a new
     * or existing organization
     * @param {Error} err
     * @param {object} data
     */
    _onSaveOrganization(err, data) {
        if (err) {
            this.showError(err);
            return;
        }

        this.redirect('/home');
    }


    /**
     * Parse the current url and detect if we're creating a new organization
     * or editing an existing one
     */
    _setupFormData() {
        const searchQuery = window.location.pathname.substr(1);
        const segments = searchQuery.split('/');
        const entity = segments.shift();
        const action = segments.shift();
        const hashParams = this.parseHashFragmentParams();

        if (entity === 'organization') {
            switch (action) {
                case 'create':
                    this.orgModel.clearFormData();
                    return;
                case 'edit':
                    if (typeof hashParams.orgUid !== 'undefined') {
                        this.orgModel.populateFormData(hashParams.orgUid);
                    }
                    return;
            }
        }
    }
}
