import ContainerController from '../../../cardinal/controllers/base-controllers/ContainerController.js';
import OrganizationService from "../services/OrganizationService.js";
import ClusterService from "../services/ClusterService.js";

export default class MonitoringController extends ContainerController {
    constructor(element, history) {
        super(element, history);

        let receivedModel = this.History.getState();
        this.OrganisationService = new OrganizationService(this.DSUStorage);
        this.ClusterService = new ClusterService(this.DSUStorage);

        this.setModel({});

        this.OrganisationService.getOrganization(receivedModel.organizationUid, (err, organization) => {
            if (err) {
                console.log(err);
                return;
            }
            this.model.organization = organization;
        })

        this.ClusterService.getCluster(receivedModel.organizationUid, receivedModel.clusterUid, (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            this.model.cluster = data;
        })
    }
}