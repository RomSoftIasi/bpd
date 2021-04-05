const opendsu = require("opendsu");

export default class ClustersControllerApi {

    CLUSTER_PATH = "controlContainer";
    CLUSTER_DEPLOY_PATH = `${this.CLUSTER_PATH}/deploy`;
    CLUSTER_COMMAND_PATH = `${this.CLUSTER_PATH}/command`;
    CLUSTER_START_PATH = `${this.CLUSTER_PATH}/start`;
    CLUSTER_STATUS_PATH = `${this.CLUSTER_PATH}/status`;

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

    loopUntilClusterIsInstalled(blockchainNetworkName, callback){
        const checkStatus = function (clusterApi, blockchainNetworkName, callback){
            clusterApi.makeRequest('GET',clusterApi.CLUSTER_STATUS_PATH+'/'+blockchainNetworkName, {},(err, data) =>{
                if (err) {
                    return callback(err,undefined);
                }
                if (data.status && data.status === 'Pending'){
                    //loop
                    console.log('Check cluster status', blockchainNetworkName);
                    setTimeout(() => checkStatus(clusterApi,blockchainNetworkName, callback),60*1000);

                } else {
                    //got result
                    console.log('Cluster status check finished : ', blockchainNetworkName, data);
                    return callback (undefined, data);
                }
            })
        }

        checkStatus(this, blockchainNetworkName, callback);
    }

    startDeployCluster(clusterDetails, callback) {
        this.makeRequest('POST', this.CLUSTER_DEPLOY_PATH, clusterDetails, callback);
    }

    startCluster(clusterDetails, callback) {
        this.makeRequest('PUT', this.CLUSTER_START_PATH, clusterDetails, callback);
    }

    commandCluster(clusterDetails, callback) {
        this.makeRequest('PUT', this.CLUSTER_COMMAND_PATH, clusterDetails, callback);
    }

    getTestReport(jenkinsPipeline, buildNo,artefactName, clusterDetails,callback) {
        const data = {
            command: 'jenkinsArtefact',
            buildNo: buildNo,
            jenkinsPipeline: jenkinsPipeline,
            artefactName: artefactName,
            jenkinsData: {
                user: clusterDetails.user,
                token: clusterDetails.token,
                jenkins: clusterDetails.jenkins,
            }
        }
        this.commandCluster(data, callback);
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
                console.log('[ClusterApiCall][Response]', method, path, response.status, response.statusCode);
                if (!response.ok || [200,201,202].indexOf(response.status) === -1) {
                    return callback(response);
                }

                for(let entry of response.headers.entries()) {
                    if (entry[0] === 'content-type' && entry[1] === 'application/raw')
                    {
                        console.log('Received raw response');
                        return response.text();
                    }
                }
                //fallback to default json
                console.log('Received json response');
                return response.json();
            })
            .then((data) => {
              // console.log('Received data from ControlContainer: ',data);
                callback(undefined, data);
            })
            .catch(error => {
                return callback(error);
            })

    }
}

