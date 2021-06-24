import VotingSessionController from "./VotingSessionController.js"
import GovernanceService from "../../services/GovernanceService.js";

export default class GenericVotingController extends VotingSessionController {
    constructor(...props) {
        super(...props);

        this.model = this.getDefaultViewModel();
        this.GovernanceService = new GovernanceService(this.DSUStorage);

        this.initNavigationListeners();
    }

    initNavigationListeners() {
        this.onTagClick("back", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            window.history.back();
        });

        this.onTagClick("finish", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            console.log(JSON.stringify(this.model), this.querySelector("#unique:checked"));
        });

        this.onTagClick("add-answer", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.model.answers.push(this.getAnswerViewModel());
        });
    }

    submitVoteSession() {
        const votingSession = this.model.toObject();
        votingSession.votingType = "Generic";
        const votingSessionModel = this.createVotingSessionModel(votingSession);

        console.log(votingSessionModel);

        this.publishVotingSession(votingSessionModel, (err, data) => {
            if (err) {
                return console.error(err);
            }

            console.log(data);
            this.navigateToPageTag("voting-dashboard");
        });
    }

    getDefaultViewModel() {
        return {
            defaultAnswers: [{
                label: "Yes"
            }, {
                label: "No"
            }, {
                label: "Abstain"
            }],
            answers: [],
            question: {
                value: "",
                placeholder: "Your question here..."
            },
            deadline: {
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