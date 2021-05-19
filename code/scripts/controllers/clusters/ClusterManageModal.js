const {WebcController} = WebCardinal.controllers;
import ClusterControllerApi from "../../../ClustersControllerApi.js";

export default class ClusterManageModal extends WebcController {
    constructor(...props) {
        super(...props);

        this.model = this.getParsedModel(this.model);
        this.ClusterControllerApi = new ClusterControllerApi();
        console.log('Manage cluster ', this.model);
        let clusterInfo;
        switch (this.model.clusterStatus) {
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

        this.model.clusterStatusInfo = "Cluster status : " + clusterInfo;
        this.model.installNetworkVisible = this.model.clusterStatus === 'None' || this.model.clusterStatus === 'Pending';
        this.model.removeNetworkVisible = this.model.clusterStatus === 'Installed' || this.model.clusterStatus === 'Fail';
        this.model.updateNetworkVisible = this.model.clusterStatus === 'Installed';
        this.model.disableAll.disabled = this.model.clusterStatus === 'Pending';
        this.model.viewLogs = this.model.clusterStatus === 'Installed' || this.model.clusterStatus === 'Fail';
        const builds = [];
        let log;
        if (this.model.clusterInstallationInfo) {
            const pipelines = JSON.parse(this.model.clusterInstallationInfo.pipelines)
            pipelines.map(el => builds.push(
                {
                    buildNo: el.buildNo,
                    pipeline: el.name
                }))

            const getLogs = (jenkinsPipeline, buildNo) => {
                this.ClusterControllerApi.getPipelineLog(jenkinsPipeline, buildNo, this.model, (err, data) => {
                    let pipeLog;
                    if (err) {
                        pipeLog = 'Failed to retrieve logs';
                        console.log(err);
                    } else {
                        pipeLog = data.message;
                    }
                    if (!log) {
                        log = pipeLog;
                    } else {
                        log = log + '\n' + pipeLog;
                    }
                    if (builds.length === 0) {
                        this.model.logs.value = log;
                        this.model.logs.readonly = false;
                    } else {
                        const cElem = builds.shift();
                        getLogs(cElem.pipeline, cElem.buildNo);
                    }
                })
            }

            const cElem = builds.shift();
            getLogs(cElem.pipeline, cElem.buildNo);
        }

        //this.quickTest();

        this.attachHandlerMonitoringCluster();
        this.attachHandlerDeleteCluster();
        this.attachHandlerGovernanceCluster();
        this.attachHandlerInstallCluster();
        this.attachHandlerCICluster();
        this.attachEventEmmiter();
    }

    getParsedModel(receivedModel) {
        let existingCluster = receivedModel.cluster;
        let model = {
            name: {
                label: 'Blockchain name',
                required: true,
                options: [],
                readonly: true,
                value: existingCluster.name
            },
            logs: {
                value: 'Loading blockchain network logs ....',
                readonly: true
            },
            disableAll: {
                disabled: false
            },
            organizationUid: receivedModel.organizationUid,
            clusterUid: existingCluster.uid,
            jenkins: existingCluster.jenkins,
            user: existingCluster.user,
            token: existingCluster.token,
            pipelineToken: existingCluster.pipelineToken,
            clusterOperation: existingCluster.clusterOperation,
            config: existingCluster.config,
            clusterStatus: existingCluster.clusterStatus,
            clusterInstallationInfo: existingCluster.clusterInstallationInfo
        };

        return model;
    }

    attachHandlerInstallCluster() {
        this.onTagClick('cls:installcluster', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

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
            };

            this.emitFeedback("Cluster installation was initiated ...", "alert-success");
            setTimeout(() => {
                this.send('confirmed', toReturnObject);
            }, 4500);
        });
    }

    attachHandlerMonitoringCluster() {
        this.onTagClick('cls:monitoring', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            let toSendObject = {
                organizationUid: this.model.organizationUid,
                clusterUid: this.model.clusterUid
            }

            this.navigateToPageTag('monitoring', toSendObject);
        });
    }

    attachHandlerGovernanceCluster() {
        this.onTagClick('cls:governance', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            let toSendObject = {
                organizationUid: this.model.organizationUid,
                clusterUid: this.model.clusterUid
            };

            this.navigateToPageTag('governance', toSendObject);
        });
    }

    attachHandlerDeleteCluster() {
        this.on('cls:delete', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.send('confirmed', {
                delete: true
            });
        });
    }

    attachHandlerCICluster() {
        this.onTagClick('cls:continuous-integration', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.showTestReport();
        });
    }

    emitFeedback(message, alertType) {
        if (typeof this.feedbackEmitter === 'function') {
            this.feedbackEmitter(message, "Info", alertType)
        }
    }

    attachEventEmmiter() {
        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });
    }

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

    showTestReport() {
        let artefacts = [];
        if (this.model.clusterInstallationInfo) {
            console.log('Gather artefacts ...')
            const pipelines = JSON.parse(this.model.clusterInstallationInfo.pipelines)
            console.log(pipelines);
            pipelines.map(el => {
                console.log(el);
                if (el.artifacts && el.artifacts.length > 0) {
                    el.artifacts.map(art => artefacts.push({
                        buildNo: el.buildNo,
                        jenkinsPipeline: el.name,
                        artefactName: art.relativePath
                    }))
                }
            })
            console.log(artefacts);
            if (artefacts.length === 0) {
                return;
            }
            const artefact = artefacts[0];
            this.ClusterControllerApi.getTestReport(artefact.jenkinsPipeline, artefact.buildNo, artefact.artefactName, this.model, (err, htmlContent) => {
                if (err) {
                    return console.log(err);
                }
                let myWindow = window.open("", "MsgWindow", "width=800,height=600");
                myWindow.document.write(htmlContent);
            })
        }
    }
}
