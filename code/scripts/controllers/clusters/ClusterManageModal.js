import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';
import ClusterControllerApi from "../../../ClustersControllerApi.js";

const initModel = {
    title: 'Manage Blockchain Network Deployment',
    name: {
        label: 'Pipeline used for installation',
        required: true,
        disabled: true,
        options: []
    }

}

export default class ClusterManageModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.model = this.setModel(this._getParsedModel(this.model))
        this.ClusterControllerApi = new ClusterControllerApi();
        console.log(this.model);
        this.ClusterControllerApi.listJenkinsPipelines(this.model.jenkins, this.model.user, this.model.token,(err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Pipelines", data);
            this.model.name.options = data.map(cluster => {
                return {
                    label: cluster.name,
                    value: cluster.name
                }
            });
        })

        this._attachHandlerMonitoringCluster();
        this._attachHandlerDeleteCluster();
        this._attachHandlerGovernanceCluster();
        this._attachHandlerInstallCluster();
        this._attachEventEmmiter();
    }


    _getParsedModel(receivedModel) {
        let model = JSON.parse(JSON.stringify(initModel));
        let existingCluster = receivedModel.cluster;
        model = {
            organizationUid: receivedModel.organizationUid,
            ...model,
            clusterUid: existingCluster.uid,
            name: {
                ...model.name,
                value: existingCluster.name
            },
            jenkins: existingCluster.jenkins,
            user: existingCluster.user,
            token: existingCluster.token,
            pipelineToken: existingCluster.pipelineToken
        }
        return model;
    }

    _attachHandlerInstallCluster() {
        this.on('cls:installcluster', (event) => {
            let toReturnObject = {
                uid: this.model.clusterUid,
                name: this.model.name.value,
                jenkins: this.model.jenkins,
                user: this.model.user,
                token: this.model.token,
                pipelineToken: this.model.pipelineToken,
                installCluster: true
            }
            this._emitFeedback(event, "Cluster installation was initiated ...", "alert-success");
            setTimeout(() => {
                this._finishProcess(event, toReturnObject)
            }, 4500);
        });
    }

    _attachHandlerMonitoringCluster() {
        this.on('cls:monitoring', (event) => {
            let toSendObject = {
                organizationUid: this.model.organizationUid,
                clusterUid: this.model.clusterUid
            }
            this.closeModal();
            this.History.navigateToPageByTag('monitoring', toSendObject);
        });
    }

    _attachHandlerGovernanceCluster() {
        this.on('cls:governance', (event) => {
            let toSendObject = {
                organizationUid: this.model.organizationUid,
                clusterUid: this.model.clusterUid
            }
            this.History.navigateToPageByTag('governance', toSendObject);
        });
    }

    _attachHandlerDeleteCluster() {
        this.on('cls:delete', (event) => {
            this._finishProcess(event,
                {
                    delete: true
                });
        });
    }

    _emitFeedback(event, message, alertType) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (typeof this.feedbackEmitter === 'function') {
            this.feedbackEmitter(message, "Info", alertType)
        }
    }

    _attachEventEmmiter() {
        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });
    }

    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };
}
