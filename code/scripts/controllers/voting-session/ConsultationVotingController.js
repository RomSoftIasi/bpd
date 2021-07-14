import VotingSessionController from "./VotingSessionController.js"
import VotingSessionService from "../services/VotingSessionService.js";

export default class ConsultationVotingController extends VotingSessionController {
    constructor(...props) {
        super(...props);

        this.model = this.getDefaultViewModel();
        this.VotingSessionService = new VotingSessionService(this.DSUStorage);

        this.initNavigationListeners();
    }

    initNavigationListeners() {
        this.onTagClick("back", () => {
            this.history.goBack();
        });

        this.onTagClick("add-answer", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.model.answers.push(this.getAnswerViewModel());
        });

        this.onTagClick("finish", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            const votingSession = this.model.toObject();
            votingSession.votingType = "Opinion";
            this.submitVoteSession(votingSession);
        });
    }

    getDefaultViewModel() {
        return {
            answers: [],
            deadline: {
                value: ""
            },
            question: {
                placeholder: "Enter your question here",
                value: ""
            },
            uniqueAnswer: false
        };
    }

    getAnswerViewModel() {
        return {
            value: ""
        };
    }
}