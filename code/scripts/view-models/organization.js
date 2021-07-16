function getOrganizationFormViewModel() {
    return {
        newOrganization: {
            placeholder: this.translate("form.organizationName.placeholder"),
            name: this.translate("form.organizationName.label"),
            value: "",
            required: true,
            id: "new-organization"
        }
    };
}

export {
    getOrganizationFormViewModel
};