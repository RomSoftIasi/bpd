const {WebcController} = WebCardinal.controllers;
import BlockchainDomainService from "../services/BlockchainDomainService.js";
import * as Loader from "../WebcSpinnerController.js";

export default class ViewBlockchainDomainController extends WebcController {
    constructor(...props) {
        super(...props);

        const {organizationUid, blockchainDomainUid} = this.getState();
        this.model = {};
        this.BlockchainDomainService = new BlockchainDomainService(this.DSUStorage);

        this.initNavigationListeners();
        this.getBlockchainDomainInformation(organizationUid, blockchainDomainUid);
    }

    initNavigationListeners() {
        this.onTagClick("back", () => {
            this.history.goBack();
        });
    }

    getBlockchainDomainInformation(organizationUid, blockchainDomainUid) {
        Loader.displayLoader();
        this.BlockchainDomainService.getBlockchainDomainData(organizationUid, blockchainDomainUid, (err, blockchainDomainData) => {
            Loader.hideLoader();
            if (err) {
                return console.error(err);
            }

            this.model = blockchainDomainData;
            const {status} = this.translationModel.statuses[blockchainDomainData.dataStatus];
            this.model.status = status;
            const {isInstalled, isInstallFailed} = blockchainDomainData;
            this.model.displayLogs = isInstalled || isInstallFailed;
        });
    }
}