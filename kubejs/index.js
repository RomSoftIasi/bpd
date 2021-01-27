const k8s = require('@kubernetes/client-node');
const fs = require('fs');
const yaml = require('js-yaml');
const { promisify } = require('util');

async function go () {

    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    console.log(kc.currentContext);
    /*
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

    k8sApi.listNamespacedPod('default','true').then((res) => {
        console.log(res.body);
        //const b = JSON.parse(res.body);
        console.log(res.body.items[0].status)
    });*/
    const specPath = './K8/ApiAdapter.yaml';
    const client = k8s.KubernetesObjectApi.makeApiClient(kc);
    const spec1 = fs.readFileSync(specPath, );
    const fsReadFileP = promisify(fs.readFile);

    const specString = await fsReadFileP(specPath);
    const specs = yaml.loadAll(spec1.toString('utf8'));
    const validSpecs = specs.filter((s) => s && s.kind && s.metadata);
    console.log(specs);
    return;
    const created = [];
    for (const spec of validSpecs) {
        // this is to convince the old version of TypeScript that metadata exists even though we already filtered specs
        // without metadata out
        spec.metadata = spec.metadata || {};
        spec.metadata.annotations = spec.metadata.annotations || {};
        delete spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'];
        spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'] = JSON.stringify(spec);
        try {
            // try to get the resource, if it does not exist an error will be thrown and we will end up in the catch
            // block.
            await client.read(spec);
            // we got the resource, so it exists, so patch it
            const response = await client.patch(spec);
            created.push(response.body);
        } catch (e) {
            // we did not get the resource, so it does not exist, so create it
            const response = await client.create(spec);
            created.push(response.body);
        }
    }

    console.log(created);

}

function applyFile(file, callback)
{
    const k8Configuration = require('./util/connect').connect();
    const k8 = require('./util/apply');
    k8.apply(k8Configuration,file, (err) => {
        if (err) {
            console.log(err);
        }
        callback(err);
    });
}


function deployQuorum(callback)
{
    const k8Configuration = require('./util/connect').connect();
    const k8 = require('./util/apply');
    k8.apply(k8Configuration,'./K8/Quorum/00-quorum-persistent-volumes.yaml', (err) => {
        if (err)
        {
            return console.log(err);
        }
        k8.apply(k8Configuration,'./K8/Quorum/01-quorum-genesis.yaml', (err) => {
            if (err)
            {
                return console.log(err);
            }
            k8.apply(k8Configuration,'./K8/Quorum/02-quorum-shared-config.yaml', (err) => {
                if (err)
                {
                    return console.log(err);
                }
                k8.apply(k8Configuration,'./K8/Quorum/03-quorum-services.yaml', (err) => {
                    if (err)
                    {
                        return console.log(err);
                    }
                    k8.apply(k8Configuration,'./K8/Quorum/04-quorum-keyconfigs.yaml', (err) => {
                        if (err)
                        {
                            return console.log(err);
                        }

                    });
                });
            });
        });
    });
}

function deployQuorumDeployments(callback)
{
    const k8Configuration = require('./util/connect').connect();
    const k8 = require('./util/apply');
    k8.apply(k8Configuration,'./K8/Quorum/deployments/01-quorum-single-deployment.yaml', (err) => {
        if (err)
        {
            return console.log(err);
        }
        k8.apply(k8Configuration,'./K8/Quorum/deployments/02-quorum-single-deployment.yaml', (err) => {
            if (err)
            {
                return console.log(err);
            }
            k8.apply(k8Configuration,'./K8/Quorum/deployments/03-quorum-single-deployment.yaml', (err) => {
                if (err)
                {
                    return console.log(err);
                }
                k8.apply(k8Configuration,'./K8/Quorum/deployments/04-quorum-single-deployment.yaml', (err) => {
                    if (err)
                    {
                        return console.log(err);
                    }
                    require('./util/getpods').waitForAllThePodsToBeOnline(k8Configuration, 15, (err, pods) => {
                        if (err)
                        {
                            return console.log(err);
                        }
                        console.log(pods);
                    })
                });
            });
        });
    });
}

function deployApiAdaptor(){
    const k8Configuration = require('./util/connect').connect();
    require('./util/apply').apply(k8Configuration,'./K8/ApiAdapter.yaml', (err) => {
        if (err)
        {
            return console.log(err);
        }
    });


}
function applyAnchoringContract()
{
    const k8Configuration = require('./util/connect').connect();

    require('./util/services').getServiceByName(k8Configuration, 'quorum-node1',(err, service) =>{
            if (err)
            {
                return console.log(err);
            }
            require('./deployment/AnchoringContract').updateConfigMap(service.clusterIP);
            applyFile('./K8/AnchoringContract/anchor-configmap.yaml', (err) =>{
                applyFile('./K8/AnchoringContract/anchor_smart.yaml',(err) =>{

                })
            });
    })
}
function applyEthereumApiAdapter()
{
    const k8Configuration = require('./util/connect').connect();

    require('./util/services').getServiceByName(k8Configuration, 'quorum-node2',(err, qn2Service) =>{
        if (err)
        {
            return console.log(err);
        }
        require('./util/services').getServiceByName(k8Configuration,'anchorsmart-service', (err,scService) => {
            if (err)
            {
                return console.log(err);
            }
            require('./deployment/EthereumApiAdapter').updateConfigMap(qn2Service.clusterIP, scService.clusterIP);
            applyFile('./K8/EthereumApiAdapter/apiadapter-configmap.yaml', (err) =>{
                applyFile('./K8/EthereumApiAdapter/ApiAdapter.yaml',(err) =>{

                })
            });

        });


    })
}



require('./phases/quorum').deployQuorum((err) => {
    if (err){
        return console.log('fail !!!!');
    }
    require('./phases/AnchorSmartContract').applyAnchoringContract((err) => {
        if (err)
        {
            return console.log(err);
        }
        require('./phases/EthereumApiAdapter').applyEthereumApiAdapter((err) => {
            if (err)
            {
                return console.log(err);
            }
            console.log('Done!?');
        })
    })

})

//applyEthereumApiAdapter()
//applyFile('./K8/Quorum/00-quorum-persistent-volumes.yaml'); - OK
//applyFile('./K8/Quorum/01-quorum-genesis.yaml'); - OK
//applyFile('./K8/Quorum/02-quorum-shared-config.yaml'); - OK
//applyFile('./K8/Quorum/03-quorum-services.yaml'); - OK
//applyFile('./K8/Quorum/04-quorum-keyconfigs.yaml'); - OK

//applyFile('./K8/Quorum/deployments/01-quorum-single-deployment.yaml'); - OK
//applyFile('./K8/Quorum/deployments/02-quorum-single-deployment.yaml'); - OK
//applyFile('./K8/Quorum/deployments/03-quorum-single-deployment.yaml'); - OK
//applyFile('./K8/Quorum/deployments/04-quorum-single-deployment.yaml'); - OK
//applyAnchoringContract - OK
//applyEthereumApiAdapter() - OK

//deployQuorum();
//deployQuorumDeployments();
//deployApiAdaptor();
//go();