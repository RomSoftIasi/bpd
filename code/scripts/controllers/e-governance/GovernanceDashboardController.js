const {WebcController} = WebCardinal.controllers;
import GovernanceService from "../services/GovernanceService.js";
import * as Loader from "../WebcSpinnerController.js";
import {getFormattedDate} from "../../utils/utils.js";

export default class GovernanceDashboardController extends WebcController {
    constructor(...props) {
        super(...props);

        this.model = {news: []};
        this.GovernanceService = new GovernanceService(this.DSUStorage);

        this.initNavigationListeners();
        this.displayNewsList();
    }

    initNavigationListeners() {
        this.onTagClick("voting-dashboard", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.navigateToPageTag("voting-dashboard");
        });

        this.onTagClick("options", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            console.log(model);
        });
    }

    displayNewsList() {
        Loader.displayLoader();
        this.GovernanceService.listVoteSessions((err, newsList) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            newsList = newsList.map(news => {
                const isConcluded = Date.now() > news.deadline;
                news.concluded = isConcluded ? "true" : "";
                news.status = isConcluded ? "Concluded" : "In progress";
                news.options = isConcluded ? "View results" : "";
                news.type = isConcluded ? `${news.votingAction} - Fixed` : news.votingAction;
                news.date = getFormattedDate(news.deadline);

                return news;
            });

            this.model.news = newsList;
            Loader.hideLoader();
        });
    }
}