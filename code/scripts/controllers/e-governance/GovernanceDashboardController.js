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
    }

    displayNewsList() {
        Loader.displayLoader();
        this.GovernanceService.listNews((err, newsList) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            newsList = newsList.map(news => {
                news.date = getFormattedDate(news.date);
                return news;
            });

            this.model.news = this.getTemplateTestNews();
            Loader.hideLoader();
        });
    }

    // TODO: Remove after real data exists
    getTemplateTestNews() {
        return [
            {
                title: "Novartis Enrolled in IOT use case",
                type: "Enroll",
                date: getFormattedDate(),
                status: "In progress",
                options: {}
            },
            {
                title: "Do we allow the enrollment of Novartis into the IOT use case?",
                type: "Voting - Fixed",
                date: getFormattedDate(),
                status: "Concluded",
                options: {
                    label: "View results"
                }
            }, {
                title: "Novartis Enrolled in IOT use case",
                type: "Enroll",
                date: getFormattedDate(),
                status: "In progress",
                options: {}
            },
            {
                title: "Do we allow the enrollment of Novartis into the IOT use case?",
                type: "Voting - Fixed",
                date: getFormattedDate(),
                status: "Concluded",
                options: {
                    label: "View results"
                }
            }, {
                title: "Novartis Enrolled in IOT use case",
                type: "Enroll",
                date: getFormattedDate(),
                status: "In progress",
                options: {}
            },
            {
                title: "Do we allow the enrollment of Novartis into the IOT use case?",
                type: "Voting - Fixed",
                date: getFormattedDate(),
                status: "Concluded",
                options: {
                    label: "View results"
                }
            }, {
                title: "Novartis Enrolled in IOT use case",
                type: "Enroll",
                date: getFormattedDate(),
                status: "In progress",
                options: {}
            },
            {
                title: "Do we allow the enrollment of Novartis into the IOT use case?",
                type: "Voting - Fixed",
                date: getFormattedDate(),
                status: "Concluded",
                options: {
                    label: "View results"
                }
            }, {
                title: "Novartis Enrolled in IOT use case",
                type: "Enroll",
                date: getFormattedDate(),
                status: "In progress",
                options: {}
            },
            {
                title: "Do we allow the enrollment of Novartis into the IOT use case?",
                type: "Voting - Fixed",
                date: getFormattedDate(),
                status: "Concluded",
                options: {
                    label: "View results"
                }
            }
        ]
    }
}