const {WebcController} = WebCardinal.controllers;
import OrganizationService from "../services/OrganizationService.js";
import ClusterService from "../services/ClusterService.js";
import * as Loader from "../WebcSpinnerController.js";

export default class MonitoringController extends WebcController {
    constructor(...props) {
        super(...props);

        let receivedModel = this.getState();

        this.OrganisationService = new OrganizationService(this.DSUStorage);
        this.ClusterService = new ClusterService(this.DSUStorage);

        this.model = {
            organization: {},
            cluster: {}
        };

        Loader.displayLoader();
        this.OrganisationService.getOrganization(receivedModel.organizationUid, (err, organization) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            this.model.organization = organization;

            this.ClusterService.getCluster(receivedModel.organizationUid, receivedModel.clusterUid, (err, data) => {
                Loader.hideLoader();
                if (err) {
                    return console.error(err);
                }

                this.model.cluster = data;
            });
        });
    }
}