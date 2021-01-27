function deployQuorum(callback)
{
    deployEnvironment (err => {
        if (err)
        {
            return callback(err);
        }

        deployNetwork((err) => {
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
                callback(undefined);
                }
            )

        })


    })
}

function deployEnvironment(callback)
{
const kubeApplyFile = require('../util/applyFile').applyFile;
kubeApplyFile('./K8/Quorum/00-quorum-persistent-volumes.yaml', (err) =>{
    if (err)
    {
        return callback(err);
    }

    kubeApplyFile('./K8/Quorum/01-quorum-genesis.yaml', (err) =>{
        if (err)
        {
            return callback(err);
        }
        kubeApplyFile('./K8/Quorum/02-quorum-shared-config.yaml', (err) =>{
            if (err)
            {
                return callback(err);
            }
            kubeApplyFile('./K8/Quorum/03-quorum-services.yaml', (err) =>{
                if (err)
                {
                    return callback(err);
                }
                kubeApplyFile('./K8/Quorum/04-quorum-keyconfigs.yaml', (err) => {
                    if (err)
                    {
                        return callback(err);
                    }
                    return callback(undefined);
                });
            });
        });
    });


})

}

function deployNetwork(callback)
{
//applyFile('./K8/Quorum/deployments/01-quorum-single-deployment.yaml'); - OK
//applyFile('./K8/Quorum/deployments/02-quorum-single-deployment.yaml'); - OK
//applyFile('./K8/Quorum/deployments/03-quorum-single-deployment.yaml'); - OK
//applyFile('./K8/Quorum/deployments/04-quorum-single-deployment.yaml'); - OK

    const kubeApplyFile = require('../util/applyFile').applyFile;
    kubeApplyFile('./K8/Quorum/deployments/01-quorum-single-deployment.yaml', (err) =>{
        if (err)
        {
            return callback(err);
        }
        kubeApplyFile('./K8/Quorum/deployments/02-quorum-single-deployment.yaml', (err) =>{
            if (err)
            {
                return callback(err);
            }
            kubeApplyFile('./K8/Quorum/deployments/03-quorum-single-deployment.yaml', (err) => {
                if (err)
                {
                    return callback(err);
                }
                kubeApplyFile('./K8/Quorum/deployments/04-quorum-single-deployment.yaml', (err) =>{
                    if (err)
                    {
                        return callback(err);
                    }
                    callback(undefined);
                });
            });
        });
    });
}


module.exports = {
    deployQuorum
}