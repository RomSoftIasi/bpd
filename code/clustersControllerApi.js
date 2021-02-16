const opendsu = require("opendsu");
/*
/listClusters
/deploy(containerName, url_config_repo, configMapFromUI)
/commandForControlContainer/number/command?params
 */

const SERVER_ENDPOINT = window.location.origin;
const endpointURL = new URL(SERVER_ENDPOINT);
const apiEndpoint = endpointURL.hostname;
const apiPort = endpointURL.port;
const protocol = endpointURL.protocol.replace(':', "");

const CLUSTER_PATH = "controlContainer";
const CLUSTER_LIST_PATH = `${CLUSTER_PATH}/listClusters`;
const CLUSTER_DEPLOY_PATH = `${CLUSTER_PATH}/deploy`;
const CLUSTER_COMMAND_PATH = `${CLUSTER_PATH}/command`;
const CLUSTER_START_PATH = `${CLUSTER_PATH}/start`;

function listClusters(callback) {
    makeRequest('GET', CLUSTER_LIST_PATH, {}, callback);
}

function deployCluster(clusterDetails, callback) {
    makeRequest('POST', CLUSTER_DEPLOY_PATH, clusterDetails, callback);
}

function startCluster(clusterDetails, callback) {
    makeRequest('PUT', CLUSTER_START_PATH, clusterDetails, callback);
}

function commandCluster(clusterDetails, callback) {
    makeRequest('PUT', CLUSTER_COMMAND_PATH, clusterDetails, callback);
}

function makeRequest(method, path, body, callback) {
    console.log('[ClusterApiCall][Request]', method, path, JSON.stringify(body));
    const bodyData = JSON.stringify(body);
    const apiHeaders = {
        'Content-Type': 'application/json',
        'Content-Length': bodyData.length
    };
    const options = {
        hostname: apiEndpoint,
        port: apiPort,
        path,
        method,
        apiHeaders
    };
    if (body && JSON.stringify(body) !== JSON.stringify({})) {
        options.body = bodyData;
    }
    let protocolInit = opendsu.loadAPI(protocol);
    protocolInit.fetch(SERVER_ENDPOINT + '/' + path + "#x-blockchain-domain-request", options)
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

export default {
    listClusters,
    deployCluster,
    startCluster,
    commandCluster,
}
