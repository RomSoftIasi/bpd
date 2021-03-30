import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';
import ClusterControllerApi from "../../../ClustersControllerApi.js";

const initModel = {
    title: 'Manage Blockchain Network Deployment',
    name: {
        label: 'Blockchain name',
        required: true,
        options: []
    }

}

export default class ClusterManageModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.model = this.setModel(this._getParsedModel(this.model))
        this.ClusterControllerApi = new ClusterControllerApi();
        console.log('Manage cluster ',this.model);
        let clusterInfo;
        switch(this.model.clusterStatus) {
            case "Pending" :
                clusterInfo = "Blockchain Network installation pending ...";
                break;
            case "Installed" :
                clusterInfo = "Blockchain Network installed successfully.";
                break;
            case "Fail" :
                clusterInfo = "Blockchain Network failed to install.";
                break;
            case "None" :
                clusterInfo = "Blockchain Network is ready to install.";
                break;
        }
        this.model.clusterStatusInfo = "Cluster status : "+clusterInfo;
        this.model.installNetworkVisible = this.model.clusterStatus === 'None' || this.model.clusterStatus === 'Pending';
        this.model.removeNetworkVisible = this.model.clusterStatus === 'Installed';
        this.model.updateNetworkVisible = this.model.clusterStatus === 'Installed';
        this.model.disableBlockchainName = true;
        this.model.disableAll = this.model.clusterStatus === 'Pending';
        this.model.viewLogs = this.model.clusterStatus === 'Installed';
        this.model.disableLogs = true;
        this.model.logs.value = 'Loading blockchain network logs ....';
        const builds = [];
        let log;
        if (this.model.clusterInstallationInfo)
        {
            JSON.parse(this.model.clusterInstallationInfo.pipelines).map(el => builds.push(
                {
                    buildNo: el.buildNo,
                    pipeline: el.name
                }))

            const getLogs = (jenkinsPipeline, buildNo) => {
                this.ClusterControllerApi.getPipelineLog(jenkinsPipeline, buildNo, this.model, (err, data) => {
                    let pipeLog;
                    if (err)
                    {
                        pipeLog = 'Failed to retrieve logs';
                        console.log(err);
                    } else {
                        pipeLog = data.message;
                    }
                    if (!log)
                    {
                        log = pipeLog;
                    } else {
                        log = log + '\n' + pipeLog;
                    }
                    if (builds.length === 0)
                    {
                        this.model.logs.value = log;
                        this.model.disableLogs = false;
                    }
                    else{
                        const cElem = builds.shift();
                        getLogs(cElem.pipeline, cElem.buildNo);
                    }
                })
            }

            const cElem = builds.shift();
            getLogs(cElem.pipeline, cElem.buildNo);
        }


        /*const buildNo = 32
        const jenkinsPipeline = 'gov-tests';

        this.ClusterControllerApi.getPipelineLog(jenkinsPipeline, buildNo, this.model, (err, data) => {
            if (err)
            {
                log = 'Failed to retrieve logs';
                console.log(err);
            } else {
                log = data.message;
            }
            this.model.logs.value = log;
        })*/
       /*
        this.ClusterControllerApi.getTestReport((err, result) => {
            if (err){
                return console.log(err);
            }
            let myWindow = window.open("", "_self");
            myWindow.document.write(result);
        })*/

        /*setTimeout(() => {
            this.model.disableAll = false;
        }, 4500);*/
        /*
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
        })*/

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
            pipelineToken: existingCluster.pipelineToken,
            clusterOperation: existingCluster.clusterOperation,
            config: existingCluster.config,
            clusterStatus: existingCluster.clusterStatus,
            clusterInstallationInfo: existingCluster.clusterInstallationInfo,
            logs :{
                value: ''
            }
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
                clusterOperation: this.model.clusterOperation,
                config: this.model.config,
                clusterStatus: 'Pending',
                clusterInstallationInfo: this.model.clusterInstallationInfo
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
