function connect(kubeConfig){
    let useDefaultKubectlConfig = false;
    if (typeof kubeConfig === 'undefined')
    {
        console.log('Using current kubectl context ...');
        useDefaultKubectlConfig = true;
    }
    const k8s = require('@kubernetes/client-node');
    let kc;
    if (useDefaultKubectlConfig)
    {
        kc = new k8s.KubeConfig();
        kc.loadFromDefault();
    }
    else {
        kc = new k8s.KubeConfig();
        kc.loadFromString(kubeConfig);
    }

    return kc;
}


module.exports = {
    connect
};