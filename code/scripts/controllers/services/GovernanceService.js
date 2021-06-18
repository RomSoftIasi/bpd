export default class GovernanceService {

    NEWS_PATH = "/news";
    VOTING_PATH = "/voting";
    ORGANIZATION_PATH = "/organizations";

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
                this.getNewsData(id, (err, newsData) => {
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

    getNewsDataPath(identifier) {
        return `${this.NEWS_PATH}/${identifier}/data.json`;
    }

    getVotingDataPath(identifier) {
        return `${this.VOTING_PATH}/${identifier}/data.json`;
    }

    getOrganizationsDataPath(identifier) {
        return `${this.ORGANIZATION_PATH}/${identifier}/data.json`;
    }
}
