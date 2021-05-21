const {WebcController} = WebCardinal.controllers;
import OrganizationService from "../services/OrganizationService.js";
import ClusterService from "../services/ClusterService.js";

const initialQuestionCreationModel = {
    title: {
        placeholder: 'Question',
        name: 'Question',
        label: 'Question'
    },
    signature: {
        placeholder: 'e13664398bb18ca2f90c647ca940e4654ddc28f006a597bdf753dfb56d6f0e39',
        name: 'Question signature',
        label: 'Question signature'
    },
    uniqueAnswers: {
        checked: false
    },
    answers: []
}

const initModel = {
    organization: {},
    cluster: {
        questions: [],
        responses: []
    },
    hasQuestions: false,
    questionCreationModel: JSON.parse(JSON.stringify(initialQuestionCreationModel)),
}

export default class VotingController extends WebcController {
    constructor(...props) {
        super(...props);

        // TODO: Replace this when a solution has been found
        let receivedModel = this.history.win.history.state.state;
        this.model = {
            ...JSON.parse(JSON.stringify(initModel)),
            ...receivedModel
        };

        this.OrganisationService = new OrganizationService(this.DSUStorage);
        this.ClusterService = new ClusterService(this.DSUStorage);
        this.OrganisationService.getOrganization(receivedModel.organizationUid, (err, organization) => {
            if (err) {
                return console.error(err);
            }

            this.model.organization = organization;
        });

        this.ClusterService.getCluster(receivedModel.organizationUid, receivedModel.clusterUid, (err, cluster) => {
            if (err) {
                return console.error(err);
            }

            this.model.cluster = cluster;

            if (!this.model.cluster.responses) {
                this.model.cluster.responses = [];
            }

            if (!this.model.cluster.questions) {
                this.model.cluster.questions = [];
                this.model.hasQuestions = false;
            } else {
                this.model.hasQuestions = true;
            }
        });

        this.attachHandlerClickAnswer();
        this.attachHandlerClickResponse();
        this.attachHandlerCreateAnswer();
        this.attachHandlerCreateQuestion();

        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });
    }

    getAnswersForQuestion(question) {
        const answers = question.answers.map(({text, id}) => {
            return {
                id: parseInt(id) || 0,
                label: {
                    text: text,
                    for: id
                },
                checkInput: {
                    value: id,
                    id: id,
                    checked: false,
                    name: question.id + "_" + question.title
                }
            };
        });

        return answers;
    }

    findQuestionIndexByAnswerId(answerId) {
        return this.model.cluster.questions.findIndex(question => {
            let answers = question.answers;
            for (let i = 0; i < answers.length; i++) {
                if (answers[i].id === answerId) {
                    return true;
                }
            }
            return false;
        })
    }

    attachHandlerClickAnswer() {
        this.onTagClick('answer:click', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            let answerId = event.data;
            let questionIndex = this.findQuestionIndexByAnswerId(answerId);
            if (questionIndex === -1) {
                return;
            }
            let answerIndex = this.model.cluster.questions[questionIndex].answers.findIndex(answer => answer.id === answerId);
            if (answerIndex === -1) {
                return;
            }

            let disabledAnswerIndex = this.model.cluster.questions[questionIndex].answers.findIndex(ans => ans.disabled);
            if (disabledAnswerIndex !== -1 && disabledAnswerIndex !== answerIndex) {
                return;
            }

            let nextStateOfClick = !this.model.cluster.questions[questionIndex].answers[answerIndex].disabled;
            if (nextStateOfClick) {
                for (let i = 0; i < this.model.cluster.questions.length; i++) {
                    this.model.cluster.questions[i].disabled = !nextStateOfClick;
                }
            }
            this.model.cluster.questions[questionIndex].answers[answerIndex].disabled = nextStateOfClick;
        });
    }

    calculateAnswerPercents(index) {
        let possibleColors = ['red', 'blue', 'green', 'purple', 'black', 'orange', 'brown']
        let question = this.model.cluster.questions[index];
        let possibleAnswers = question.answers;
        let responses = this.model.cluster.responses[index].answerIds;
        let totalResponses = responses.length;
        if (totalResponses === 0) {
            return;
        }
        this.model.cluster.responses[index].answerResults = possibleAnswers.map(answer => {
            let responsesOfThisType = responses.filter(res => res === answer.id).length;

            let randomIndex = Math.floor(Math.random() * possibleColors.length);
            let randomItem = possibleColors[randomIndex];
            possibleColors.splice(randomIndex, 1);

            return {
                id: answer.id,
                value: (responsesOfThisType / totalResponses) * 100,
                label: answer.text,
                color: randomItem
            }
        });
    }

    attachHandlerClickResponse() {
        this.onTagClick('voting:respond', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.model.cluster.questions.forEach((question, index) => {
                let responsesIds = [];
                if (question.uniqueAnswers) {
                    const selectedAnswer = this.querySelector(`input[name^="${question.id}"]:checked`);
                    if (selectedAnswer) {
                        responsesIds = [parseInt(selectedAnswer.value)];
                    }
                } else {
                    responsesIds = question.answers.filter((answer) => {
                        return answer.checkInput.checked === true && (answer.id + "").length > 0;
                    }).map(answer => parseInt(answer.id));
                }

                console.log(responsesIds);
                let responses = JSON.parse(JSON.stringify(this.model.cluster.responses[index]));

                for (let i = 0; i < responsesIds.length; i++) {
                    responses.answerIds.push(responsesIds[i])
                }

                this.model.cluster.responses[index] = responses;
                this.calculateAnswerPercents(index);

                this.ClusterService.updateCluster(this.model.organizationUid, this.model.cluster, (err, data) => {
                    if (err) {
                        console.error(err);
                    }
                });
            });
        });
    }

    attachHandlerCreateAnswer() {
        this.onTagClick('answer:create', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            if (this.model.questionCreationModel && this.model.questionCreationModel.answers) {
                let size = this.model.questionCreationModel.answers.length;
                if (size > 0) {
                    let lastAnswer = this.model.questionCreationModel.answers[size - 1];
                    if (!lastAnswer.value || lastAnswer.value.length < 1) {
                        this.emitFeedback("Please complete the field answer !", "alert-danger");
                        return;
                    }
                }
            }

            this.createAnswer();
        });
    }

    attachHandlerCreateQuestion() {
        this.onTagClick('question:create', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            if (this.displayErrorForQuestion() || this.displayErrorIfNoAnswers()) {
                return;
            }

            this.model.hasQuestions = true;
            let questionModel = {
                id: this.getRandomId(),
                title: this.model.questionCreationModel.title.value,
                uniqueAnswers: this.model.questionCreationModel.uniqueAnswers.checked === true,
                answers: this.model.questionCreationModel.answers.map(answer => {
                    return {
                        id: answer.id,
                        text: answer.value
                    }
                })
            }

            let index = this.model.cluster.questions.push(questionModel) - 1
            this.model.cluster.questions[index].answers = this.getAnswersForQuestion(questionModel);

            this.model.cluster.responses.push({
                question: this.model.cluster.questions[index],
                answerIds: [],
                answerResults: []
            });

            this.model.questionCreationModel = JSON.parse(JSON.stringify(initialQuestionCreationModel));

            this.ClusterService.updateCluster(this.model.organizationUid, this.model.cluster, (err, data) => {
                if (err) {
                    console.error(err);
                }
            });
        });
    }

    getRandomId() {
        return (Date.now() + Math.random()).toString().replace('.', '');
    }

    createAnswer() {
        const id = this.getRandomId();
        this.model.questionCreationModel.answers.push({
            id: id,
            placeholder: 'Answer',
            name: 'Answer',
            required: true,
        });
    }

    displayErrorForQuestion = () => {
        if (this.model.questionCreationModel.title.value === undefined || this.model.questionCreationModel.title.value === null || this.model.questionCreationModel.title.value.length === 0) {
            this.emitFeedback("Please complete the field question!", "alert-danger")
            return true;
        }

        return false;
    }

    displayErrorIfNoAnswers = () => {
        if (!this.model.questionCreationModel.answers || !this.model.questionCreationModel.answers[0].value || this.model.questionCreationModel.answers[0].value.length === 0) {
            this.emitFeedback("Please add answers for question!", "alert-danger")
            return true;
        }

        return false;
    }

    emitFeedback(message, alertType) {
        if (typeof this.feedbackEmitter === 'function') {
            this.feedbackEmitter(message, "Validation", alertType)
        }
    }
}
