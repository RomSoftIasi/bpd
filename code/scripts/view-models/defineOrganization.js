function getOrganizationFormViewModel() {
    return {
        newOrganization: {
            placeholder: this.translate("organizationNamePlaceholder"),
            value: "",
            name: this.translate("organizationName")
        }
    };
}

export {
    getOrganizationFormViewModel
};