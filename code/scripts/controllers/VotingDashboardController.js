const {WebcController} = WebCardinal.controllers;
import VotingSessionService from "./services/VotingSessionService.js";
import * as Loader from "./WebcSpinnerController.js";
import {getFormattedDate} from "../utils/utils.js";

export default class VotingDashboardController extends WebcController {
    constructor(...props) {
        super(...props);

        this.model = {votingSessions: []};
        this.VotingSessionService = new VotingSessionService();

        this.initNavigationListeners();
        this.displayVotingSessions();
    }

    initNavigationListeners() {
        this.onTagClick("back", () => {
            this.history.goBack();
        });

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
        this.VotingSessionService.listVoteSessions((err, votingSessions) => {
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
            this.model.hasVotingSessions = votingSessions.length > 0;
            Loader.hideLoader();
        });
    }
}