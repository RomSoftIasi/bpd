const {WebcController} = WebCardinal.controllers;
import BlockchainDomainService from "../../services/e-governance/BlockchainDomainService.js";
import * as Loader from "../../WebcSpinnerController.js";
import {validateFormRequiredFields} from "../../../utils/utils.js";

export default class EditBlockchainDomainController extends WebcController {
    constructor(...props) {
        super(...props);

        const {organizationUid, blockchainDomainUid} = this.getState();
        this.model = {
            deploymentConfigurationPlaceholder: `{
                    // additional configuration in JSON format
                    "registry": "docker.io"
                }`,
            blockchainDomainModel: {}
        };
        this.BlockchainDomainService = new BlockchainDomainService(this.DSUStorage);

        this.initNavigationListeners();
        this.getBlockchainDomainInformation(organizationUid, blockchainDomainUid);
    }

    initNavigationListeners() {
        this.onTagClick("back", () => {
            this.history.goBack();
        });

        this.onTagClick("update-network", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.updateNetwork();
        });
    }

    getBlockchainDomainInformation(organizationUid, blockchainDomainUid) {
        Loader.displayLoader();
        this.BlockchainDomainService.getBlockchainDomainData(organizationUid, blockchainDomainUid, (err, blockchainDomainData) => {
            Loader.hideLoader();
            if (err) {
                return console.error(err);
            }

            this.model.organizationUid = organizationUid;
            this.model.blockchainDomainModel = {
                ...blockchainDomainData,
                blockchainDomainUid: blockchainDomainUid
            };
        });
    }

    updateNetwork() {
        if (!validateFormRequiredFields.call(this)) {
            return;
        }

        Loader.displayLoader();
        const blockchainDomainData = this.model.toObject("blockchainDomainModel");
        this.BlockchainDomainService.updateBlockchainDomainData(this.model.organizationUid, blockchainDomainData, (err, result) => {
            Loader.hideLoader();
            if (err) {
                return console.error(err);
            }

            console.log(result);
            this.navigateToPageTag("blockchain-domains-dashboard", {
                organizationUid: this.model.organizationUid
            });
        });
    }
}