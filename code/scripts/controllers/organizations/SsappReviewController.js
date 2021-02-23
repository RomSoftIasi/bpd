import ContainerController from '../../../cardinal/controllers/base-controllers/ContainerController.js';

const initModel = {
    title: 'SsappReviewController'
}

export default class SsappReviewController extends ContainerController {
    constructor(element, history) {
        super(element, history);

        this.model = this.setModel(initModel)

        let receivedModel = this.History.getState();
        this.model.params = receivedModel.params;
        this.model.keySSI = receivedModel.seed;
    }
}