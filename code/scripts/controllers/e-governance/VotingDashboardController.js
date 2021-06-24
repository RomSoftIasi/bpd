const {WebcController} = WebCardinal.controllers;
import GovernanceService from "../services/GovernanceService.js";
import * as Loader from "../WebcSpinnerController.js";
import {getFormattedDate} from "../../utils/utils.js";

export default class VotingDashboardController extends WebcController {
    constructor(...props) {
        super(...props);

        this.model = {votingSessions: []};
        this.GovernanceService = new GovernanceService(this.DSUStorage);

        this.initNavigationListeners();
        this.displayVotingSessions();
    }

    initNavigationListeners() {
        this.onTagClick("new-voting-session", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.navigateToPageTag("new-voting-session");
        });
    }

    displayVotingSessions() {
        Loader.displayLoader();
        this.GovernanceService.listVoteSessions((err, votingSessions) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            votingSessions = votingSessions.map(votingSession => {
                const hasVoted = votingSession.hasVoted || false;
                votingSession.voted = hasVoted ? "true" : "false";
                votingSession.status = hasVoted ? "Voted" : "Vote Now";

                const isConcluded = Date.now() > votingSession.deadline;
                votingSession.concluded = isConcluded ? "true" : "";
                votingSession.overallStatus = isConcluded ? "Concluded" : "In progress";
                votingSession.options = isConcluded ? "View results" : "";
                votingSession.type = votingSession.votingType;
                votingSession.date = getFormattedDate(votingSession.deadline);

                return votingSession;
            });

            this.model.votingSessions = votingSessions;
            Loader.hideLoader();
        });
    }
}