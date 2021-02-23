import ContainerController from '../../../cardinal/controllers/base-controllers/ContainerController.js';
import OrganizationService from "../services/OrganizationService.js";
import ClusterService from "../services/ClusterService.js";

const initModel = {
    title: 'GovernanceModal',
    questions: [],
    organization: {
        name: ''
    },
    cluster: {
        name: ''
    }
}

export default class GovernanceController extends ContainerController {
    constructor(element, history) {
        super(element, history);

        this.OrganisationService = new OrganizationService(this.DSUStorage);
        this.ClusterService = new ClusterService(this.DSUStorage);

        let receivedModel = this.History.getState();
        this.model = this.setModel({
            ...JSON.parse(JSON.stringify(initModel)),
            ...receivedModel
        })

        this.OrganisationService.getOrganization(receivedModel.organizationUid, (err, organization) => {
            if (err) {
                console.log(err);
                return;
            }
            this.model.organization = organization;
        })

        this.ClusterService.getCluster(receivedModel.organizationUid, receivedModel.clusterUid, (err, cluster) => {
            if (err) {
                console.log(err);
                return;
            }
            this.model.cluster = cluster;
        })

        this._attachHandlerEditContract();
        this._attachHandlerVotingContract();
    }

    _attachHandlerEditContract() {
        this.on('gvn:contract-edit', (event) => {
            let toSendObject = {
                organizationUid: this.model.organizationUid,
                clusterUid: this.model.clusterUid
            }
            this.showModal('dsuTypesApprovalModal', toSendObject, (err, response) => {
                if (err) {
                    return console.log(err);
                }
            });
        });
    }

    _attachHandlerVotingContract() {
        this.on('gvn:voting', (event) => {
            let toSendObject = {
                organizationUid: this.model.organizationUid,
                clusterUid: this.model.clusterUid
            }
            this.History.navigateToPageByTag('voting', toSendObject);
        });
    }
}
