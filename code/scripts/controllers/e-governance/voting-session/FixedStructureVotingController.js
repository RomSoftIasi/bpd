import VotingSessionController from "./VotingSessionController.js"
import GovernanceService from "../../services/GovernanceService.js";

export default class FixedStructureVotingController extends VotingSessionController {
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

            const documentation = this.querySelector("#upload-documentation").files;
        });

        this.onTagClick("add-answer", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.model.answers.push(this.getAnswerViewModel());
        });
    }

    submitVoteSession() {
        const votingSession = this.model.toObject();
        votingSession.votingType = "Fixed - Structure";
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
            votingAction: {
                value: "Enroll Partner"
            },
            partnerDID: {
                placeholder: "Partner DID",
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