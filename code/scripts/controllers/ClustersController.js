import BPDController from "./base-controllers/BPDController.js";
import ClusterModel from "../models/ClusterModel.js"


export default class ClustersController extends BPDController {

    constructor(element) {
        super(element);

        // =============== Model setup
        this.clusterModel = ClusterModel.getInstance();

        this.model = this.clusterModel.registerBindings((data) => {
            return this.setModel(data);
        })
        this.organization = null;

        this._setupFormData();

        // ============== Events Listeners
        this.on('openFeedback', (e) => {
            this.feedbackEmitter = e.detail;
            // Set the current organization
            // after the feedback list has been initialized
            // in case we need to show an error
            this._setOrganization();
        })

        // Remove cluster request
        this.on('cluster:remove', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            const id = e.data;
            this._removeCluster(id);
        })

        // Edit cluster request
        this.on('cluster:edit', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            const id = e.data;
            this.redirect(`/cluster/edit#id=${id}`);
        });
        // Save cluster
        this.on('cluster:save', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.clusterModel.saveCluster((err, data) => {
                this._onSaveCluster(err, data);
            })
        });

        window.addEventListener('hashchange', (e) => {
            this._setOrganization();
            this._setupFormData();
        })
    }

    /**
     * Called after model attempts to save a new
     * or existing cluster
     * @param {Error} err
     * @param {object} data
     */
    _onSaveCluster(err, data) {
        if (err) {
            this.showError(err);
            return;
        }

        this.redirect(`/cluster/index#orgUid=${data.orgUid}`);
    }

    /**
     * Remove cluster
     *
     * @param {string} id
     */
    _removeCluster(id) {
        const clusterName = this.clusterModel.getClusterName(id);

        this.clusterModel.removeCluster(id);
    }

    /**
     * Set the current organization
     */
    _setOrganization() {
        const hashParams = this.parseHashFragmentParams();
        if (!hashParams.orgUid) {
            return;
        }

        const orgUid = hashParams.orgUid;
        const data = this.orgModel.getOrganization(orgUid);

        if (!data) {
            this.showError("Organization was not found");
        }

        this.clusterModel.setOrganization(data);
    }

    /**
     * Parse the current url and detect if we're creating a new cluster
     * or editing an existing one
     */
    _setupFormData() {
        const searchQuery = window.location.pathname.substr(1);
        const segments = searchQuery.split('/');
        const entity = segments.shift();
        const action = segments.shift();
        const hashParams = this.parseHashFragmentParams();

        if (entity === 'cluster') {
            switch (action) {
                case 'create':
                    this.clusterModel.clearFormData();
                    return;
                case 'edit':
                    if (typeof hashParams.id !== 'undefined') {
                        this.clusterModel.populateFormData(hashParams.id);
                    }
                    return;
            }
        }
    }
}
