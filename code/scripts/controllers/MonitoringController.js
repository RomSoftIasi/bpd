import BPDController from "./base-controllers/BPDController.js";
import ClusterModel from "../models/ClusterModel.js"

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
    questions: [
        {
            id: 1,
            title: 'Do you want to update the system?',
            uniqueAnswers: true,
            answers: [
                {
                    id: 1,
                    text: 'Yes'
                },
                {
                    id: 2,
                    text: 'No'
                }
            ]
        },
        {
            id: 2,
            title: 'Do you agree with the proposal no. 572?',
            uniqueAnswers: true,
            answers: [
                {
                    id: 3,
                    text: 'Yes'
                },
                {
                    id: 4,
                    text: 'No'
                }
            ]
        },
        {
            id: 3,
            title: 'What cloud provider should we use?',
            uniqueAnswers: false,
            answers: [
                {
                    id: 5,
                    text: 'AWS'
                },
                {
                    id: 6,
                    text: 'Google Cloud'
                },
                {
                    id: 7,
                    text: 'Azure'
                }
            ]
        }
    ],
    organization: {
        name: 'Organization A'
    },
    network: {
        name: 'Network A'
    },
    responses: [],
    questionCreationModel: JSON.parse(JSON.stringify(initialQuestionCreationModel))
}

export default class VotingController extends BPDController {
    constructor(element, history) {
        super(element, history);
        this.clusterModel = ClusterModel.getInstance();
        this.model = this.setModel(initModel)

        this._initModel();
        this._onAnswerClick();
        this._onResponseClick();
        this._onAnswerCreate();
        this._onQuestionCreate();
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
        let answersLength = this.model.questions[questionIndex].answers.length;
        for (let j = 0; j < answersLength; j++) {
            this.model.questions[questionIndex].answers[j].disabled = false;
        }

        if (this.model.questions[questionIndex].uniqueAnswers) {
            this.model.questions[questionIndex].answerRadioGroup = this.__getRadiosAnswerFromQuestion(this.model.questions[questionIndex]);
        } else {
            this.model.questions[questionIndex].answers = this.__getCheckboxesAnswerFromQuestion(this.model.questions[questionIndex])
        }
    }

    _initModel() {
        this.model.params = this.parseHashFragmentParams();
        if (this.model.params.orgUid) {
            this.model.organization = this.orgModel.getOrganization(this.model.params.orgUid);
        }
        if (this.model.params.ntwUid) {
            this.model.network = this.clusterModel.getCluster(this.model.params.ntwUid)
        }

        for (let i = 0; i < this.model.questions.length; i++) {
            this.model.responses.push({
                question: this.model.questions[i],
                answerIds: []
            });

            this._createQuestionDetails(i);
        }
    }

    findQuestionIndexByAnswerId(answerId) {
        return this.model.questions.findIndex(question => {
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
        for (let i = 0; i < this.model.questions.length; i++) {
            let answers = this.model.questions[i].answers;
            for (let j = 0; j < answers.length; i++) {
                if (answers[j].id === answerId) {
                    return answers[j];
                }
            }
        }
        return null;
    }

    _onAnswerClick() {
        this.on('answer:click', (event) => {
            let answerId = event.data;
            let questionIndex = this.findQuestionIndexByAnswerId(answerId);
            if (questionIndex === -1) {
                return;
            }
            let answerIndex = this.model.questions[questionIndex].answers.findIndex(answer => answer.id === answerId);
            if (answerIndex === -1) {
                return;
            }

            let disabledAnswerIndex = this.model.questions[questionIndex].answers.findIndex(ans => ans.disabled);
            if (disabledAnswerIndex !== -1 && disabledAnswerIndex !== answerIndex) {
                return;
            }

            let nextStateOfClick = !this.model.questions[questionIndex].answers[answerIndex].disabled;
            if (nextStateOfClick) {
                for (let i = 0; i < this.model.questions.length; i++) {
                    this.model.questions[i].disabled = !nextStateOfClick;
                }
            }
            this.model.questions[questionIndex].answers[answerIndex].disabled = nextStateOfClick;
        });
    }

    _calculateAnswerPercents(index) {
        let possibleColors = ['red', 'blue', 'green', 'purple', 'black', 'orange', 'brown']
        let question = this.model.questions[index];
        let possibleAnswers = question.answers;
        let responses = this.model.responses[index].answerIds;
        let totalResponses = responses.length;
        if (totalResponses === 0) {
            return;
        }
        this.model.responses[index].answerResults = possibleAnswers.map(answer => {
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

    _onResponseClick() {
        this.on('voting:respond', (event) => {
            this.model.questions.forEach((question, index) => {
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

                let responses = JSON.parse(JSON.stringify(this.model.responses[index]));

                for (let i = 0; i < finalResponses.length; i++) {
                    responses.answerIds.push(finalResponses[i])
                }
                this.model.responses[index] = responses;
                this._calculateAnswerPercents(index);
            });
            // let auxQuestions = JSON.parse(JSON.stringify(this.model.questions));
            // this.model.questions = [];
            // this.model.questions = auxQuestions.map(question => {
            //     let defaultAnswers = question.answers.map(answer => {
            //         return {
            //             id: answer.id,
            //             text: answer.text
            //         };
            //     });
            //     return {
            //         id: question.id,
            //         uniqueAnswers: question.uniqueAnswers,
            //         title: question.title,
            //         answers: defaultAnswers
            //     };
            // });
            //
            // for (let i = 0; i < auxQuestions.length; i++) {
            //     this._createQuestionDetails(i);
            // }

            // for (let i = 0; i < this.model.questions.length; i++) {
            //     let question = JSON.parse(JSON.stringify(this.model.questions[i]));
            //     if (this.model.questions[i].uniqueAnswers) {
            //         question.answerRadioGroup.value = '';
            //     } else {
            //         question.answers = question.answers.map(answer => {
            //             return {
            //                 ...answer,
            //                 value: ''
            //             };
            //         })
            //     }
            //     this.model.questions[i] = question;
            // }

        });
    }

    _onAnswerCreate() {
        this.on('answer:create', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this._createAnswer();
        });
    }

    _onQuestionCreate() {
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

            let index = this.model.questions.push(questionModel) - 1

            if (questionModel.uniqueAnswers) {
                this.model.questions[index].answerRadioGroup = this.__getRadiosAnswerFromQuestion(questionModel);
            } else {
                this.model.questions[index].answers = this.__getCheckboxesAnswerFromQuestion(questionModel)
            }

            this.model.responses.push({
                question: this.model.questions[index],
                answerIds: []
            });

            this.model.questionCreationModel = JSON.parse(JSON.stringify(initialQuestionCreationModel));
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