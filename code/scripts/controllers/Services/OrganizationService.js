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
            let orgs = [];
            let getOrgDsu = (dsuItem) => {
                this.DSUStorage.getItem(this._getDsuStoragePath(dsuItem.identifier), (err, content) => {
                    if (err)
                    {
                        orgs.slice(0);
                        callback(err, undefined);
                        return;
                    }
                    let textDecoder = new TextDecoder("utf-8");
                    let organization = JSON.parse(textDecoder.decode(content));
                    orgs.push(organization);

                    if (dsuList.length === 0)
                    {
                        debugger;
                        const model = new OrganizationModel()._getWrapperData();
                        model.organizations = orgs;
                        callback(undefined, model);
                        return;
                    }
                    getOrgDsu(dsuList.shift());
                })
            };


            if (dsuList.length === 0){
                    callback(undefined,orgs);
            }
            getOrgDsu(dsuList.shift());
        })



    }

    _getDsuStoragePath(keySSI){
        return this.ORGANIZATION_PATH + '/' + keySSI + '/data.json';
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
            this.DSUStorage.setObject(this._getDsuStoragePath(keySSI), data, (err) => {
                if (err){
                    callback(err, undefined);
                    return;
                }
                callback(undefined, data);
            })
        })
    }
}