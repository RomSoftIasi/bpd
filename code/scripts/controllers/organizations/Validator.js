function validateFormFields() {
    const organizationModel = this.model.toObject("newOrganization");
    const isValidName = /^([a-z]|[A-Z]|[0-9]|\s|\.|-){1,30}$/sg.test(organizationModel.value);
    if (!isValidName) {
        const inputField = this.querySelector(`#${organizationModel.id}`);
        inputField.setCustomValidity(this.translate("validation.organizationName.validationMessage"));
        inputField.reportValidity();

        return false
    }

    return true;
}

function displayValidationErrorModal() {
    const errorMessage = this.translate("validation.organizationName.organizationExists");
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