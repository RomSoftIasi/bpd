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
        checkboxLabel: "Unique Answer",
        name: "unique-answer",
        checkedValue: 1,
        uncheckedValue: 0,
        value: ''
    },
    answers: []
}

const initModel = {
    title: 'GovernanceModal',
    organization: {
        name: 'Organization A'
    },
    hasQuestions: false,
    cluster: {
        name: 'Network A'
    },
    questionCreationModel: JSON.parse(JSON.stringify(initialQuestionCreationModel))
}

export default class VotingController extends WebcController {
    constructor(...props) {
        super(...props);

        let receivedModel = this.History.getState();
        this.model = this.setModel({
            ...JSON.parse(JSON.stringify(initModel)),
            ...receivedModel
        })

        this.OrganisationService = new OrganizationService(this.DSUStorage);
        this.ClusterService = new ClusterService(this.DSUStorage);
        this.OrganisationService.getOrganization(receivedModel.organizationUid, (err, organization) => {
            if (err) {
                console.log(err);
                return;
            }
            this.model.organization = organization;
        })

        this.ClusterService.getCluster(receivedModel.organizationUid, receivedModel.clusterUid, (err, cluster) => {
            if (err) {
                console.log(err);
                return;
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
        })

        this._attachHandlerClickAnswer();
        this._attachHandlerClickResponse();
        this._attachHandlerCreateAnswer();
        this._attachHandlerCreateQuestion();

        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });
    }

    __getRadiosAnswerFromQuestion(question) {
        return {
            options: question.answers.map(answer => {
                return {
                    label: answer.text,
                    value: answer.id,
                    name: answer.id + "_" + answer.text.replace(' ', '')
                }
            }),
            value: ''
        }
    }

    __getCheckboxesAnswerFromQuestion(question) {
        return question.answers.map(answer => {
            return {
                ...answer,
                checkboxLabel: answer.text,
                name: answer.id,
                checkedValue: 1,
                uncheckedValue: 0,
                value: ''
            }
        });
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

    _attachHandlerClickAnswer() {
        this.on('answer:click', (event) => {
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

    _calculateAnswerPercents(index) {
        let possibleColors = ['red', 'blue', 'green', 'purple', 'black', 'orange', 'brown']
        let question = this.model.cluster.questions[index];
        let possibleAnswers = question.answers;
        let responses = this.model.cluster.responses[index].answerIds;
        let totalResponses = responses.length;
        if (totalResponses === 0) {
            return;
        }
        this.model.cluster.responses[index].answerResults = possibleAnswers.map(answer => {
            let responsesOfThisType = responses.filter(res => res == answer.id).length;

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

    _attachHandlerClickResponse() {
        this.on('voting:respond', (event) => {
            this.model.cluster.questions.forEach((question, index) => {
                let responsesIds = [];
                if (question.answerRadioGroup) {
                    responsesIds = [question.answerRadioGroup.value]
                } else {
                    responsesIds = question.answers.map(answer => {
                        return answer.value === "1" ? answer.id : "";
                    })
                }

                let finalResponses = responsesIds
                    .filter(response => (response + "").length > 0)
                    .map(response => parseInt(response));

                let responses = JSON.parse(JSON.stringify(this.model.cluster.responses[index]));

                for (let i = 0; i < finalResponses.length; i++) {
                    responses.answerIds.push(finalResponses[i])
                }

                this.model.cluster.responses[index] = responses;
                this._calculateAnswerPercents(index);

                this.ClusterService.updateCluster(this.model.organizationUid, this.model.cluster, (err, data) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                })
            });
        });
    }

    _attachHandlerCreateAnswer() {
        this.on('answer:create', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            if (this.model.questionCreationModel && this.model.questionCreationModel.answers) {
                let size = this.model.questionCreationModel.answers.length;
                if (size > 0) {

                    let lastAnswer = this.model.questionCreationModel.answers[size - 1];
                    if (!lastAnswer.value || lastAnswer.value.length < 1) {
                        this._emitFeedback(e, "Please complete the field answer !", "alert-danger")
                        return;
                    }
                }
            }

            this._createAnswer();
        });
    }

    _attachHandlerCreateQuestion() {
        this.on('question:create', (e) => {
            if (this.__displayErrorForQuestion(e)) {
                return;
            }

            if (this.__displayErrorIfNoAnswers(e)) {
                return;
            }

            e.preventDefault();
            e.stopImmediatePropagation();

            this.model.hasQuestions = true;
            let questionModel = {
                id: this.getRandomId(),
                title: this.model.questionCreationModel.title.value,
                uniqueAnswers: this.model.questionCreationModel.uniqueAnswers.value === "1",
                answers: this.model.questionCreationModel.answers.map(answer => {
                    return {
                        id: answer.id,
                        text: answer.value
                    }
                })
            }

            let index = this.model.cluster.questions.push(questionModel) - 1

            if (questionModel.uniqueAnswers) {
                this.model.cluster.questions[index].answerRadioGroup = this.__getRadiosAnswerFromQuestion(questionModel);
            } else {
                this.model.cluster.questions[index].answers = this.__getCheckboxesAnswerFromQuestion(questionModel)
            }

            this.model.cluster.responses.push({
                question: this.model.cluster.questions[index],
                answerIds: []
            });

            this.model.questionCreationModel = JSON.parse(JSON.stringify(initialQuestionCreationModel));

            this.ClusterService.updateCluster(this.model.organizationUid, this.model.cluster, (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }

            })

        });
    }

    getRandomId() {
        return (Date.now() + Math.random()).toString().replace('.', '');
    }

    _createAnswer() {
        const id = this.getRandomId();
        this.model.questionCreationModel.answers.push({
            id: id,
            placeholder: 'Answer',
            name: 'Answer',
            required: true,
        });
    }

    __displayErrorForQuestion = (event) => {
        if (this.model.questionCreationModel.title.value === undefined || this.model.questionCreationModel.title.value === null || this.model.questionCreationModel.title.value.length === 0) {
            this._emitFeedback(event, "Please complete the field question!", "alert-danger")
            return true;
        }
        return false;
    }

    __displayErrorIfNoAnswers = (event) => {
        if (!this.model.questionCreationModel.answers || !this.model.questionCreationModel.answers[0].value || this.model.questionCreationModel.answers[0].value.length === 0) {
            this._emitFeedback(event, "Please add answers for question!", "alert-danger")
            return true;
        }
        return false;
    }

    _emitFeedback(event, message, alertType) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (typeof this.feedbackEmitter === 'function') {
            this.feedbackEmitter(message, "Validation", alertType)
        }
    }
}
