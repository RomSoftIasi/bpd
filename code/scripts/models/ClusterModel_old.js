export default class ClusterModel {

    /**
     * @var {ClusterModel}
     */
    static instance;

    constructor() {
        this.modelIsBinded = false;
        // Store all the available clusters across all organizations
        this.availableClusters = [
            {
                orgUid: 1,
                id: 1,
                name: 'Blockchain Pharma',
                config: {
                    autoStop: 0,
                    configRepoUrl: 'https://github.com/user/pskwebcomponents'
                }
            },
            {
                orgUid: 1,
                id: 2,
                name: 'Blockchain Dev/Test',
                config: {
                    autoStop: 1,
                    configRepoUrl: 'https://github.com/user/privatesky-xyz'
                }
            },
            {
                orgUid: 2,
                id: 4,
                name: 'Blockchain Staging',
                config: {
                    autoStop: 0,
                    configRepoUrl: 'https://github.com/user/privatesky-xyz'
                }
            }
        ];

        this.data = {
            organization: {},
            clusters: [],
            editForm: {
                formTitle: 'Create Cluster',
                name: {
                    label: 'Name',
                    name: 'name',
                    required: true,
                    placeholder: '',
                    value: '',
                },
                autoStop: {
                    label: 'Auto Stop',
                    name: 'autoStop',
                    required: false,
                    placeholder: '',
                    value: 1,
                    checkedValue: 1,
                    uncheckedValue: 0
                },
                configRepoUrl: {
                    label: 'Git Config Repo Url',
                    name: 'configRepoUrl',
                    required: true,
                    placeholder: '',
                    value: ''
                },
                id: ''
            }
        }
    }

    /**
     * @param {callback} callback
     */
    saveCluster(callback) {
        if (this.data.editForm.id) {
            this._updateCluster(callback);
            return;
        }
        this._addCluster(callback);
    }

    _updateCluster(callback) {
        const editFormData = this.data.editForm;
        const cluster = this.getCluster(editFormData.id);

        if (!cluster) {
            return callback(new Error("Cluster not found"));
        }

        if (!editFormData.name.value) {
            return callback(new Error('Missing cluster name'));
        }

        if (!editFormData.configRepoUrl.value) {
            return callback(new Error('Missing Git configuration repository url'));
        }

        cluster.name = editFormData.name.value;
        cluster.config.configRepoUrl = editFormData.configRepoUrl.value;
        cluster.config.autoStop = parseInt(editFormData.autoStop.value, 10);

        callback(null, cluster);
        this.clearFormData();
    }

    /**
     * @param {callback} callback
     */
    _addCluster(callback) {
        const editFormData = this.data.editForm;

        if (!editFormData.name.value) {
            return callback(new Error('Missing cluster name'));
        }

        if (!editFormData.configRepoUrl.value) {
            return callback(new Error('Missing Git configuration repository url'));
        }

        const newCluster = {
            name: editFormData.name.value,
            id: this._autoIncrementLastId(),
            orgUid: this.data.organization.uid,
            config: {
                configRepoUrl: editFormData.configRepoUrl.value,
                autoStop: editFormData.autoStop.value
            }
        };

        this.availableClusters.push(newCluster);
        this._populateOrganizationClusters();
        callback(null, newCluster);
        this.clearFormData();
    }

    /**
     * @param {object} organization
     */
    setOrganization(organization) {
        this.data.organization = organization;
        this._populateOrganizationClusters();
    }

    /**
     *
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
     * @param {string} id
     */
    removeCluster(id) {
        let foundClusterIndex = null;

        for (let i = 0; i < this.availableClusters.length; i++) {
            const cluster = this.availableClusters[i];
            if (cluster.id == id) {
                foundClusterIndex = i;
                break;
            }
        }

        if (foundClusterIndex === null) {
            console.warn(`Cluster with id ${id} was not found`);
            return;
        }

        this.availableClusters.splice(foundClusterIndex, 1);
        this._populateOrganizationClusters();
    }

    /**
     * @param {string} id
     * @return {object}
     */
    getCluster(id) {
        for (const cluster of this.availableClusters) {
            if (cluster.id != id) {
                continue;
            }

            return cluster;
        }
        return;
    }

    /**
     * @param {string} id
     * @return {object}
     */
    getClusterName(id) {
        const cluster = this.getCluster(id);
        if (cluster) {
            return cluster.name;
        }

        return;
    }

    _populateOrganizationClusters() {
        const organization = this.data.organization;
        this.data.clusters = [];

        for (const cluster of this.availableClusters) {
            if (cluster.orgUid == organization.uid) {
                this.data.clusters.push(cluster);
            }
        }
    }

    /**
     * @param {string} id
     */
    populateFormData(id) {
        for (const cluster of this.availableClusters) {
            if (cluster.id != id) {
                continue;
            }

            this.data.editForm.formTitle = 'Edit Cluster';
            this.data.editForm.name.value = cluster.name;
            this.data.editForm.configRepoUrl.value = cluster.config.configRepoUrl;
            this.data.editForm.autoStop.value = cluster.config.autoStop;
            this.data.editForm.autoStop.checked = parseInt(cluster.config.autoStop, 10) ? true : false;
            this.data.editForm.id = cluster.id;
        }
    }

    /**
     * @return {Number}
     */
    _autoIncrementLastId() {
        let maxId = 0;
        for (const cluster of this.availableClusters) {
            if (cluster.id >= maxId) {
                maxId = cluster.id;
            }
        }

        return maxId + 1;
    }

    clearFormData() {
        this.data.editForm.formTitle = 'Create Cluster';
        this.data.editForm.name.value = '';
        this.data.editForm.configRepoUrl.value = '';
        this.data.editForm.autoStop.value = 0;
        this.data.editForm.id = '';
    }

    static getInstance() {
        if (!ClusterModel.instance) {
            ClusterModel.instance = new ClusterModel();
        }

        return ClusterModel.instance;
    }
}
