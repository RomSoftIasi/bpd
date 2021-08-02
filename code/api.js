const opendsu = require("opendsu")
const securityContext = opendsu.loadApi("sc");
const resolver = opendsu.loadAPI("resolver");
const keySSISpace = opendsu.loadAPI("keyssi")

function createSSIAndMount(path, callback) {
    const templateSSI = keySSISpace.buildTemplateSeedSSI("default");
    resolver.createDSU(templateSSI, (err, dsuInstance) => {
        if (err) {
            console.log(err);
            return callback(err);
        }
        dsuInstance.getKeySSIAsString((err, keySSI) => {
            if (err) {
                return callback(err);
            }

            securityContext.getMainDSU((err, mainDSU) => {
                if (err) {
                    return callback(err);
                }

                mainDSU.mount(path + "/" + keySSI, keySSI, (err) => {
                    if (err) {
                        console.log(err);
                    }

                    callback(err, keySSI);
                });
            });
        });
    });
}

function mount(path, keySSI, callback) {
    securityContext.getMainDSU((err, mainDSU) => {
        if (err) {
            return callback(err);
        }

        mainDSU.mount(path + "/" + keySSI, keySSI, (err, result) => {
            callback(err, result);
        });
    });
}

function listDSUs(path, callback) {
    securityContext.getMainDSU((err, mainDSU) => {
        if (err) {
            return callback(err);
        }

        mainDSU.listMountedDossiers(path, callback);
    });
}

function loadDSU(keySSI, callback) {
    resolver.loadDSU(keySSI, callback);
}

function organizationUnmount(path, callback) {
    securityContext.getMainDSU((err, mainDSU) => {
        if (err) {
            return callback(err);
        }

        mainDSU.unmount(path, callback);
    });
}

function clusterUnmount(organizationUid, clusterPath, callback) {
    loadDSU(organizationUid, (err, orgDossier) => {
        if (err) {
            return callback(err);
        }

        orgDossier.unmount(clusterPath, (err, data) => {
            callback(err, data);
        });
    });
}

module.exports = {
    listDSUs,
    loadDSU,
    createSSIAndMount,
    organizationUnmount,
    clusterUnmount,
    mount
}
