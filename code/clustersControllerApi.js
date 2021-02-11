const opendsu = require("opendsu");
/*
/listClusters
/deploy(containerName, url_config_repo, configMapFromUI)
/commandForControlContainer/number/command?params
 */

const SERVER_ENDPOINT = "http://127.0.0.1:8080/";
const endpointURL = new URL(SERVER_ENDPOINT);
const apiEndpoint = endpointURL.hostname;
const apiPort = endpointURL.port;
const protocol = endpointURL.protocol.replace(':', "");

const CLUSTER_PATH = "controlContainer";
const CLUSTER_LIST_PATH = `${CLUSTER_PATH}/listClusters`;

function listClusters(callback) {
    const bodyData = JSON.stringify({});
    const apiMethod = 'GET';
    const apiHeaders = {
        'Content-Type': 'application/json',
        'Content-Length': bodyData.length
    };
    const options = {
        hostname: apiEndpoint,
        port: apiPort,
        CLUSTER_LIST_PATH,
        apiMethod,
        apiHeaders
    };
    let protocol = opendsu.loadAPI('http');
    protocol.fetch(SERVER_ENDPOINT + CLUSTER_LIST_PATH, options)
        .then(response => {
            response.json()
                .then((data) => {
                    callback(undefined, data);
                });
        })
        .catch(error => {
            return callback(error);
        })
}

export default {
    listClusters
}