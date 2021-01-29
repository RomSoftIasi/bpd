function getPods(kubeConfiguration, callback){

    const k8s = require('@kubernetes/client-node');
    const k8sApi = kubeConfiguration.makeApiClient(k8s.CoreV1Api);

    k8sApi.listNamespacedPod('default','true').then((res) => {
        const pods = []
        for(const pod of res.body.items)
        {
//            console.log(pod);
            console.log('Container status : ',pod.status.phase)
            console.log('Container status : ',pod.metadata.name)
            pods.push( {
                podName : pod.metadata.name,
                podStatus : pod.status.phase
            });
        }
        callback(undefined, pods);
    },(rej) => {
        console.log('request rejected : ', rej.statusCode);
        callback(new Error('request rejected : '+ rej.statusCode), undefined);
    });
}


function getPodByName(kubeConfiguration,podName, callback){

    getPods(kubeConfiguration,(err, pods) => {
        if (err)
        {
            return callback(err, undefined);
        }
        const podFound = pods.find((item) => item.podName ===podName);
        if (typeof podFound === 'undefined')
        {
            return callback(new Error('Pod not found :'+podName), undefined);
        }
        callback(undefined, podFound);
    })

}


function waitForPodToBeOnline(k8Configuration, podName, retryNo, callback)
{
    getPodByName(k8Configuration,podName,(err,pod) => {
        if (retryNo === 0)
        {
            return callback(new Error('Pod query status timeout ...'+ podName), undefined);
        }
        retryNo --;
        if (err || (pod.podStatus !== 'Running'))
        {
            console.log('Waiting for pod to come online ', podName);
            return setTimeout(() => {
                waitForPodToBeOnline(k8Configuration, podName,retryNo, callback)
            },10000)
        }

        callback(undefined, pod);
    })
}


function waitForAllThePodsToBeOnline(k8Configuration, retryNo, callback)
{
    getPods(k8Configuration,(err,pods) => {
        if (retryNo === 0)
        {
            return callback(new Error('Pods query status timeout ...'), undefined);
        }
        retryNo --;
        let keepWaiting = false;
        for(const pod of pods)
        {
            if (pod.podStatus !== 'Running')
            {
                keepWaiting = true;
                break;
            }
        }
        if (err || keepWaiting)
        {
            console.log('Waiting for pods to come online ');
            return setTimeout(() => {
                waitForAllThePodsToBeOnline(k8Configuration, retryNo, callback)
            },10000)
        }

        callback(undefined, pods);
    })
}

module.exports = {
    getPodByName,
    getPods,
    waitForPodToBeOnline,
    waitForAllThePodsToBeOnline
}