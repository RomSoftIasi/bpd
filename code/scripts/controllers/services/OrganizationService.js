export default class GovernanceService {

    ORGANIZATION_PATH = "/organizations";

    constructor(DSUStorage) {
        this.DSUStorage = DSUStorage;
    }

    listOrganizations(callback) {
        this.DSUStorage.call('listDSUs', this.ORGANIZATION_PATH, (err, organizationsIdentifierList) => {
            if (err) {
                return callback(err);
            }

            const organizationsDataList = [];
            const getOrganizationDSU = (organizationsIdentifierList) => {
                if (!organizationsIdentifierList.length) {
                    return callback(undefined, organizationsDataList);
                }

                const id = organizationsIdentifierList.pop();
                this.getOrganizationData(id.identifier, (err, organizationData) => {
                    if (err) {
                        return callback(err);
                    }

                    organizationsDataList.push(organizationData);
                    getOrganizationDSU(organizationsIdentifierList);
                });
            };

            getOrganizationDSU(organizationsIdentifierList);
        });
    }

    getOrganizationData(identifier, callback) {
        this.DSUStorage.getObject(this.getOrganizationsDataPath(identifier), callback);
    }

    createOrganization(organizationName, callback) {
        this.DSUStorage.call('createSSIAndMount', this.ORGANIZATION_PATH, (err, keySSI) => {
            if (err) {
                callback(err, undefined);
                return;
            }

            const organizationData = {
                name: organizationName,
                keySSI: keySSI,
                uid: keySSI,
                isOwner: true,
                type: "Owner",
                createdAt: Date.now()
            };

            this.updateOrganizationData(organizationData, callback);
        });
    }

    updateOrganizationData(organizationData, callback) {
        this.DSUStorage.setObject(this.getOrganizationsDataPath(organizationData.uid), organizationData, (err) => {
            callback(err, organizationData);
        });
    }

    isExistingOrganization(organizationName, organizationUid, callback) {
        if (typeof organizationUid === "function") {
            callback = organizationUid;
            organizationUid = null;
        }

        this.listOrganizations((err, organizationsList) => {
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

    getOrganizationsDataPath(identifier) {
        return `${this.ORGANIZATION_PATH}/${identifier}/data.json`;
    }

    unmountOrganization(organizationUid, callback) {
        let unmountPath = this.ORGANIZATION_PATH + '/' + organizationUid;
        this.DSUStorage.call('organizationUnmount', unmountPath, (err, result) => {
            callback(err, result);
        });
    }
}
