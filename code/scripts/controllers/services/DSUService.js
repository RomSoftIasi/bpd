const opendsu = require("opendsu");
const storage = opendsu.loadApi('storage');
const resolver = opendsu.loadAPI('resolver');
const keySSISpace = opendsu.loadAPI('keyssi');

const pskPath = require("swarmutils").path;

export default class DSUService {

    PATH = "/";
    DATA_PATH = "/data.json";
    DOMAIN = "default";

    constructor(path = this.PATH) {
        this.DSUStorage = storage.getDSUStorage();
        this.PATH = path;
    }

    letDSUStorageInit() {
        if (typeof this.initializationPromise === 'undefined') {
            this.initializationPromise = new Promise((resolve) => {
                if (this.DSUStorage === undefined || this.DSUStorage.directAccessEnabled === true) {
                    return resolve();
                }

                this.DSUStorage.enableDirectAccess(() => {
                    resolve();
                });
            });
        }

        return this.initializationPromise;
    }

    createDSUAndMount(path, callback) {
        [path, callback] = this._swapParamsIfPathIsMissing(path, callback);
        console.log("[PATH]", path);
        const templateSSI = keySSISpace.createTemplateSeedSSI(this.DOMAIN);
        resolver.createDSU(templateSSI, (err, dsuInstance) => {
            if (err) {
                return this._cancelBatchOnError(err, callback);
            }

            dsuInstance.getKeySSIAsString((err, keySSI) => {
                if (err) {
                    return this._cancelBatchOnError(err, callback);
                }

                this.letDSUStorageInit().then(() => {
                    this.DSUStorage.beginBatch();
                    const mountPath = pskPath.join(path, keySSI);
                    console.log("[PATH]", mountPath);
                    this.DSUStorage.mount(mountPath, keySSI, (err) => {
                        if (err) {
                            return this._cancelBatchOnError(err, callback);
                        }

                        this.DSUStorage.commitBatch((err) => {
                            if (err) {
                                return this._cancelBatchOnError(err, callback);
                            }

                            callback(undefined, keySSI);
                        });
                    });
                });
            });
        });
    }

    getEntities(path, callback) {
        [path, callback] = this._swapParamsIfPathIsMissing(path, callback);
        console.log("[PATH]", path);
        this.letDSUStorageInit().then(() => {
            this.DSUStorage.listMountedDSUs(path.split("/blockchain-domains")[0], (err, dsuList) => {
                console.log("[LIST]", err, dsuList);
            });

            this.DSUStorage.listMountedDSUs(path, (err, dsuList) => {
                if (err) {
                    return callback(err);
                }

                const entities = [];
                const chain = (list) => {
                    if (list.length === 0) {
                        return callback(undefined, entities);
                    }

                    const entity = list.shift();
                    resolver.loadDSU(entity.identifier, (err, dsuInstance) => {
                        if (err) {
                            return callback(err);
                        }

                        dsuInstance.readFile(this.DATA_PATH, (err, content) => {
                            if (err) {
                                return callback(err);
                            }

                            entities.push(JSON.parse(content.toString()));
                            chain(list);
                        });
                    });
                };

                chain(dsuList);
            });
        });
    }

    getEntity(uid, path, callback) {
        [path, callback] = this._swapParamsIfPathIsMissing(path, callback);
        console.log("[PATH]", path);
        const _path = this._getDsuStoragePath(uid, path);
        console.log("[PATH]", _path);
        this.DSUStorage.getItem(_path, (err, content) => {
            if (err) {
                return callback(err, undefined);
            }

            let textDecoder = new TextDecoder('utf-8');
            callback(undefined, JSON.parse(textDecoder.decode(content)));
        });
    }

    updateEntity(entity, path, callback) {
        [path, callback] = this._swapParamsIfPathIsMissing(path, callback);
        console.log("[PATH]", path);
        this.letDSUStorageInit().then(() => {
            this.DSUStorage.beginBatch();
            const _path = this._getDsuStoragePath(entity.uid, path);
            console.log("[PATH]", _path);
            this.DSUStorage.setObject(_path, entity, (err) => {
                if (err) {
                    return this._cancelBatchOnError(err, callback);
                }

                this.DSUStorage.commitBatch((err) => {
                    if (err) {
                        return this._cancelBatchOnError(err, callback);
                    }

                    callback(undefined, entity);
                });
            });
        });
    }

    unmountEntity(uid, path, callback) {
        [path, callback] = this._swapParamsIfPathIsMissing(path, callback);
        console.log("[PATH]", path);
        const unmountPath = pskPath.join(path, uid);
        console.log("[PATH]", unmountPath);
        this.letDSUStorageInit().then(() => {
            this.DSUStorage.beginBatch();
            this.DSUStorage.unmount(unmountPath, (err) => {
                if (err) {
                    return this._cancelBatchOnError(err, callback);
                }

                this.DSUStorage.commitBatch((err) => {
                    if (err) {
                        return this._cancelBatchOnError(err, callback);
                    }

                    callback(undefined);
                });
            });
        });
    }

    readFile(path, callback) {
        [path, callback] = this._swapParamsIfPathIsMissing(path, callback);
        console.log("[PATH]", path);
        this.DSUStorage.readFile(path, callback);
    }

    writeFile(path, fileBuffer, callback) {
        [path, callback] = this._swapParamsIfPathIsMissing(path, callback);
        console.log("[PATH]", path);
        this.letDSUStorageInit().then(() => {
            this.DSUStorage.beginBatch();
            this.DSUStorage.writeFile(path, fileBuffer, (err) => {
                if (err) {
                    return this._cancelBatchOnError(err, callback);
                }

                this.DSUStorage.commitBatch((err) => {
                    if (err) {
                        return this._cancelBatchOnError(err, callback);
                    }

                    callback(undefined);
                });
            });
        });
    }

    _swapParamsIfPathIsMissing(path, callback) {
        return typeof path === 'function' ? [this.PATH, path] : [path, callback];
    }

    _getDsuStoragePath(keySSI, path = this.PATH) {
        return pskPath.join(path, keySSI, this.DATA_PATH);
    }

    _cancelBatchOnError(dsuInstance, error, callback) {
        if (typeof error === "function") {
            callback = error;
            error = dsuInstance;
            dsuInstance = this.DSUStorage;
        }

        dsuInstance.cancelBatch((err) => {
            if (err) {
                console.error(err);
            }

            callback(error);
        });
    }
}