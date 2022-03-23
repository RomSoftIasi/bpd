import DSUService from "./DSUService.js";
import {downloadFile} from "../../utils/utils.js";

export default class VotingSessionService extends DSUService {

    NEWS_PATH = "/news";
    VOTING_PATH = "/voting";

    constructor() {
        super();
    }

    listNews = (callback) => this.getEntities(this.NEWS_PATH, callback);

    getNewsData = (uid, callback) => this.getEntity(uid, this.NEWS_PATH, callback);

    listVoteSessions = (callback) => this.getEntities(this.VOTING_PATH, callback);

    getVoteData = (uid, callback) => this.getEntity(uid, this.VOTING_PATH, callback);

    registerVotingSession(voteData, callback) {
        this.createDSUAndMount(this.VOTING_PATH, (err, keySSI) => {
            if (err) {
                return callback(err);
            }

            voteData.keySSI = keySSI;
            voteData.uid = keySSI;
            this.updateEntity(voteData, callback);
        });
    }

    updateVotingSessionData(voteData, callback) {
        this.updateEntity(voteData, (err) => {
            if (err) {
                return callback(err);
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
            this.updateVotingSessionData(voteData, callback);
        });
    }

    downloadCandidateDocumentation(uid, documentName) {
        const downloadPath = `${this.VOTING_PATH}/${uid}`;
        downloadFile(downloadPath, documentName);
    }
}
