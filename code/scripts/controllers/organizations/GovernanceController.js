const {WebcController} = WebCardinal.controllers;
import OrganizationService from "../services/OrganizationService.js";
import ClusterService from "../services/ClusterService.js";
import * as Loader from "../WebcSpinnerController.js";

export default class GovernanceController extends WebcController {
    constructor(...props) {
        super(...props);

        this.OrganisationService = new OrganizationService(this.DSUStorage);
        this.ClusterService = new ClusterService(this.DSUStorage);

        let receivedModel = this.getState();
        this.model = {
            questions: [],
            organization: {},
            cluster: {},
            ...receivedModel
        };

        Loader.displayLoader();
        this.OrganisationService.getOrganization(receivedModel.organizationUid, (err, organization) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }
            
            this.model.organization = organization;

            this.ClusterService.getCluster(receivedModel.organizationUid, receivedModel.clusterUid, (err, cluster) => {
                Loader.hideLoader();
                if (err) {
                    return console.error(err);
                }

                this.model.cluster = cluster;
            });
        });

        this.attachHandlerEditContract();
        this.attachHandlerVotingContract();
    }

    attachHandlerEditContract() {
        this.onTagClick('gvn:contract-edit', (model, target,event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            let toSendObject = {
                organizationUid: this.model.organizationUid,
                clusterUid: this.model.clusterUid
            };

            const modalConfiguration = {
                model: toSendObject,
                controller: 'organizations/DSUTypesApproveModal',
                disableBackdropClosing: false
            };

            this.showModalFromTemplate('organizations/dsu-types-approval-modal', (event) => {
                const response = event.detail;
                console.log(response);
            }, (event) => {
                const error = event.detail || null

                if (error && error !== true) {
                    console.error(error);
                }
            }, modalConfiguration);
        });
    }

    attachHandlerVotingContract() {
        this.onTagClick('gvn:voting', (model, target,event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            let toSendObject = {
                organizationUid: this.model.organizationUid,
                clusterUid: this.model.clusterUid
            };

            this.navigateToPageTag('voting', toSendObject);
        });
    }
}
