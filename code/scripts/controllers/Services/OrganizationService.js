import OrganizationModel from '../../models/OrganizationModel.js';

export default class OrganizationService {

    ORGANIZATION_PATH = "/organizations";

    constructor(DSUStorage) {
        this.DSUStorage = DSUStorage;
    }

    getOrganizationModel(callback){
        this.DSUStorage.call('listDSUs', this.ORGANIZATION_PATH, (err, dsuList) => {
            if (err){
                callback(err, undefined);
                return;
            }
            let organisations = [];
            let getOrgDsu = (dsuItem) => {
                this.DSUStorage.getItem(this._getDsuStoragePath(dsuItem.identifier), (err, content) => {
                    if (err)
                    {
                        organisations.slice(0);
                        callback(err, undefined);
                        return;
                    }
                    let textDecoder = new TextDecoder("utf-8");
                    let organization = JSON.parse(textDecoder.decode(content));
                    organisations.push(organization);

                    if (dsuList.length === 0)
                    {
                        const model = new OrganizationModel()._getWrapperData();
                        model.organizations = organisations;
                        callback(undefined, model);
                        return;
                    }
                    getOrgDsu(dsuList.shift());
                })
            };


            if (dsuList.length === 0){
                const model = new OrganizationModel()._getWrapperData();
                callback(undefined, model);
                return;
            }
            getOrgDsu(dsuList.shift());
        })

    }

    getOrganization(uid, callback){
        this.DSUStorage.getItem(this._getDsuStoragePath(uid), (err, content) => {
            if (err)
            {
                callback(err, undefined);
                return;
            }
            let textDecoder = new TextDecoder("utf-8");
            let organization = JSON.parse(textDecoder.decode(content));
            callback(undefined, organization);
        })
    }

    saveOrganization(data, callback){
        this.DSUStorage.call('createSSIAndMount',this.ORGANIZATION_PATH, (err, keySSI) => {
            if (err)
            {
                callback(err,undefined);
                return;
            }
            data.KeySSI = keySSI;
            data.uid = keySSI;
            this.updateOrganization(data, callback);
        })
    }

    updateOrganization(data, callback){
        this.DSUStorage.setObject(this._getDsuStoragePath(data.uid), data, (err) => {
            if (err){
                callback(err, undefined);
                return;
            }
            callback(undefined, data);
        })
    }

    _getDsuStoragePath(keySSI){
        return this.ORGANIZATION_PATH + '/' + keySSI + '/data.json';
    }
}