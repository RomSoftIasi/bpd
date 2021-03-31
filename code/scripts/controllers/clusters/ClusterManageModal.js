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
            const pipelines = JSON.parse(this.model.clusterInstallationInfo.pipelines)
            pipelines.map(el => builds.push(
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

        //this.quickTest();


        this._attachHandlerMonitoringCluster();
        this._attachHandlerDeleteCluster();
        this._attachHandlerGovernanceCluster();
        this._attachHandlerInstallCluster();
        this._attachHandlerCICluster();
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

    _attachHandlerCICluster() {
        this.on('cls:continuous-integration', (event) => {
           this.showTestReport();
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

/*
    quickTest(){
        this.ClusterControllerApi.getTestReport('gov-tests', 51,'privatesky/testReport.html', this.model,(err, htmlContent) => {
            if (err)
            {
                return console.log(err);
            }

            //const innerHtml = Buffer.from(htmlContent, 'base64').toString('ascii');
            let myWindow = window.open("", "MsgWindow", "width=800,height=600");
            myWindow.document.write(htmlContent);
        })
    }
*/

    showTestReport(){
        let artefacts = [];
        if (this.model.clusterInstallationInfo){
            console.log('Gather artefacts ...')
            const pipelines = JSON.parse(this.model.clusterInstallationInfo.pipelines)
            console.log(pipelines);
            pipelines.map(el =>{
                console.log(el);
                if (el.artifacts && el.artifacts.length > 0)
                {
                    el.artifacts.map(art => artefacts.push({
                        buildNo: el.buildNo,
                        jenkinsPipeline: el.name,
                        artefactName: art.relativePath
                    }))
                }
            })
            console.log(artefacts);
            if (artefacts.length === 0){
                return;
            }
            const artefact = artefacts[0];
            this.ClusterControllerApi.getTestReport(artefact.jenkinsPipeline, artefact.buildNo,artefact.artefactName, this.model,(err, htmlContent) => {
                if (err)
                {
                    return console.log(err);
                }
                let myWindow = window.open("", "MsgWindow", "width=800,height=600");
                myWindow.document.write(htmlContent);
            })
        }
    }
}
