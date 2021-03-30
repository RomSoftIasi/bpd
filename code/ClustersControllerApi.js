const opendsu = require("opendsu");

export default class ClustersControllerApi {

    CLUSTER_PATH = "controlContainer";
    CLUSTER_DEPLOY_PATH = `${this.CLUSTER_PATH}/deploy`;
    CLUSTER_COMMAND_PATH = `${this.CLUSTER_PATH}/command`;
    CLUSTER_START_PATH = `${this.CLUSTER_PATH}/start`;

    constructor() {
        let SERVER_ENDPOINT = window.location.origin;
        if (SERVER_ENDPOINT[SERVER_ENDPOINT.length - 1] !== "/") {
            SERVER_ENDPOINT += "/";
        }
        this.serverEndpoint = SERVER_ENDPOINT;
        const endpointURL = new URL(SERVER_ENDPOINT);
        this.apiEndpoint = endpointURL.hostname;
        this.apiPort = endpointURL.port;
    }

    deployCluster(clusterDetails, callback) {
        this.makeRequest('POST', this.CLUSTER_DEPLOY_PATH, clusterDetails, callback);
    }

    startCluster(clusterDetails, callback) {
        this.makeRequest('PUT', this.CLUSTER_START_PATH, clusterDetails, callback);
    }

    commandCluster(clusterDetails, callback) {
        this.makeRequest('PUT', this.CLUSTER_COMMAND_PATH, clusterDetails, callback);
    }

    getTestReport(callback) {

    }

    getPipelineLog(jenkinsPipeline, buildNo, clusterDetails, callback){
        const data = {
            command: 'jenkinsLog',
            buildNo: buildNo,
            jenkinsPipeline: jenkinsPipeline,
            jenkinsData: {
                user: clusterDetails.user,
                token: clusterDetails.token,
                jenkins: clusterDetails.jenkins,
            }
        }
        this.commandCluster(data, callback);
    }

    makeRequest(method, path, body, callback) {
        console.log('[ClusterApiCall][Request]', method, path, JSON.stringify(body));
        const bodyData = JSON.stringify(body);
        const apiHeaders = {
            'Content-Type': 'application/json',
            'Content-Length': bodyData.length
        };
        const options = {
            hostname: this.apiEndpoint,
            port: this.apiPort,
            path,
            method,
            apiHeaders
        };
        if (body && JSON.stringify(body) !== JSON.stringify({})) {
            options.body = bodyData;
        }
        let protocolInit = opendsu.loadAPI('http');
        protocolInit.fetch(this.serverEndpoint + path + "#x-blockchain-domain-request", options)
            .then(response => {
                response.json()
                    .then((data) => {
                        console.log('[ClusterApiCall][Response]', method, path, response.status, response.statusCode, data);
                        if (!response.ok || response.status != 201) {
                            return callback(response);
                        }
                        callback(undefined, data);
                    })
                    .catch(error => {
                        return callback(error);
                    });
            })
            .catch(error => {
                return callback(error);
            })
    }
}

