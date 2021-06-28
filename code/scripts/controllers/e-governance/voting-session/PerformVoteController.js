const {WebcController} = WebCardinal.controllers;
import GovernanceService from "../../services/GovernanceService.js";
import * as Loader from "../../WebcSpinnerController.js";
import {getFormattedDate} from "../../../utils/utils.js";

export default class PerformVoteController extends WebcController {
    constructor(...props) {
        super(...props);

        const uid = this.history.win.history.state.state;
        this.model = {
            uid: uid,
            answers: []
        }
        this.GovernanceService = new GovernanceService(this.DSUStorage);

        this.getVoteSessionData();
        this.initNavigationListeners();
    }

    initNavigationListeners() {
        this.onTagClick("back", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            window.history.back();
        });

        this.onTagClick("vote-and-sign", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.collectAnswersAndPublish();
        });

        this.onTagClick("view-documentation", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.GovernanceService.downloadCandidateDocumentation(this.model.uid, this.model.candidateDocumentationName);
        });
    }

    getVoteSessionData() {
        Loader.displayLoader();
        this.GovernanceService.getVoteData(this.model.uid, (err, voteData) => {
            if (err) {
                Loader.hideLoader();
                return console.error(err);
            }

            this.model.question = voteData.title;
            this.model.deadline = getFormattedDate(voteData.deadline);
            this.model.votingAction = voteData.votingAction;
            this.model.uniqueAnswer = voteData.uniqueAnswer;
            this.model.candidateDocumentationName = voteData.candidateDocumentationName;
            this.model.hasDocumentation = typeof this.model.candidateDocumentationName === "string";
            this.model.answers = this.createAnswersViewModel(voteData.possibleResponses);
            this.model.existingVotes = voteData.votes || {};
            Loader.hideLoader();
        });
    }

    collectAnswersAndPublish() {
        const checkedResponses = this.querySelectorAll("#possible-responses input:checked");
        const responsesReferences = [];
        for (let index = 0; index < checkedResponses.length; ++index) {
            responsesReferences.push(checkedResponses[index].getAttribute("data-response"));
        }

        console.log(responsesReferences);
        const existingVotes = this.model.toObject("existingVotes");
        existingVotes.numberOfVotes += responsesReferences.length;
        responsesReferences.forEach(ref => {
            existingVotes.responses[ref]++;
        });

        Loader.displayLoader();
        this.GovernanceService.submitVotes(this.model.uid, existingVotes, (err, result) => {
            Loader.hideLoader();
            if (err) {
                return console.error(err);
            }

            console.log(result);
            this.navigateToPageTag("voting-dashboard");
        });
    }

    createAnswersViewModel(possibleResponses) {
        return possibleResponses.map(response => {
            const id = response.toLowerCase().replace(/\s/, "");
            return {
                reference: response,
                label: {
                    text: response,
                    for: id
                },
                checkInput: {
                    id: id,
                    checked: false
                }
            }
        });
    }
}