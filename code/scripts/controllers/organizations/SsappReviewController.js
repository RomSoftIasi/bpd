const {WebcController} = WebCardinal.controllers;

export default class SsappReviewController extends WebcController {
    constructor(...props) {
        super(...props);

        this.model = {}

        // TODO: Replace this when a solution has been found
        const receivedModel = this.history.win.history.state.state;
        if (receivedModel) {
            this.model.params = receivedModel.params;
            this.model.keySSI = receivedModel.seed;
        }
    }
}