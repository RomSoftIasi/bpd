const {WebcController} = WebCardinal.controllers;
import GovernanceService from "../../services/GovernanceService.js";
import * as Loader from "../../WebcSpinnerController.js";

export default class VotingSessionController extends WebcController {
    constructor(...props) {
        super(...props);

        this.GovernanceService = new GovernanceService(this.DSUStorage);

        this.initNavigationListeners();
    }

    initNavigationListeners() {
        this.onTagClick("back", (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            window.history.back();
        });
    }

    publishVotingSession(votingSessionData, callback) {
        Loader.displayLoader();
        this.GovernanceService.registerVotingSession(votingSessionData, (err, result) => {
            if (err) {
                Loader.hideLoader();
                return callback(err);
            }

            console.log("Publish Vote", result);
            Loader.hideLoader();
            callback(undefined);
        });
    }

    createVotingSessionModel(modelObject) {
        return {
            title: modelObject.question.value,
            votingType: modelObject.votingType,
            deadline: new Date(modelObject.deadline.value).getTime(),
            creationDate: Date.now(),
            uniqueAnswer: modelObject.uniqueAnswer,
            possibleResponses: [...modelObject.possibleResponses],
            votingAction: modelObject.votingAction ? modelObject.votingAction.value : "Voting",
            partnerDID: modelObject.partnerDID ? modelObject.partnerDID.value : "",
            candidateDocumentation: modelObject.candidateDocumentation,
            candidateDocumentationName: modelObject.candidateDocumentationName,
            hasVoted: false,
            votes: this.getVotesModel(modelObject.possibleResponses)
        }
    }

    getPossibleAnswers(answers) {
        let possibleAnswers = [];
        const checkedDefaultAnswers = this.querySelectorAll("#default-answers input[type='checkbox']:checked");
        if (checkedDefaultAnswers) {
            for (let index = 0; index < checkedDefaultAnswers.length; ++index) {
                possibleAnswers.push(checkedDefaultAnswers[index].id);
            }
        }

        const newAnswers = answers.map(answer => answer.value);
        possibleAnswers.push(...newAnswers);
        return possibleAnswers;
    }

    submitVoteSession(votingSession) {
        votingSession.possibleResponses = this.getPossibleAnswers(votingSession.answers);
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

    getVotesModel(possibleResponses) {
        const votesObject = {
            numberOfVotes: 0,
            responses: {}
        };
        possibleResponses.forEach(res => {
            votesObject.responses[res] = 0;
        });

        return votesObject;
    }
}