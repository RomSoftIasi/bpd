const {WebcController} = WebCardinal.controllers;
import OrganizationService from "../services/OrganizationService.js";
import ClusterService from "../services/ClusterService.js";
import ClusterControllerApi from "../../../ClustersControllerApi.js";

export default class ClustersController extends WebcController {

    constructor(...props) {
        console.log('ClustersController ctor');
        super(...props);

        this.OrganisationService = new OrganizationService(this.DSUStorage);
        this.ClusterService = new ClusterService(this.DSUStorage);
        this.ClusterControllerApi = new ClusterControllerApi();

        this.model = {
            organization: {},
            clusters: []
        };

        // TODO: Replace this when a solution has been found
        let orgUid = this.history.win.history.state.state;

        this.OrganisationService.getOrganization(orgUid, (err, organization) => {
            if (err) {
                return console.error(err);
            }

            this.model.organization = organization;
            console.log(this.model.toObject("organization"));
        });

        this.ClusterService.getClustersModel(orgUid, (err, data) => {
            if (err) {
                return console.error(err);
            }

            this.model.clusters = data.clusters.map(el => {
                el.nameWithStatus = this.getClusterNameWithStatus(el);
                return el;
            });

            console.log(this.model.toObject("clusters"));
            /*
            this.model.clusters.forEach(el => {
                el.clusterStatus = 'Installed';
                const clusterIndex = this.model.clusters.findIndex((cluster) => cluster.uid === el.uid);
                this.saveClusterInfo(this.model.organization.uid,el,clusterIndex,(err, data)=>{
                  if (err) {
                      return console.log('saveClusterInfo error: ',err, el);
                  }
                  console.log('saveClusterInfo done :',data);
                });
            })
            */

            this.model.clusters.forEach(cluster => {
                if (cluster.clusterStatus === 'Pending') {
                    this.reconnectAndWaitForClusterInstallationToFinish(cluster);
                }
            });
        });

        this.attachHandlerInitiateNetworkOnCluster();
        this.attachHandlerEditCluster();
        this.attachHandlerShareCluster();
        this.attachHandlerManageCluster();
        this.attachHandlerGovernanceCluster();
        this.attachHandlerMonitoringCluster();
        this.attachEventEmmiter();
    }

    getClusterNameWithStatus(clusterModel) {
        return clusterModel.name + ' - ' + this.ClusterService.getClusterUIStatus(clusterModel.clusterStatus);
    }

    attachEventEmmiter() {
        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });
    }

    modalErrorHandler = (event) => {
        const error = event.detail || null

        if (error && error !== true) {
            console.error(error);
        }
    }

    // TODO: Check with Bogdan to understand the use-case of redirect
    _showModal(modalName, existingData, callback) {
        this.showModal(modalName, existingData, (err, response) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            let toSendObject = JSON.parse(JSON.stringify({
                ...existingData,
                ...response.data
            }))
            if (response.redirect) {
                this._showModal(response.redirect, toSendObject, callback);
            } else {
                callback(undefined, toSendObject);
            }
        });
    }

    attachHandlerInitiateNetworkOnCluster() {
        this.onTagClick('cluster:initiatenetwork', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            const modalConfiguration = {
                controller: 'clusters/InitiateNetworkModal',
                disableBackdropClosing: false
            };

            this.showModalFromTemplate('clusters/operations/initiate-network', (event) => {
                const clusterInformation = event.detail;
                console.log(clusterInformation);
                this.ClusterService.saveCluster(this.model.organization.uid, clusterInformation, (err, updatedCluster) => {
                    if (err) {
                        return console.error(err);
                    }

                    updatedCluster.nameWithStatus = this.getClusterNameWithStatus(updatedCluster);
                    this.model.clusters.push(updatedCluster);
                });
            }, this.modalErrorHandler, modalConfiguration);
        });
    }

    attachHandlerEditCluster() {
        this.onTagClick('cluster:edit', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            // Enable edit only if cluster operation is initiateNetwork
            if (model.clusterOperation !== 'initiateNetwork') {
                return;
            }

            const modalConfiguration = {
                model: model,
                controller: 'clusters/EditNetworkModal',
                disableBackdropClosing: false
            };

            this.showModalFromTemplate('clusters/operations/initiate-edit-network', (event) => {
                const clusterData = event.detail;
                console.log(clusterData);

                const clusterIndex = this.model.clusters.findIndex((cluster) => cluster.uid === model.uid);
                this.saveClusterInfo(this.model.organization.uid, clusterData, clusterIndex, (err) => {
                    if (err) {
                        return console.log("Failed to save cluster details!");
                    }

                    clusterData.nameWithStatus = this.getClusterNameWithStatus(clusterData);
                });
            }, this.modalErrorHandler, modalConfiguration);
        });
    }

    attachHandlerShareCluster() {
        this.onTagClick('cluster:share', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            model.description = 'Scan the code above to get your cluster data';
            const modalConfiguration = {
                model: model,
                controller: 'ShareQRCodeController',
                disableBackdropClosing: false,
                disableFooter: true
            };

            this.showModalFromTemplate('share-qrcode-modal',
                (event) => {
                    const response = event.detail;
                    console.log(response);

                }, this.modalErrorHandler, modalConfiguration);
        })
    }

    attachHandlerGovernanceCluster() {
        this.onTagClick('cluster:governance', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            let toSendObject = {
                organizationUid: this.model.organization.uid,
                clusterUid: model.uid
            };

            this.navigateToPageTag('governance', toSendObject);
        });
    }

    attachHandlerMonitoringCluster() {
        this.onTagClick('cluster:monitoring', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            let toSendObject = {
                organizationUid: this.model.organization.uid,
                clusterUid: model.uid
            };

            this.navigateToPageTag('monitoring', toSendObject);
        });
    }

    attachHandlerManageCluster() {
        this.onTagClick('cluster:manage', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            const clusterIndex = this.model.clusters.findIndex((cluster) => cluster.uid === model.uid);
            const clusterToEdit = JSON.parse(JSON.stringify(model));
            let toSendObject = {
                organizationUid: this.model.organization.uid,
                cluster: clusterToEdit
            };

            const modalConfiguration = {
                model: toSendObject,
                controller: 'clusters/ClusterManageModal',
                disableBackdropClosing: false
            };

            this.showModalFromTemplate('clusters/manage-cluster-modal', (event) => {
                const response = event.detail;
                this.emitFeedback("Cluster installation was initiated ...", "alert-success");
                console.log('install cluster data', response);

                //todo : show spinner/loading stuff
                if (response.delete) {
                    this.ClusterService.unmountCluster(this.model.organization.uid, clusterToEdit.uid, (err, result) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        console.log('Removed cluster with @uid', clusterToEdit.uid, result);
                        this.model.clusters.splice(clusterIndex, 1);
                    });
                } else {
                    if (response.clusterOperation === "initiateNetwork") {
                        console.log("Initiate Network was started ...", response.name);
                        console.log(response);
                        //todo : define pipeline based on scenario
                        this.saveClusterInfo(this.model.organization.uid, response, clusterIndex, (err) => {
                            if (err) {
                                return console.log("Failed to save cluster details!");
                            }
                            response.nameWithStatus = this.getClusterNameWithStatus(response);
                            this.initiateAndWaitToInstallCluster(response, (err, data) => {
                                if (err) {
                                    response.clusterStatus = 'Fail';
                                    response.clusterInstallationInfo = err;
                                    console.log(e, "Failed to install cluster!");
                                } else {
                                    console.log("Cluster installation was Finished!");
                                    if (data.pipelinesStatus === 'ERROR') {
                                        response.clusterStatus = 'Fail';
                                    } else {
                                        response.clusterStatus = 'Installed';
                                    }
                                    response.clusterInstallationInfo = data;
                                }
                                response.nameWithStatus = this.getClusterNameWithStatus(response);
                                this.saveClusterInfo(this.model.organization.uid, response, clusterIndex, (err) => {
                                    if (err) {
                                        return console.log("Failed to save cluster details!");
                                    }
                                    response.nameWithStatus = this.getClusterNameWithStatus(response);
                                })
                            })
                        })
                    } else {
                        this.saveClusterInfo(this.model.organization.uid, response, clusterIndex, (err) => {
                            if (err) {
                                return console.log("Failed to save cluster details!");
                            }
                            response.nameWithStatus = this.getClusterNameWithStatus(response);

                        })
                    }
                }
            }, this.modalErrorHandler, modalConfiguration);
        });
    }

    saveClusterInfo(orguid, clusterDetails, clusterIndex, callback) {
        this.ClusterService.updateCluster(orguid, clusterDetails, (err, updatedCluster) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            this.model.clusters[clusterIndex] = updatedCluster;
            console.log('Saved cluster : ', updatedCluster);
            return callback(undefined);
        });
    }

    reconnectAndWaitForClusterInstallationToFinish(clusterDetails) {
        const clusterIndex = this.model.clusters.findIndex((cluster) => cluster.uid === clusterDetails.uid);
        this.waitForClusterInstallationToFinish(clusterDetails.name, (err, data) => {
            if (err) {
                clusterDetails.clusterStatus = 'Fail';
                clusterDetails.clusterInstallationInfo = err;
                console.log(e, "Failed to install cluster!");
            } else {
                console.log("Cluster installation was Finished!");
                if (data.pipelinesStatus === 'ERROR') {
                    clusterDetails.clusterStatus = 'Fail';
                } else {
                    clusterDetails.clusterStatus = 'Installed';
                }
                clusterDetails.clusterInstallationInfo = data;
            }
            clusterDetails.nameWithStatus = this.getClusterNameWithStatus(clusterDetails);
            this.saveClusterInfo(this.model.organization.uid, clusterDetails, clusterIndex, (err) => {
                if (err) {
                    return console.log("Failed to save cluster details!");
                }
                clusterDetails.nameWithStatus = this.getClusterNameWithStatus(clusterDetails);
            })
        })
    }

    initiateAndWaitToInstallCluster(clusterDetails, callback) {
        //initiate cluster installation and check from time to time to check if the installation is done

        this.initiateInstallCluster(clusterDetails, (err, data) => {
            if (err) {
                return callback(err, undefined);
            }
            this.waitForClusterInstallationToFinish(clusterDetails.name, (err, data) => {
                if (err) {
                    return callback(err, undefined);
                }
                return callback(undefined, data);
            })
        })
    }

    waitForClusterInstallationToFinish(blockchainNetworkName, callback) {
        this.ClusterControllerApi.loopUntilClusterIsInstalled(blockchainNetworkName, callback);
    }

    initiateInstallCluster(clusterDetails, callback) {
        let installClusterInfo = {
            blockchainNetwork: clusterDetails.name,
            user: clusterDetails.user,
            token: clusterDetails.token,
            jenkins: clusterDetails.jenkins,
            pipelineToken: clusterDetails.pipelineToken,
            clusterOperation: clusterDetails.clusterOperation,
            configMap: clusterDetails.config,
            clusterStatus: clusterDetails.clusterStatus
        }
        console.log(installClusterInfo);
        console.log(clusterDetails);
        this.ClusterControllerApi.startDeployCluster(installClusterInfo, (err, data) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            callback(undefined, data);
        });
    }

    emitFeedback(message, alertType) {
        if (typeof this.feedbackEmitter === 'function') {
            this.feedbackEmitter(message, "Info", alertType)
        }
    }
}
