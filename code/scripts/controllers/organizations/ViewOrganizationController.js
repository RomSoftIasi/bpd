const {WebcController} = WebCardinal.controllers;
import OrganizationService from "../services/OrganizationService.js";
import BlockchainDomainService from "../services/BlockchainDomainService.js";
import * as Loader from "../WebcSpinnerController.js";
import {getFormattedDate} from "../../utils/utils.js";

export default class ViewOrganizationController extends WebcController {
    constructor(...props) {
        super(...props);

        const {organizationUid} = this.getState();
        this.model = {organizationUid: organizationUid};

        this.OrganizationService = new OrganizationService();
        this.BlockchainDomainService = new BlockchainDomainService();

        this.initNavigationListeners();
        this.getOrganizationData();
    }

    initNavigationListeners() {
        this.onTagClick("back", () => {
            this.history.goBack();
        });
    }

    getOrganizationData() {
        Loader.displayLoader();
        this.OrganizationService.getOrganizationData(this.model.organizationUid, (err, organizationData) => {
            Loader.hideLoader();
            if (err) {
                return console.error(err);
            }

            organizationData.createdAt = getFormattedDate(organizationData.createdAt);
            this.model.organizationData = organizationData;
            this.BlockchainDomainService.listBlockchainDomains(organizationData.uid, (err, blockchainDomainsList) => {
                if (err) {
                    console.error(err);
                } else {
                    this.model.organizationData.numberOfClusters = blockchainDomainsList.length;
                }
            });
        });
    }
}