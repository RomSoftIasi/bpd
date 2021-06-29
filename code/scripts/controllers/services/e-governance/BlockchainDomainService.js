export default class BlockchainDomainService {

    ORGANIZATION_PATH = "/organizations";
    BLOCKCHAIN_DOMAINS_PATH = "/blockchain-domains";

    constructor(DSUStorage) {
        this.DSUStorage = DSUStorage;
    }

    createBlockchainDomain(organizationUid, blockchainDomainData, callback) {
        const blockchainDomainsPath = this.getBlockchainDomainsPath(organizationUid);
        this.DSUStorage.call('createSSIAndMount', blockchainDomainsPath, (err, keySSI) => {
            if (err) {
                callback(err, undefined);
                return;
            }

            blockchainDomainData.keySSI = keySSI;
            blockchainDomainData.uid = keySSI;
            blockchainDomainData.isOwner = true;
            blockchainDomainData.type = "Owner";
            blockchainDomainData.isInstalled = false;
            blockchainDomainData.isInstalling = false;
            blockchainDomainData.isInstallFailed = false;
            const {status, dataStatus} = this.getBlockchainDomainInstallStatus(blockchainDomainData);
            blockchainDomainData.status = status;
            blockchainDomainData.dataStatus = dataStatus;
            this.updateBlockchainDomainData(organizationUid, blockchainDomainData, callback);
        });
    }

    updateBlockchainDomainData(organizationUid, blockchainDomainData, callback) {
        const {status, dataStatus} = this.getBlockchainDomainInstallStatus(blockchainDomainData);
        blockchainDomainData.status = status;
        blockchainDomainData.dataStatus = dataStatus;
        const blockchainDomainDataPath = this.getBlockchainDomainDataPath(organizationUid, blockchainDomainData.uid);
        this.DSUStorage.setObject(blockchainDomainDataPath, blockchainDomainData, (err) => {
            callback(err, blockchainDomainData);
        });
    }

    listBlockchainDomains(organizationUid, callback) {
        const blockchainDomainsPath = this.getBlockchainDomainsPath(organizationUid);
        this.DSUStorage.call('listDSUs', blockchainDomainsPath, (err, blockchainDomainsIdentifierList) => {
            if (err) {
                return callback(err);
            }

            const blockchainDomainsList = [];
            const getBlockchainDomainDSU = (blockchainDomainsIdentifierList) => {
                if (!blockchainDomainsIdentifierList.length) {
                    return callback(undefined, blockchainDomainsList);
                }

                const id = blockchainDomainsIdentifierList.pop();
                this.getBlockchainDomainData(organizationUid, id.identifier, (err, blockchainDomainData) => {
                    if (err) {
                        return callback(err);
                    }

                    blockchainDomainsList.push(blockchainDomainData);
                    getBlockchainDomainDSU(blockchainDomainsIdentifierList);
                });
            };

            getBlockchainDomainDSU(blockchainDomainsIdentifierList);
        });
    }

    getBlockchainDomainData(organizationUid, blockchainDomainUid, callback) {
        const blockchainDomainDataPath = this.getBlockchainDomainDataPath(organizationUid, blockchainDomainUid);
        this.DSUStorage.getItem(blockchainDomainDataPath, (err, content) => {
            if (err) {
                return callback(err);
            }

            const textDecoder = new TextDecoder("utf-8");
            const blockchainDomainData = JSON.parse(textDecoder.decode(content));
            callback(undefined, blockchainDomainData);
        });
    }

    getBlockchainDomainsPath(uid) {
        return `${this.ORGANIZATION_PATH}/${uid}${this.BLOCKCHAIN_DOMAINS_PATH}`;
    }

    getBlockchainDomainDataPath(organizationUid, blockchainDomainUid) {
        return `${this.getBlockchainDomainsPath(organizationUid)}/${blockchainDomainUid}/data.json`;
    }

    getBlockchainDomainInstallStatus(blockchainDomainData) {
        if (blockchainDomainData.isInstalled) {
            return {
                status: "Installed",
                dataStatus: "installed"
            }
        }

        if (blockchainDomainData.isInstalling) {
            return {
                status: "Installation Pending",
                dataStatus: "pending"
            }
        }

        if (blockchainDomainData.isInstallFailed) {
            return {
                status: "Installation Failed",
                dataStatus: "failed"
            }
        }

        return {
            status: "Ready to Install",
            dataStatus: "ready"
        }
    }
}
