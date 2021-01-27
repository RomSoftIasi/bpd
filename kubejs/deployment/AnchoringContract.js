function updateConfigMap(rpcHostIp){
    const fs = require('fs');
    let content = fs.readFileSync('./K8/AnchoringContract/anchor-configmap-template.yaml').toString('utf8');
    content = content.replace('<RPC_HOST>',rpcHostIp);
    fs.writeFileSync('./K8/AnchoringContract/anchor-configmap.yaml', content,'utf8');
}



module.exports = {
    updateConfigMap
}