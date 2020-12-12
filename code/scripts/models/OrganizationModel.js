export default class OrganizationModel {

    /**
     * @var {OrganizationModel}
     */
    static instance;

    constructor() {
        this.modelIsBinded = false;
        this.data = {
            test: 0,
            files: [],
            organizations: [
                {
                    name: "Organization A",
                    uid: 1,
                    kubernetesConfig: []
                },
                {
                    name: "Organization B",
                    uid: 2,
                    kubernetesConfig: []
                },
                {
                    name: "Organization C",
                    uid: 3,
                    kubernetesConfig: []
                },
                {
                    name: "Organization D",
                    uid: 4,
                    kubernetesConfig: []
                },
                {
                    name: "Organization E",
                    uid: 5,
                    kubernetesConfig: []
                },
                {
                    name: "Organization A",
                    uid: 6,
                    kubernetesConfig: []
                },
                {
                    name: "Organization B",
                    uid: 7,
                    kubernetesConfig: []
                },
                {
                    name: "Organization C",
                    uid: 8,
                    kubernetesConfig: []
                },
                {
                    name: "Organization D",
                    uid: 9,
                    kubernetesConfig: []
                },
                {
                    name: "Organization E",
                    uid: 10,
                    kubernetesConfig: []
                },
            ],
            editForm: {
                name: {
                    label: 'Organization Name',
                    name: 'name',
                    required: true,
                    placeholder: '',
                    value: '',
                },
                kubernetesConfig: [],
                id: ''
            }
        }

        this.prepareNewKubernetesConfig();
    }

    /**
     * @param {string} uid
     * @return {object|undefined}
     */
    getOrganization(uid) {
        for (const org of this.data.organizations) {
            if (org.uid != uid) {
                continue;
            }
            return org;
        }

        return;
    }

    /**
     * @param {string} uid
     * @return {string|undefined}
     */
    getOrganizationName(uid) {
        const org = this.getOrganization(uid);

        if (org) {
            return org.name;
        }

        return;
    }

    /**
     * @param {string} uid
     * @return {void}
     */
    removeOrganization(uid) {
        let foundOrgIndex = null;
        for (let i = 0; i < this.data.organizations.length; i++) {
            const org = this.data.organizations[i];
            if (org.uid == uid) {
                foundOrgIndex = i;
                break;
            }
        }

        if (foundOrgIndex === null) {
            console.warn(`Organization with uid ${uid} was not found`);
            return;
        }

        this.data.organizations.splice(foundOrgIndex, 1);
    }

    /**
     * @param {callback} callback
     */
    saveOrganization(callback) {
        if (this.data.editForm.id) {
            this._updateOrganization(callback);
        } else {
            this._addOrganization(callback)
        }

        this.clearFormData();
    }

    /**
     * @param {callback} bindModelCallback
     * @return {Proxy}
     */
    registerBindings(bindModelCallback) {
        if (this.modelIsBinded) {
            return this.data;
        }

        this.modelIsBinded = true;
        this.data = bindModelCallback(this.data);
        this.data.addExpression('inEditMode', function () {
            return this.editForm.id;
        });
        return this.data;
    }

    /**
     * @param {string} uid
     */
    populateFormData(uid) {
        this.data.editForm.kubernetesConfig = []

        for (const org of this.data.organizations) {
            if (org.uid != uid) {
                continue;
            }

            this.data.editForm.name.value = org.name;
            this.data.editForm.id = org.uid;

            for (const cfg of org.kubernetesConfig) {
                this.data.editForm.kubernetesConfig.push({
                    key: {
                        label: 'Key',
                        name: 'Key',
                        value: cfg.key
                    },
                    value: {
                        label: 'Value',
                        name: 'Value',
                        value: cfg.value
                    },
                    id: {
                        value: cfg.id
                    }
                });
            }
        }
    }

    /**
     * Add new key:value empty pair in the kubernetes config section
     */
    prepareNewKubernetesConfig() {
        const id = (Date.now() + Math.random()).toString().replace('.', '');
        this.data.editForm.kubernetesConfig.push({
            key: {
                label: 'Key',
                name: 'Key'
            },
            value: {
                label: 'Value',
                name: 'Value'
            },
            id: {
                value: id
            }
        });
    }

    /**
     * @param {string} configId
     */
    removeKubernetesConfig(configId) {
        for (let i = 0; i < this.data.editForm.kubernetesConfig.length; i++) {
            const cfg = this.data.editForm.kubernetesConfig[i];

            if (typeof cfg.id === 'undefined') {
                continue;
            }

            if (cfg.id.value !== configId) {
                continue;
            }

            this.data.editForm.kubernetesConfig.splice(i, 1);
        }
    }

    /**
     * @param {callback} callback
     */
    _updateOrganization(callback) {
        const editFormData = this.data.editForm;
        const org = this.getOrganization(editFormData.id);

        if (!org) {
            return callback(new Error("Organization not found"));
        }

        if (!editFormData.name.value) {
            return callback(new Error('Missing organization name'));
        }

        org.name = editFormData.name.value;
        org.kubernetesConfig = [];
        this._saveKubernetesConfig(org);

        callback(null, org);
    }

    /**
     * @param {callback} callback
     */
    _addOrganization(callback) {
        const editFormData = this.data.editForm;

        if (!editFormData.name.value) {
            return callback(new Error('Missing organization name'));
        }

        const newOrganization = {
            name: editFormData.name.value,
            uid: this._autoIncrementLastUid(),
            kubernetesConfig: []
        }
        this._saveKubernetesConfig(newOrganization);

        this.data.organizations.push(newOrganization);
        callback(null, newOrganization);
    }

    /**
     * @param {object} org
     */
    _saveKubernetesConfig(org) {
        for (const cfg of this.data.editForm.kubernetesConfig) {
            org.kubernetesConfig.push({
                key: cfg.key.value,
                value: cfg.value.value,
                id: cfg.id.value
            })
        }
    }

    /**
     * @return {Number}
     */
    _autoIncrementLastUid() {
        let maxUid = 0;
        for (const org of this.data.organizations) {
            if (org.uid >= maxUid) {
                maxUid = org.uid;
            }
        }

        return maxUid + 1;
    }

    clearFormData() {
        this.data.editForm.name.value = '';
        this.data.editForm.id = '';
        this.data.editForm.kubernetesConfig = [];
        this.prepareNewKubernetesConfig();
    }

    static getInstance() {
        if (!OrganizationModel.instance) {
            OrganizationModel.instance = new OrganizationModel();
        }

        return OrganizationModel.instance;
    }
}
