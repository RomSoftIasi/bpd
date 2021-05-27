const {WebcController} = WebCardinal.controllers;
import OrganizationService from "../services/OrganizationService.js";
import ClusterService from "../services/ClusterService.js";

export default class MonitoringController extends WebcController {
    constructor(...props) {
        super(...props);

        // TODO: Replace this when a solution has been found
        let receivedModel = this.history.win.history.state.state;

        this.OrganisationService = new OrganizationService(this.DSUStorage);
        this.ClusterService = new ClusterService(this.DSUStorage);

        this.model = {
            organization: {},
            cluster: {}
        };

        this.OrganisationService.getOrganization(receivedModel.organizationUid, (err, organization) => {
            if (err) {
                return console.error(err);
            }

            this.model.organization = organization;
        });

        this.ClusterService.getCluster(receivedModel.organizationUid, receivedModel.clusterUid, (err, data) => {
            if (err) {
                return console.error(err);
            }

            this.model.cluster = data;
        });
    }
}