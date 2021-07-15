function getBlockchainDomainFormViewModel() {
    return {
        mainDomain: {
            placeholder: this.translate("form.mainDomain.placeholder"),
            name: this.translate("form.mainDomain.label"),
            value: "",
            required: true
        },
        subdomain: {
            placeholder: this.translate("form.subdomain.placeholder"),
            name: this.translate("form.subdomain.label"),
            value: "",
            required: true
        },
        vaultDomain: {
            placeholder: this.translate("form.vaultDomain.placeholder"),
            name: this.translate("form.vaultDomain.label"),
            value: "",
            required: true
        },
        jenkins: {
            placeholder: this.translate("form.jenkins.placeholder"),
            name: this.translate("form.jenkins.label"),
            value: "",
            required: true
        },
        jenkinsUserName: {
            placeholder: this.translate("form.jenkinsUserName.placeholder"),
            name: this.translate("form.jenkinsUserName.label"),
            value: "",
            required: true
        },
        jenkinsToken: {
            placeholder: this.translate("form.jenkinsToken.placeholder"),
            name: this.translate("form.jenkinsToken.label"),
            value: "",
            required: true
        },
        githubUsecaseRepository: {
            placeholder: this.translate("form.githubUsecaseRepository.placeholder"),
            name: this.translate("form.githubUsecaseRepository.label"),
            value: "",
            required: true
        },
        deploymentConfiguration: {
            placeholder: this.translate("form.deploymentConfiguration.placeholder"),
            name: this.translate("form.deploymentConfiguration.label"),
            value: "",
        }
    }
}

function getReadOnlyFields(condition) {
    if (condition === "installed") {
        return [
            "mainDomain",
            "vaultDomain",
            "subdomain",
            "jenkins"
        ];
    }

    if (condition === "installing") {
        return [
            "mainDomain",
            "vaultDomain",
            "subdomain",
            "jenkins",
            "jenkinsUserName",
            "jenkinsToken",
            "githubUsecaseRepository",
            "deploymentConfiguration"
        ];
    }

    return [];
}

export {
    getBlockchainDomainFormViewModel,
    getReadOnlyFields
};