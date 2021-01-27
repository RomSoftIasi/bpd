function applyAnchoringContract(callback)
{
    const k8Configuration = require('../util/connect').connect();

    require('../util/services').getServiceByName(k8Configuration, 'quorum-node1',(err, service) =>{
        if (err)
        {
            return callback(err);
        }
        require('../deployment/AnchoringContract').updateConfigMap(service.clusterIP);
        const kubeApplyFile = require('../util/applyFile').applyFile;
        kubeApplyFile('./K8/AnchoringContract/anchor-configmap.yaml', (err) =>{
            if (err)
            {
                return callback(err);
            }
            kubeApplyFile('./K8/AnchoringContract/anchor_smart.yaml',(err) =>{
                if (err)
                {
                    return callback(err);
                }
                const k8config = require('../util/connect').connect();
                require('../util/getpods').waitForAllThePodsToBeOnline(k8config,10, (err) =>{
                        if (err)
                        {
                            return callback(err);
                        }
                        setTimeout(callback,20000,undefined);

                    }
                )
            })
        });
    })
}

module.exports = {
    applyAnchoringContract
}