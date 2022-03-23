import DSUService from "./DSUService.js";

export default class OrganizationService extends DSUService {

    constructor() {
        super("/organizations");
    }

    listOrganizations = (callback) => this.getEntities(callback);

    getOrganizationData = (uid, callback) => this.getEntity(uid, callback);

    updateOrganizationData = (data, callback) => this.updateEntity(data, callback);

    unmountOrganization = (uid, callback) => this.unmountEntity(uid, callback);

    createOrganization = (organizationName, callback) => {
        this.createDSUAndMount((err, keySSI) => {
            if (err) {
                return callback(err);

            }

            const organizationData = {
                name: organizationName,
                keySSI: keySSI,
                uid: keySSI,
                isOwner: true,
                type: "Owner",
                createdAt: Date.now()
            };

            this.updateEntity(organizationData, callback);
        });
    };

    isExistingOrganization = (organizationName, organizationUid, callback) => {
        if (typeof organizationUid === "function") {
            callback = organizationUid;
            organizationUid = null;
        }

        this.getEntities((err, organizationsList) => {
            if (err) {
                return callback(err);
            }

            const organizationIndex = organizationsList.findIndex(org => {
                let found = org.name.trim() === organizationName.trim();
                if (organizationUid) {
                    found &= (org.uid !== organizationUid);
                }

                return found;
            });

            return callback(undefined, organizationIndex !== -1);
        });
    }
}
