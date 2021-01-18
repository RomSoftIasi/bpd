const securityContext = require("opendsu").loadApi("sc");
const mainDSU = securityContext.getMainDSU();

function mountDSU(path, keySSI, callback) {
    //TODO: check if this is still useful
    mainDSU.readFile("/code/constitution/gtinResolver.js", (err, content) => {
        eval(content.toString());
        mainDSU.mount(path, keySSI, callback);
    });
}

function createSSIAndMount(path, callback) {
    const opendsu = require("opendsu");
    const resolver = opendsu.loadAPI("resolver");
    const keySSISpace = opendsu.loadAPI("keyssi")
    const templateSSI = keySSISpace.buildSeedSSI("default");
    resolver.createDSU(templateSSI, (err, dsuInstance) => {
        if (err) {
            console.log(err);
            return callback(err);
        }
        dsuInstance.getKeySSIAsString((err, keySSI) => {
            if (err) {
                return callback(err);
            }
            mainDSU.mount(path + "/" + keySSI, keySSI, (err) => {
                if (err) {
                    console.log(err);
                }
                callback(err, keySSI);
            });
        })
    });
}

function listDSUs(path, callback) {
    mainDSU.listMountedDossiers(path, callback);
}

function loadDSU(keySSI, callback) {
    const resolver = require("opendsu").loadAPI("resolver");
    resolver.loadDSU(keySSI, callback);
}

function listFolders(path, callback) {
    if (path.endsWith("/")) {
        path = path.slice(0, -1);
    }
    mainDSU.listFolders(path, {ignoreMounts: false}, callback);
}

module.exports = {
    mountDSU,
    listDSUs,
    listFolders,
    loadDSU,
    createSSIAndMount
}
