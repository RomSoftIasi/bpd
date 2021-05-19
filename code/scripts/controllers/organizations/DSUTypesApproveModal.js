const {WebcController} = WebCardinal.controllers;
import ClusterService from "../services/ClusterService.js";

export default class DSUTypesApproveModal extends WebcController {
    constructor(...props) {
        super(...props);

        // TODO: Replace this when a solution has been found
        let receivedModel = this.history.win.history.state.state;
        this.model = {
            dsuTypes: [],
            ...receivedModel
        }
        this.ClusterService = new ClusterService(this.DSUStorage);

        this.ClusterService.getCluster(receivedModel.organizationUid, receivedModel.clusterUid, (err, cluster) => {
            if (err) {
                return console.error(err);
            }

            this.model.cluster = cluster;
            this.model.dsuTypes = this.model.cluster.dsuTypes || [];
        });

        this.attachHandlerCreateDSUType();
        this.attachHandlerApproveDSUType();
        this.attachHandlerOpenDSUType();
        this.attachHandlerReviewDSUType();
        this.attachHandlerFinishDSUType();
    }

    attachHandlerCreateDSUType() {
        this.onTagClick('dsu:add-dsuType-config', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            const id = (Date.now() + Math.random()).toString().replace('.', '');
            this.model.dsuTypes.push({
                id: {
                    value: id
                },
                approved: false,
                reviewed: false,
                seed: {
                    placeholder: 'Seed',
                    name: 'Seed',
                    readOnly: false
                },
                name: {
                    placeholder: 'Name',
                    name: 'Name',
                    readOnly: false
                }
            });
        });
    }

    attachHandlerApproveDSUType() {
        this.onTagClick('dsu:approve', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            let dsuTypes = this.model.dsuTypes;
            let dsuTypeIndex = dsuTypes.findIndex(dsuType => dsuType.id.value === model.id.value);
            if (dsuTypeIndex === -1) {
                return console.error(`DSU Type with id:${model.id.value} not found!`);
            }

            dsuTypes[dsuTypeIndex].approved = true;
            dsuTypes[dsuTypeIndex].name.readOnly = true;
            dsuTypes[dsuTypeIndex].seed.readOnly = true;
            this.model.dsuTypes = JSON.parse(JSON.stringify(dsuTypes));
        });
    }

    attachHandlerReviewDSUType() {
        this.onTagClick('dsu:review', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            let toSendObject = {
                organizationUid: this.model.organizationUid,
                clusterUid: this.model.uid,
                seed: model.seed.value
            }

            this.navigateToPageTag('ssapp-review', toSendObject);
        });
    }

    attachHandlerOpenDSUType() {
        this.onTagClick('dsu:open', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            let toSendObject = {
                organizationUid: this.model.organizationUid,
                clusterUid: this.model.uid,
                seed: model.seed.value
            }

            this.navigateToPageTag('ssapp-review', toSendObject);
        });
    }

    attachHandlerFinishDSUType() {
        this.onTagClick('dsu:finish', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.model.cluster.dsuTypes = this.model.dsuTypes;
            this.ClusterService.updateCluster(this.model.organizationUid, this.model.cluster, (err, data) => {
                if (err) {
                    return console.error(err);
                }
            });

            this.send('confirmed', {});
        });
    }
}
