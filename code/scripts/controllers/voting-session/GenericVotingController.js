import VotingSessionController from "./VotingSessionController.js"

export default class GenericVotingController extends VotingSessionController {
    constructor(...props) {
        super(...props);

        this.model = this.getDefaultViewModel();

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
            votingSession.votingType = "Generic";
            this.submitVoteSession(votingSession);
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