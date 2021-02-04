import ContainerController from '../../../cardinal/controllers/base-controllers/ContainerController.js';
import OrganizationService from "./Services/OrganizationService.js";
import ClusterService from "./Services/ClusterService.js";

const initialQuestionCreationModel = {
    title: {
        placeholder: 'Question',
        name: 'Question'
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
    cluster: {
        name: 'Network A'
    },
    questionCreationModel: JSON.parse(JSON.stringify(initialQuestionCreationModel))
}

export default class VotingController extends ContainerController {
    constructor(element, history) {
        super(element, history);

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
            }

        })

        this._attachHandlerClickAnswer();
        this._attachHandlerClickResponse();
        this._attachHandlerCreateAnswer();
        this._attachHandlerCreateQuestion();
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

    _createQuestionDetails(questionIndex) {
        let answersLength =  this.model.cluster.questions[questionIndex].answers.length;
        for (let j = 0; j < answersLength; j++) {
             this.model.cluster.questions[questionIndex].answers[j].disabled = false;
        }

        if ( this.model.cluster.questions[questionIndex].uniqueAnswers) {
             this.model.cluster.questions[questionIndex].answerRadioGroup = this.__getRadiosAnswerFromQuestion( this.model.cluster.questions[questionIndex]);
        } else {
             this.model.cluster.questions[questionIndex].answers = this.__getCheckboxesAnswerFromQuestion( this.model.cluster.questions[questionIndex])
        }
    }

    findQuestionIndexByAnswerId(answerId) {
        return  this.model.cluster.questions.findIndex(question => {
            let answers = question.answers;
            for (let i = 0; i < answers.length; i++) {
                if (answers[i].id === answerId) {
                    return true;
                }
            }
            return false;
        })
    }

    findAnswerByAnswerId(answerId) {
        for (let i = 0; i <  this.model.cluster.questions.length; i++) {
            let answers =  this.model.cluster.questions[i].answers;
            for (let j = 0; j < answers.length; i++) {
                if (answers[j].id === answerId) {
                    return answers[j];
                }
            }
        }
        return null;
    }

    _attachHandlerClickAnswer() {
        this.on('answer:click', (event) => {
            let answerId = event.data;
            let questionIndex = this.findQuestionIndexByAnswerId(answerId);
            if (questionIndex === -1) {
                return;
            }
            let answerIndex =  this.model.cluster.questions[questionIndex].answers.findIndex(answer => answer.id === answerId);
            if (answerIndex === -1) {
                return;
            }

            let disabledAnswerIndex =  this.model.cluster.questions[questionIndex].answers.findIndex(ans => ans.disabled);
            if (disabledAnswerIndex !== -1 && disabledAnswerIndex !== answerIndex) {
                return;
            }

            let nextStateOfClick = ! this.model.cluster.questions[questionIndex].answers[answerIndex].disabled;
            if (nextStateOfClick) {
                for (let i = 0; i <  this.model.cluster.questions.length; i++) {
                     this.model.cluster.questions[i].disabled = !nextStateOfClick;
                }
            }
             this.model.cluster.questions[questionIndex].answers[answerIndex].disabled = nextStateOfClick;
        });
    }

    _calculateAnswerPercents(index) {
        let possibleColors = ['red', 'blue', 'green', 'purple', 'black', 'orange', 'brown']
        let question =  this.model.cluster.questions[index];
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
            this._createAnswer();
        });
    }

    _attachHandlerCreateQuestion() {
        this.on('question:create', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

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


            let index =  this.model.cluster.questions.push(questionModel) - 1

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
            name: 'Answer'
        });
    }


}