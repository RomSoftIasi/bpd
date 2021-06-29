import VotingSessionController from "./VotingSessionController.js"
import VotingSessionService from "../../services/e-governance/VotingSessionService.js";

export default class FixedStructureVotingController extends VotingSessionController {
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
            votingSession.votingType = "Fixed - Structure";

            const documentation = this.querySelector("#upload-documentation");
            if (documentation && documentation.files.length) {
                votingSession.candidateDocumentation = documentation.files[0];
                votingSession.candidateDocumentationName = votingSession.candidateDocumentation.name;
            }

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