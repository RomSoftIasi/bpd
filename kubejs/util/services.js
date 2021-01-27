//    listNamespacedService(namespace: string, pretty?: string, allowWatchBookmarks?: boolean, _continue?: string, fieldSelector?: string, labelSelector?: string, limit?: number, resourceVersion?: string, resourceVersionMatch?: string, timeoutSeconds?: number, watch?: boolean, options?: {

function getServices(kubeConfiguration, callback){

    const k8s = require('@kubernetes/client-node');
    const k8sApi = kubeConfiguration.makeApiClient(k8s.CoreV1Api);

    k8sApi.listNamespacedService('default','true').then((res) => {
        const services = []
        for(const service of res.body.items)
        {
            //console.log('Service status : ',service)
            //console.log('Service Cluster IP : ',service.spec.clusterIP);
            //console.log('Service name : ',service.metadata.name);
            services.push({
                name: service.metadata.name,
                clusterIP:service.spec.clusterIP
            })
        }

        callback(undefined, services);
    },(rej) => {
        console.log('request rejected : ', rej.statusCode);
        callback(new Error('request rejected : '+ rej.statusCode), undefined);
    });
}

function getServiceByName(kubeConfiguration,serviceName, callback){

    getServices(kubeConfiguration,(err, services) => {
        if (err)
        {
            return callback(err, undefined);
        }
        const serviceFound = services.find((item) => item.name === serviceName);
        if (typeof serviceFound === 'undefined')
        {
            return callback(new Error('Service not found :'+serviceName), undefined);
        }
        callback(undefined, serviceFound);
    })

}


module.exports = {
    getServices,
    getServiceByName
}