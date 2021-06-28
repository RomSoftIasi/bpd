import {downloadFile} from "../../utils/fileDownloader.js";

export default class GovernanceService {

    NEWS_PATH = "/news";
    VOTING_PATH = "/voting";
    ORGANIZATION_PATH = "/organizations";
    BLOCKCHAIN_DOMAINS_PATH = "/blockchain-domains";

    constructor(DSUStorage) {
        this.DSUStorage = DSUStorage;
    }

    listVoteSessions(callback) {
        this.DSUStorage.call('listDSUs', this.VOTING_PATH, (err, votingSessionsIdentifierList) => {
            if (err) {
                return callback(err);
            }

            const voteSessionsDataList = [];
            const getVotingSessionsDSU = (votingSessionsIdentifierList) => {
                if (!votingSessionsIdentifierList.length) {
                    return callback(undefined, voteSessionsDataList);
                }

                const id = votingSessionsIdentifierList.pop();
                this.getVoteData(id.identifier, (err, newsData) => {
                    if (err) {
                        return callback(err);
                    }

                    voteSessionsDataList.push(newsData);
                    getVotingSessionsDSU(votingSessionsIdentifierList);
                });
            };

            getVotingSessionsDSU(votingSessionsIdentifierList);
        });
    }

    getVoteData(identifier, callback) {
        this.DSUStorage.getItem(this.getVotingDataPath(identifier), (err, content) => {
            if (err) {
                return callback(err);
            }

            const textDecoder = new TextDecoder("utf-8");
            const newsData = JSON.parse(textDecoder.decode(content));
            callback(undefined, newsData);
        });
    }

    registerVotingSession(voteData, callback) {
        this.DSUStorage.call('createSSIAndMount', this.VOTING_PATH, (err, keySSI) => {
            if (err) {
                callback(err, undefined);
                return;
            }

            voteData.keySSI = keySSI;
            voteData.uid = keySSI;
            this.updateVotingSessionData(voteData, callback);
        });
    }

    updateVotingSessionData(voteData, callback) {
        this.DSUStorage.setObject(this.getVotingDataPath(voteData.uid), voteData, (err) => {
            if (err) {
                return callback(err, undefined);
            }

            this.uploadCandidateDocumentation(voteData, callback);
        });
    }

    uploadCandidateDocumentation(voteData, callback) {
        if (!voteData.candidateDocumentation) {
            return callback(undefined, voteData);
        }

        const uploadPath = `${this.VOTING_PATH}/${voteData.uid}`;
        this.DSUStorage.uploadMultipleFiles(uploadPath, voteData.candidateDocumentation, {preventOverwrite: true}, (err) => {
            callback(err, voteData);
        });
    }

    downloadCandidateDocumentation(uid, documentName) {
        const downloadPath = `${this.VOTING_PATH}/${uid}`;
        downloadFile(downloadPath, documentName);
    }

    getNewsDataPath(identifier) {
        return `${this.NEWS_PATH}/${identifier}/data.json`;
    }

    getVotingDataPath(identifier) {
        return `${this.VOTING_PATH}/${identifier}/data.json`;
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
        this.DSUStorage.getItem(this.getOrganizationsDataPath(identifier), (err, content) => {
            if (err) {
                return callback(err);
            }

            const textDecoder = new TextDecoder("utf-8");
            const organizationData = JSON.parse(textDecoder.decode(content));
            callback(undefined, organizationData);
        });
    }

    listNews(callback) {
        this.DSUStorage.call('listDSUs', this.NEWS_PATH, (err, newsIdentifierList) => {
            if (err) {
                return callback(err);
            }

            const newsDataList = [];
            const getNewsDSU = (newsIdentifierList) => {
                if (!newsIdentifierList.length) {
                    return callback(undefined, newsDataList);
                }

                const id = newsIdentifierList.pop();
                this.getNewsData(id.identifier, (err, newsData) => {
                    if (err) {
                        return callback(err);
                    }

                    newsDataList.push(newsData);
                    getNewsDSU(newsIdentifierList);
                });
            };

            getNewsDSU(newsIdentifierList);
        });
    }

    getNewsData(identifier, callback) {
        this.DSUStorage.getItem(this.getNewsDataPath(identifier), (err, content) => {
            if (err) {
                return callback(err);
            }

            const textDecoder = new TextDecoder("utf-8");
            const newsData = JSON.parse(textDecoder.decode(content));
            callback(undefined, newsData);
        });
    }

    submitVotes(uid, existingVotes, callback) {
        this.getVoteData(uid, (err, voteData) => {
            if (err) {
                return callback(err);
            }

            voteData.votes = existingVotes;
            this.updateVotingSessionData(voteData, (err, response) => {
                callback(err, response);
            });
        });
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
            this.updateOrganizationData(organizationUid, blockchainDomainData, callback);
        });
    }

    updateBlockchainDomainData(organizationUid, blockchainDomainData, callback) {
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
                numberOfClusters: 0,
                isOwner: true,
                type: "Owner"
            };
            this.updateOrganizationData(organizationData, callback);
        });
    }

    updateOrganizationData(organizationData, callback) {
        this.DSUStorage.setObject(this.getOrganizationsDataPath(organizationData.uid), organizationData, (err) => {
            callback(err, organizationData);
        });
    }

    getOrganizationsDataPath(identifier) {
        return `${this.ORGANIZATION_PATH}/${identifier}/data.json`;
    }
}
