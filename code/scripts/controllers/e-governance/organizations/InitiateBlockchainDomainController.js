const {WebcController} = WebCardinal.controllers;
import BlockchainDomainService from "../../services/e-governance/BlockchainDomainService.js";
import * as Loader from "../../WebcSpinnerController.js";

export default class InitiateBlockchainDomainController extends WebcController {
    constructor(...props) {
        super(...props);

        const organizationUid = this.getState().organizationUid;
        this.model = {
            organizationUid: organizationUid,
            ...this.getFormViewModel()
        };
        this.BlockchainDomainService = new BlockchainDomainService(this.DSUStorage);

        this.initNavigationListeners();
    }

    initNavigationListeners() {
        this.onTagClick("back", () => {
            this.history.goBack();
        });

        this.onTagClick("save-network", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.saveNetwork();
        });
    }

    saveNetwork() {
        const blockchainDomainData = this.model.toObject("blockchainDomainModel");
        Loader.displayLoader();
        this.BlockchainDomainService.createBlockchainDomain(this.model.organizationUid, blockchainDomainData, (err, result) => {
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

    getFormViewModel() {
        return {
            blockchainDomainModel: {
                mainDomain: "",
                subdomain: "",
                vaultDomain: "",
                jenkins: "",
                jenkinsUserName: "",
                jenkinsToken: "",
                githubRepositoryURL: "",
                githubRepositoryAccessToken: "",
                deploymentConfiguration: ""
            },
            deploymentConfigurationPlaceholder: `{
                    // additional configuration in JSON format
                    "registry": "docker.io"
                }`
        };
    }
}