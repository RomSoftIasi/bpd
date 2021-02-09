import ContainerController from '../../../cardinal/controllers/base-controllers/ContainerController.js';
import OrganizationService from "./Services/OrganizationService.js";
import ClusterService from "./Services/ClusterService.js";

export default class ClustersController extends ContainerController {

    constructor(element, history) {
        super(element, history);

        this.OrganisationService = new OrganizationService(this.DSUStorage);
        this.ClusterService = new ClusterService(this.DSUStorage);

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
        })

        this._attachHandlerCreateCluster();
        this._attachHandlerShareCluster();
        this._attachHandlerEditCluster();
        this._attachHandlerGovernanceCluster();
        this._attachHandlerMonitoringCluster();
    }

    _attachHandlerCreateCluster() {
        this.on('cluster:create', (e) => {

            this.showModal('addClusterModal', {}, (err, cluster) => {
                if (err) {
                    console.log(err);
                    return;
                }
                //todo : show spinner/loading stuff
                this.ClusterService.saveCluster(this.model.organization.uid, cluster, (err, updatedCluster) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    this.model.clusters.push(updatedCluster);
                });
            });
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
            const uid = e.data;
            const clusterIndex = this.model.clusters.findIndex((cluster) => cluster.uid === uid);
            if (clusterIndex === -1) {
                console.log('Cluster not found @uid', uid, this.model.clusters);
                return;
            }

            const clusterToEdit = this.model.clusters[clusterIndex];
            let toSendObject = {
                organizationUid: this.model.organization.uid,
                cluster: clusterToEdit
            };
            this.showModal('editClusterModal', toSendObject, (err, response) => {
                if (err) {
                    console.log(err);
                    return;
                }
                debugger
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
                    this.ClusterService.updateCluster(uid, response, (err, updatedCluster) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        this.model.clusters[clusterIndex] = updatedCluster;
                    });
                }
            });
        });
    }

    _attachHandlerGovernanceCluster() {

        this.on('cluster:governance', (event) => {
            debugger;
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
}
