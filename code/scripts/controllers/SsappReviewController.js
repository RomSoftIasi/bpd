import BPDController from "./base-controllers/BPDController.js";
import ClusterModel from "../models/ClusterModel.js"


const initModel = {
    title: 'SsappReviewController'
}

export default class SsappReviewController extends BPDController {
    constructor(element, history) {
        super(element, history);
        this.model = this.setModel(initModel)
        this._initModel();
    }

    _initModel() {
        this.model.params = this.parseHashFragmentParams();
        this.model.keySSI = this.model.params.seed;
    }
}