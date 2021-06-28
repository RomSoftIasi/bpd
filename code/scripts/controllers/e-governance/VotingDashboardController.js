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

        this.onTagClick("vote-now", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            if (!model.isConcluded && !model.hasVoted) {
                this.navigateToPageTag("perform-vote", model.uid);
            }
        });
    }

    displayVotingSessions() {
        Loader.displayLoader();
        this.GovernanceService.listVoteSessions((err, votingSessions) => {
            console.log(votingSessions);

            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            votingSessions = votingSessions.map(votingSession => {
                // TODO: Come back and redefine logic

                const hasVoted = votingSession.hasVoted || false;
                const isConcluded = Date.now() > votingSession.deadline;
                votingSession.hasVoted = hasVoted;
                votingSession.isConcluded = isConcluded;

                votingSession.voted = hasVoted ? "true" : (isConcluded ? "" : "false");
                votingSession.status = hasVoted ? "Voted" : (isConcluded ? "Ended" : "Vote Now");
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