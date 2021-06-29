import {downloadFile} from "../../../utils/fileDownloader.js";

export default class GovernanceService {

    NEWS_PATH = "/news";
    VOTING_PATH = "/voting";

    constructor(DSUStorage) {
        this.DSUStorage = DSUStorage;
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
}
