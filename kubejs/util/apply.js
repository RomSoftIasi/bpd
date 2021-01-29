function apply2(kubeConfiguration, filePath, callback){

    const k8s = require('@kubernetes/client-node');
    const fs = require('fs');
    const yaml = require('js-yaml');


    const client = k8s.KubernetesObjectApi.makeApiClient(kubeConfiguration);
    const specFile = fs.readFileSync(filePath);

    const specs = yaml.loadAll(specFile.toString('utf8'));
    const validSpecs = specs ;
        //specs.filter((s) => s && s.kind && s.metadata);
    let noOfValidSpecs = validSpecs.length;





    for(const spec of validSpecs){

        spec.metadata = spec.metadata || {};
        spec.metadata.annotations = spec.metadata.annotations || {};
        delete spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'];
        spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'] = JSON.stringify(spec);

        const k8crud = require('./k8crud');

        k8crud.read(client,spec, (err, statusCode) => {
            noOfValidSpecs--;
            if (statusCode === 404)
            {
                //spec doesnt exist, create it
                return k8crud.create(client,spec, (err, statusCode) => {
                    if (noOfValidSpecs === 0)
                    {
                        return callback(undefined);
                    }
                })
            }

            if (statusCode === 200)
            {
                //spec exist, patch it
                return k8crud.patch(client, spec, (err, statusCode) => {
                    if (noOfValidSpecs === 0)
                    {
                        return callback(undefined);
                    }
                })
            }
            return callback(new Error('Unable to apply configuration specification '+ spec));
        })

    }
}


function apply(kubeConfiguration, filePath, callback){

    const k8s = require('@kubernetes/client-node');
    const fs = require('fs');
    const yaml = require('js-yaml');


    const client = k8s.KubernetesObjectApi.makeApiClient(kubeConfiguration);
    const specFile = fs.readFileSync(filePath);

    const specs = yaml.loadAll(specFile.toString('utf8'));
    const validSpecs = specs ;
    //specs.filter((s) => s && s.kind && s.metadata);

    let processSpec = (spec) => {

        processSpecification(client,spec, (err) =>{
            if (err)
            {
                return callback(err, undefined)
            }
            if (validSpecs.length === 0)
            {
                return callback(undefined);
            }
            processSpec(validSpecs.shift());
        })

    };

    processSpec(validSpecs.shift());
}

function processSpecification (client, spec, callback){
    spec.metadata = spec.metadata || {};
    spec.metadata.annotations = spec.metadata.annotations || {};
    delete spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'];
    spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'] = JSON.stringify(spec);

    const k8crud = require('./k8crud');

    k8crud.read(client,spec, (err, statusCode) => {

        if (statusCode === 404)
        {
            //spec doesnt exist, create it
            return k8crud.create(client,spec, (err, statusCode) => {
                return callback(err);
            })
        }

        if (statusCode === 200)
        {
            //spec exist, patch it
            return k8crud.patch(client, spec, (err, statusCode) => {
                return callback(err);
            })
        }
        return callback(new Error('Unable to apply configuration specification '+ spec));
    })
}
module.exports = {
    apply
};