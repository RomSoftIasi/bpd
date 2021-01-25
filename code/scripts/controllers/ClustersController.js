import ContainerController from '../../../cardinal/controllers/base-controllers/ContainerController.js';
import OrganizationService from "./Services/OrganizationService.js";
import ClusterService from "./Services/ClusterService.js";

export default class ClustersController extends ContainerController {

    constructor(element, history) {
        super(element, history);

        debugger
        this.OrganisationService = new OrganizationService(this.DSUStorage);
        this.ClusterService = new ClusterService(this.DSUStorage);
        this.setModel({});
        let orgUid = this.History.getState();

        this.OrganisationService.getOrganization(orgUid, (err, organization) => {
            if (err) {
                console.log(err);
                return;
            }
            this.model.organization = organization;
        })

        this.ClusterService.getClustersModel(orgUid, (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            this.model.clusters = data.clusters;
        })

        this._attachHandlerCreateCluster();
    }

    _attachHandlerCreateCluster() {
        this.on('cluster:create', (e) => {
            debugger
            this.showModal('addClusterModal', {}, (err, cluster) => {
                if (err) {
                    console.log(err);
                    return;
                }
                //todo : show spinner/loading stuff
                this.ClusterService.saveCluster(this.model.organization.uid, cluster, (err, updatedCluster) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    this.model.clusters.push(updatedCluster);
                });
            });
        });
    }

}
