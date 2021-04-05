import ContainerController from '../../../cardinal/controllers/base-controllers/ContainerController.js';
import OrganizationService from "../services/OrganizationService.js";
import ClusterService from "../services/ClusterService.js";
import ClusterControllerApi from "../../../ClustersControllerApi.js";

export default class ClustersController extends ContainerController {

    constructor(element, history) {
        super(element, history);

        this.OrganisationService = new OrganizationService(this.DSUStorage);
        this.ClusterService = new ClusterService(this.DSUStorage);
        this.ClusterControllerApi = new ClusterControllerApi();

        this.setModel({});
        let orgUid = this.History.getState();

        this.OrganisationService.getOrganization(orgUid, (err, organization) => {
            if (err) {
                console.log(err);
                return;
            }
            this.model.organization = organization;
        })

        this.ClusterService.getClustersModel(orgUid, (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            this.model.clusters = data.clusters;
            this.model.clusters.map(el => el.nameWithStatus = this.getClusterNameWithStatus(el));
            /*
            this.model.clusters.forEach(el => {
                el.clusterStatus = 'Installed';
                const clusterIndex = this.model.clusters.findIndex((cluster) => cluster.uid === el.uid);
                this._saveClusterInfo(this.model.organization.uid,el,clusterIndex,(err, data)=>{
                  if (err) {
                      return console.log('_saveClusterInfo error: ',err, el);
                  }
                  console.log('_saveClusterInfo done :',data);
                });
            })
            */

            this.model.clusters.forEach(cluster => {
                if (cluster.clusterStatus === 'Pending')
                {
                    this._reconnectAndWaitForClusterInstallationToFinish(cluster);
                }
            })
        })

        this._attachHandlerInitiateNetworkOnCluster();
        this._attachHandlerEditCluster();
        this._attachHandlerShareCluster();
        this._attachHandlerManageCluster();
        this._attachHandlerGovernanceCluster();
        this._attachHandlerMonitoringCluster();
        this._attachEventEmmiter();
    }
    getClusterNameWithStatus(clusterModel){
        return clusterModel.name +' - '+ this.ClusterService.getClusterUIStatus(clusterModel.clusterStatus)
    }
    _attachEventEmmiter() {
        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });
    }

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

    _attachHandlerInitiateNetworkOnCluster() {
        this.on('cluster:initiatenetwork', (e) => {
            this._showModal('initiateNetworkModal', {title:'Initiate Network'}, (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(data);
                this.ClusterService.saveCluster(this.model.organization.uid, data, (err, updatedCluster) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    updatedCluster.nameWithStatus = this.getClusterNameWithStatus(updatedCluster);
                    this.model.clusters.push(updatedCluster);
                });
            })
        });
    }

    _attachHandlerShareCluster() {
        this.on('cluster:share', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            const uid = e.data;
            const clusterIndex = this.model.clusters.findIndex((cluster) => cluster.uid === uid);
            if (clusterIndex === -1) {
                console.log('Cluster not found @uid', uid, this.model.clusters);
                return;
            }

            const clusterToShare = this.model.clusters[clusterIndex];
            let qrCodeModalModel = {
                title: `QRCode for ${clusterToShare.name}`,
                description: `Scan the code above to get your cluster data`,
                data: {
                    identifier: clusterToShare.uid
                }
            }
            this.showModal('shareQRCodeModal', qrCodeModalModel);
        })
    }

    _attachHandlerEditCluster() {
        this.on('cluster:edit', (e) => {
            const clusterUid = e.data;
            const clusterIndex = this.model.clusters.findIndex((cluster) => cluster.uid === clusterUid);
            if (clusterIndex === -1) {
                console.log('Cluster not found @uid', clusterUid, this.model.clusters);
                return;
            }

            const clusterToEdit = this.model.clusters[clusterIndex];

            if (clusterToEdit.clusterOperation === 'initiateNetwork')
            {
                let toSendObject = {
                    ...clusterToEdit,
                    readOnlyMode: true,
                    title: 'Initiate Network parameters'
                }
                this._showModal('initiateEditNetworkModal', toSendObject, (err, clusterData) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    this._saveClusterInfo(this.model.organization.uid, clusterData, clusterIndex, (err) => {
                        if (err) {
                            return console.log("Failed to save cluster details!");
                        }
                        clusterData.nameWithStatus = this.getClusterNameWithStatus(clusterData);
                        return;
                    })
                })
            }

        });
    }

    _attachHandlerManageCluster() {
        this.on('cluster:manage', (e) => {
            const clusterUid = e.data;
            const clusterIndex = this.model.clusters.findIndex((cluster) => cluster.uid === clusterUid);
            if (clusterIndex === -1) {
                console.log('Cluster not found @uid', clusterUid, this.model.clusters);
                return;
            }

            const clusterToEdit = this.model.clusters[clusterIndex];
            let toSendObject = {
                organizationUid: this.model.organization.uid,
                cluster: clusterToEdit
            };

            this.showModal('manageClusterModal', toSendObject, (err, response) => {
                if (err) {
                    console.log(err);
                    return;
                }
                this._emitFeedback(e, "Cluster installation was initiated ...", "alert-success");
                console.log('install cluster data',response);
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
                    if (response.clusterOperation === "initiateNetwork" ) {
                        console.log("Initiate Network was started ...", response.name);
                        console.log(response);
                        //todo : define pipeline based on scenario
                        this._saveClusterInfo(this.model.organization.uid, response, clusterIndex, (err) => {
                            if (err) {
                                return console.log("Failed to save cluster details!");
                            }
                            response.nameWithStatus = this.getClusterNameWithStatus(response);
                            this._initiateAndWaitToInstallCluster(response, (err, data) => {
                                if (err) {
                                    response.clusterStatus = 'Fail';
                                    response.clusterInstallationInfo = err;
                                    console.log(e, "Failed to install cluster!");
                                }
                                else {
                                    console.log("Cluster installation was Initiated!");
                                    response.clusterStatus = 'Installed';
                                    response.clusterInstallationInfo = data;
                                }
                                response.nameWithStatus = this.getClusterNameWithStatus(response);
                                this._saveClusterInfo(this.model.organization.uid, response, clusterIndex, (err) => {
                                    if (err) {
                                        return console.log("Failed to save cluster details!");
                                    }
                                    response.nameWithStatus = this.getClusterNameWithStatus(response);
                                })
                            })
                        })
                    } else {
                        this._saveClusterInfo(this.model.organization.uid, response, clusterIndex, (err) => {
                            if (err) {
                                return console.log("Failed to save cluster details!");
                            }
                            response.nameWithStatus = this.getClusterNameWithStatus(response);
                            return;
                        })
                    }
                }
            });
        });
    }

    _saveClusterInfo(orguid, clusterDetails, clusterIndex, callback) {
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

    _reconnectAndWaitForClusterInstallationToFinish(clusterDetails){
        const clusterIndex = this.model.clusters.findIndex((cluster) => cluster.uid === clusterDetails.uid);
        this._waitForClusterInstallationToFinish(clusterDetails.name, (err, data) => {
            if (err) {
                clusterDetails.clusterStatus = 'Fail';
                clusterDetails.clusterInstallationInfo = err;
                console.log(e, "Failed to install cluster!");
            }
            else {
                console.log("Cluster installation was Initiated!");
                clusterDetails.clusterStatus = 'Installed';
                clusterDetails.clusterInstallationInfo = data;
            }
            clusterDetails.nameWithStatus = this.getClusterNameWithStatus(clusterDetails);
            this._saveClusterInfo(this.model.organization.uid, clusterDetails, clusterIndex, (err) => {
                if (err) {
                    return console.log("Failed to save cluster details!");
                }
                clusterDetails.nameWithStatus = this.getClusterNameWithStatus(clusterDetails);
            })
        })
    }

    _initiateAndWaitToInstallCluster(clusterDetails, callback)
    {
        //initiate cluster installation and check from time to time to check if the installation is done

        this._initiateInstallCluster(clusterDetails, (err, data) => {
            if (err){
                return callback(err, undefined);
            }
            this._waitForClusterInstallationToFinish(clusterDetails.name, (err, data) => {
                if (err){
                    return callback(err, undefined);
                }
                return callback(undefined, data);
            })
        })
    }

    _waitForClusterInstallationToFinish(blockchainNetworkName, callback){
        this.ClusterControllerApi.loopUntilClusterIsInstalled(blockchainNetworkName, callback);
    }

    _initiateInstallCluster(clusterDetails, callback) {
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

    _attachHandlerGovernanceCluster() {
        this.on('cluster:governance', (event) => {
            let toSendObject = {
                organizationUid: this.model.organization.uid,
                clusterUid: event.data
            }

            this.History.navigateToPageByTag('governance', toSendObject);
        });
    }

    _attachHandlerMonitoringCluster() {
        this.on('cluster:monitoring', (event) => {
            let toSendObject = {
                organizationUid: this.model.organization.uid,
                clusterUid: event.data
            }

            this.History.navigateToPageByTag('monitoring', toSendObject);
        });
    }

    _emitFeedback(event, message, alertType) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (typeof this.feedbackEmitter === 'function') {
            this.feedbackEmitter(message, "Info", alertType)
        }
    }
}
