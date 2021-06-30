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
            blockchainDomainData.deploymentLogs = "";
            const {status, shortStatus, dataStatus} = this.getBlockchainDomainInstallStatus(blockchainDomainData);
            blockchainDomainData.status = status;
            blockchainDomainData.shortStatus = shortStatus;
            blockchainDomainData.dataStatus = dataStatus;
            this.updateBlockchainDomainData(organizationUid, blockchainDomainData, callback);
        });
    }

    updateBlockchainDomainData(organizationUid, blockchainDomainData, callback) {
        const {status, shortStatus, dataStatus} = this.getBlockchainDomainInstallStatus(blockchainDomainData);
        blockchainDomainData.status = status;
        blockchainDomainData.shortStatus = shortStatus;
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

    removeBlockchainDomain(organizationUid, blockchainDomainUid, callback) {
        const blockchainDomainPath = `${this.BLOCKCHAIN_DOMAINS_PATH}/${blockchainDomainUid}`;
        this.DSUStorage.call('clusterUnmount', organizationUid, blockchainDomainPath, callback);
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
                shortStatus: "Installed",
                status: "Blockchain domain installed successfully.",
                dataStatus: "installed"
            }
        }

        if (blockchainDomainData.isInstalling) {
            return {
                shortStatus: "Installation Pending",
                status: "Blockchain domain installation pending...",
                dataStatus: "pending"
            }
        }

        if (blockchainDomainData.isInstallFailed) {
            return {
                shortStatus: "Installation Failed",
                status: "Blockchain domain FAILED to be installed.",
                dataStatus: "failed"
            }
        }

        return {
            shortStatus: "Ready to Install",
            status: "Blockchain domain is ready to install.",
            dataStatus: "ready"
        }
    }
}
