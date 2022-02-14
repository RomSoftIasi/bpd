function getBlockchainDomainFormViewModel() {
    return {
        mainDomain: {
            placeholder: this.translate("form.mainDomain.placeholder"),
            name: this.translate("form.mainDomain.label"),
            value: "",
            required: true,
            id: "main-domain"
        },
        subdomain: {
            placeholder: this.translate("form.subdomain.placeholder"),
            name: this.translate("form.subdomain.label"),
            value: "",
            required: true,
            id: "subdomain"
        },
        vaultDomain: {
            placeholder: this.translate("form.vaultDomain.placeholder"),
            name: this.translate("form.vaultDomain.label"),
            value: "",
            required: true,
            id: "vault-domain"
        },
        jenkins: {
            placeholder: this.translate("form.jenkins.placeholder"),
            name: this.translate("form.jenkins.label"),
            value: "",
            required: true,
            id: "jenkins"
        },
        jenkinsUserName: {
            placeholder: this.translate("form.jenkinsUserName.placeholder"),
            name: this.translate("form.jenkinsUserName.label"),
            value: "",
            required: true,
            id: "jenkins-user"
        },
        jenkinsToken: {
            placeholder: this.translate("form.jenkinsToken.placeholder"),
            name: this.translate("form.jenkinsToken.label"),
            value: "",
            required: true,
            id: "jenkins-token"
        },
        githubUsecaseRepository: {
            placeholder: this.translate("form.githubUsecaseRepository.placeholder"),
            name: this.translate("form.githubUsecaseRepository.label"),
            value: "",
            required: true,
            id: "github-repository"
        },
        blockchainTypes:{
            placeholder: this.translate("form.blockchainTypes.placeholder"),
            name: this.translate("form.blockchainTypes.label"),
            blockchainTypeValues: [
                { value: "PrivateSky", text: "PrivateSky" },
                { value: "Quorum", text: "Quorum" }
            ],
            value: "Default",
            required: true,
            id: "blockchain-types"
        },
        deploymentConfiguration: {
            placeholder: this.translate("form.deploymentConfiguration.placeholder"),
            name: this.translate("form.deploymentConfiguration.label"),
            value: "",
            id: "deployment-configuration"
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

    if (condition === "installing" || condition === "uninstalling") {
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
