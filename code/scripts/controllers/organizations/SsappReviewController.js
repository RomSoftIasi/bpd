const {WebcController} = WebCardinal.controllers;

export default class SsappReviewController extends WebcController {
    constructor(...props) {
        super(...props);

        this.model = {}

        const receivedModel = this.getState();
        if (receivedModel) {
            this.model.params = receivedModel.params;
            this.model.keySSI = receivedModel.seed;
        }
    }
}