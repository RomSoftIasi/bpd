import BPDController from "./base-controllers/BPDController.js";
import ClusterModel from "../models/ClusterModel.js"

const initModel = {
    title: 'GovernanceModal',
    questions: [
        {
            id: 1,
            title: 'Do you think Blockchain is the technology from the future?',
            answers: [
                {
                    id: 1,
                    text: 'Yes'
                },
                {
                    id: 2,
                    text: 'No'
                }
            ]
        },
        {
            id: 2,
            title: 'What cloud provider do you prefer?',
            answers: [
                {
                    id: 3,
                    text: 'AWS'
                },
                {
                    id: 4,
                    text: 'Google Cloud Services'
                },
                {
                    id: 5,
                    text: 'Azure'
                }
            ]
        }
    ],
    organization: {
        name: 'Organization A'
    },
    network: {
        name: 'Network A'
    }
}

export default class GovernanceController extends BPDController {
    constructor(element) {
        super(element);
        this.clusterModel = ClusterModel.getInstance();
        this.model = this.setModel(initModel)

        this._initModel();
        this._onContractEdit();
        this._onContractReview();
        this._onVoting();
    }

    _initModel() {
        this.model.params = this.parseHashFragmentParams();
        if (this.model.params.orgUid) {
            this.model.organization = this.orgModel.getOrganization(this.model.params.orgUid);
        }
        if (this.model.params.ntwUid) {
            this.model.network = this.clusterModel.getCluster(this.model.params.ntwUid)
        }
    }

    _onContractEdit() {
        this.on('gvn:contract-edit', (event) => {
            this.showModal('dsuTypesApprovalModal', {}, (err, response) => {
                if (err) {
                    return console.log(err);
                }
                if (response.redirect) {
                    return this.redirect(`/cluster/${response.redirect}#seed=${response.seed}`);
                }
            });
        });
    }

    _onContractReview() {
        this.on('gvn:contract-review', (event) => {

        });
    }

    _onVoting() {
        this.on('gvn:voting', (event) => {
                this.redirect(`/cluster/voting#orgUid=${this.model.params.orgUid}&ntwUid=${this.model.params.ntwUid}`);
            }
        );
    }
}
