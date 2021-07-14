const {WebcController} = WebCardinal.controllers;
import VotingSessionService from "./services/VotingSessionService.js";
import * as Loader from "./WebcSpinnerController.js";
import {getFormattedDate} from "../utils/utils.js";

export default class GovernanceDashboardController extends WebcController {
    constructor(...props) {
        super(...props);

        this.model = {news: []};
        this.VotingSessionService = new VotingSessionService(this.DSUStorage);

        this.initNavigationListeners();
        this.displayNewsList();
    }

    initNavigationListeners() {
        this.onTagClick("voting-dashboard", () => {
            this.navigateToPageTag("voting-dashboard");
        });

        this.onTagClick("options", (model) => {
            console.log(model);
        });
    }

    displayNewsList() {
        Loader.displayLoader();
        this.VotingSessionService.listVoteSessions((err, newsList) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            newsList = newsList.map(news => {
                // TODO: Come back and redefine logic

                const isConcluded = Date.now() > news.deadline;
                news.concluded = isConcluded ? "true" : "";
                news.status = isConcluded ? "Concluded" : "In progress";
                news.options = isConcluded ? "View results" : "";
                news.type = isConcluded ? `${news.votingAction} - Fixed` : news.votingAction;
                news.date = getFormattedDate(news.deadline);

                return news;
            });

            this.model.news = newsList;
            this.model.hasNews = newsList.length > 0;
            Loader.hideLoader();
        });
    }
}