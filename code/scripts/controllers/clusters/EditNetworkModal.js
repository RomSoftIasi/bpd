const {WebcController} = WebCardinal.controllers;

export default class NetworkModal extends WebcController {
    constructor(...props) {
        super(...props);

        const initModel = this.getEditNetworkViewModel();
        initModel.title = this.model.title || 'Initiate Network';
        initModel.jenkins.value = this.model.jenkins;
        initModel.user.value = this.model.user;
        initModel.token.value = this.model.token;
        initModel.name.value = this.model.name;
        initModel.config.value = this.model.config;
        initModel.clusterStatus = this.model.clusterStatus;
        initModel.clusterOperation = this.model.clusterOperation;
        initModel.disableAll = this.model.clusterStatus === 'Installed' || this.model.clusterStatus === 'Pending';
        this.model = JSON.parse(JSON.stringify(initModel));

        this.attachHandlerSaveNetwork();
        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });
    }

    attachHandlerSaveNetwork() {
        this.onTagClick('cls:save', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            if (this.displayErrorMessages(event)) {
                return;
            }

            let toReturnObject = {
                name: this.model.name.value,
                jenkins: this.model.jenkins.value,
                user: this.model.user.value,
                token: this.model.token.value,
                config: this.model.config.value,
                clusterOperation: this.model.clusterOperation,
                clusterStatus: this.model.clusterStatus
            };

            this.send('confirmed', toReturnObject);
        });
    }

    displayErrorMessages = () => {
        return this.displayErrorRequiredField('jenkins', this.model.jenkins.value) ||
            this.displayErrorRequiredField('user', this.model.user.value) ||
            this.displayErrorRequiredField('name', this.model.user.value) ||
            this.displayErrorRequiredField('token', this.model.token.value);
    }

    displayErrorRequiredField(fieldName, field) {
        if (field === undefined || field === null || field.length === 0) {
            this.emitFeedback(fieldName.toUpperCase() + " field is required.", "alert-danger");
            return true;
        }

        return false;
    }

    emitFeedback(message, alertType) {
        if (typeof this.feedbackEmitter === 'function') {
            this.feedbackEmitter(message, "Validation", alertType)
        }
    }

    getEditNetworkViewModel() {
        return {
            clusterOperation: 'initiateNetwork',
            clusterStatus: 'None',
            disableAll: false,
            name: {
                name: 'name',
                label: 'Blockchain name',
                required: true,
                placeholder: 'Enter blockchain name (eg. ePI)',
                value: ''
            },
            jenkins: {
                name: 'jenkins',
                label: 'Jenkins',
                required: true,
                placeholder: 'http://jenkins/CI/Server/URL',
                value: 'http://jenkins/CI/Server/URL'
            },
            user: {
                name: 'user',
                label: 'User',
                required: true,
                placeholder: 'Jenkins user name',
                value: ''
            },
            token: {
                name: 'token',
                label: 'Authorization token',
                required: true,
                placeholder: 'Jenkins authorization token',
                value: ''
            },
            config: {
                label: "Deployment configuration",
                name: "configuration",
                required: true,
                placeholder: "{\n" +
                    "\t\"registry\": \"docker.io\"\n" +
                    "}",
                value: "{\n" +
                    "\t\"registry\": \"docker.io\"\n" +
                    "}"
            }
        };
    }
}
