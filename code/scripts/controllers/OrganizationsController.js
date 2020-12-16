import BPDController from "./base-controllers/BPDController.js";

export default class OrganizationsController extends BPDController {

    constructor(element) {
        super(element);

        this.model = this.orgModel.registerBindings((data) => {
            const model = this.setModel(data);
            console.log(model);
            return model;
        });

        this._setupFormData();

        // ============== Events Listeners
        this.on('openFeedback', (e) => {
            this.feedbackEmitter = e.detail;
        });

        // ============== Button listener
        this.on('org:create', (e) => {
            this.showModal('addOrganizationModal', {}, (err, response) => {
                if (err) {
                    return console.log(err);
                }
            });
        });

        // Share QRCode
        this.on('org:getQRCode', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            let organization = this.orgModel.getOrganization(e.data);
            if(organization === -1) {
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

        // Edit organization request
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

        // Remove organization request
        this.on('org:remove', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            const orgUid = e.data;
            this._removeOrganization(orgUid);
        });

        // Add new key:value config pair for Kubernetes cluster
        this.on('org:add-kubernetes-config', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.orgModel.prepareNewKubernetesConfig();
        });

        // Remove key:value config pair for Kubernetes cluster
        this.on('org:remove-kubernetes-config', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.orgModel.removeKubernetesConfig(e.data);
        });

        // Save organization
        this.on('org:save', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.orgModel.saveOrganization((err, data) => {
                this._onSaveOrganization(err, data);
            });
        });

        this.on('org:manage-clusters', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            const orgUid = e.data;
            this.redirect(`/cluster/index#orgUid=${orgUid}`);
        });

        window.addEventListener('hashchange', (e) => {
            console.log('hash changed');
            this._setupFormData();
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
