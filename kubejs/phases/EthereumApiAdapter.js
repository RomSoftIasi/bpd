function applyEthereumApiAdapter()
{
    const k8Configuration = require('../util/connect').connect();

    require('../util/services').getServiceByName(k8Configuration, 'quorum-node2',(err, qn2Service) =>{
        if (err)
        {
            return console.log(err);
        }
        require('../util/services').getServiceByName(k8Configuration,'anchorsmart-service', (err,scService) => {
            if (err)
            {
                return console.log(err);
            }
            const kubeApplyFile = require('../util/applyFile').applyFile;
            require('../deployment/EthereumApiAdapter').updateConfigMap(qn2Service.clusterIP, scService.clusterIP);
            kubeApplyFile('./K8/EthereumApiAdapter/apiadapter-configmap.yaml', (err) =>{
                kubeApplyFile('./K8/EthereumApiAdapter/ApiAdapter.yaml',(err) =>{

                })
            });

        });


    })
}


module.exports = {
    applyEthereumApiAdapter
}