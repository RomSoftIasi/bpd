function updateConfigMap(rpcHostIp,smartContractIp){
    const fs = require('fs');
    let content = fs.readFileSync('./K8/EthereumApiAdapter/apiadapter-configmap-template.yaml').toString('utf8');
    content = content.replace('<RPC_ADDRESS>',rpcHostIp);
    content = content.replace('<SMARTCONTRACT_ENDPOINT>',smartContractIp);
    fs.writeFileSync('./K8/EthereumApiAdapter/apiadapter-configmap.yaml', content,'utf8');
}



module.exports = {
    updateConfigMap
}