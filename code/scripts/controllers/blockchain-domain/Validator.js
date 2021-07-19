function validateFormFields() {
    const mainDomain = this.model.toObject("blockchainDomainModel.mainDomain");
    const isMainDomainValid = /^([a-z]|[0-9])(([a-z]|[0-9]|-)*([a-z]|[0-9]))*$/sg.test(mainDomain.value) && mainDomain.value.length <= 63;
    if (!isMainDomainValid) {
        const inputField = this.querySelector(`#${mainDomain.id}`);
        inputField.setCustomValidity(this.translate("validation.mainDomainValidation"));
        inputField.reportValidity();

        return false;
    }

    const subdomain = this.model.toObject("blockchainDomainModel.subdomain");
    const isSubdomainValid = /^([a-z]|[0-9])(([a-z]|[0-9]|-|\.)*([a-z]|[0-9]))*$/sg.test(subdomain.value) && subdomain.value.length <= 63;
    if (!isSubdomainValid) {
        const inputField = this.querySelector(`#${subdomain.id}`);
        inputField.setCustomValidity(this.translate("validation.subdomainValidation"));
        inputField.reportValidity();

        return false;
    }

    const vaultDomain = this.model.toObject("blockchainDomainModel.vaultDomain");
    const isVaultDomainValid = /^([a-z]|[A-Z]|[0-9]|-|_|\.){1,30}$/sg.test(vaultDomain.value);
    if (!isVaultDomainValid) {
        const inputField = this.querySelector(`#${vaultDomain.id}`);
        inputField.setCustomValidity(this.translate("validation.vaultDomainValidation"));
        inputField.reportValidity();

        return false;
    }

    const jenkins = this.model.toObject("blockchainDomainModel.jenkins");
    const isJenkinsValid = /^(https|http)?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/sg.test(jenkins.value);
    if (!isJenkinsValid) {
        const inputField = this.querySelector(`#${jenkins.id}`);
        inputField.setCustomValidity(this.translate("validation.jenkinsValidation"));
        inputField.reportValidity();

        return false;
    }

    const githubUsecaseRepository = this.model.toObject("blockchainDomainModel.githubUsecaseRepository");
    const isGithubRepositoryValid = /^(https|http)?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/sg.test(githubUsecaseRepository.value);
    if (!isGithubRepositoryValid) {
        const inputField = this.querySelector(`#${githubUsecaseRepository.id}`);
        inputField.setCustomValidity(this.translate("validation.githubUsecaseRepositoryValidation"));
        inputField.reportValidity();

        return false;
    }

    return true;
}

function displayValidationErrorModal(blockchainDomainData, foundDomain) {
    let errorMessage = this.translate("validation.domainExists");
    if (blockchainDomainData.mainDomain.trim() === foundDomain.mainDomain.trim()) {
        errorMessage = errorMessage.replace("[FIELD_NAME]", this.model.blockchainDomainModel.mainDomain.name);
    } else if (blockchainDomainData.subdomain.trim() === foundDomain.subdomain.trim()) {
        errorMessage = errorMessage.replace("[FIELD_NAME]", this.model.blockchainDomainModel.subdomain.name);
    }

    const modalConfiguration = {
        model: {errorMessage: errorMessage},
        controller: 'ErrorModalController',
        disableBackdropClosing: false,
        disableCancelButton: true,
        confirmButtonText: this.translate("modal.confirmButtonText")
    };
    this.showModalFromTemplate('error-modal', () => {
    }, () => {
    }, modalConfiguration);
}

export {
    validateFormFields,
    displayValidationErrorModal
};