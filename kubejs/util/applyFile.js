function applyFile(file, callback)
{
    const k8Configuration = require('./connect').connect();
    const k8 = require('./apply');
    k8.apply(k8Configuration,file, (err) => {
        if (err) {
            console.log(err);
            return callback(err);
        }
        callback(undefined);
    });
}


module.exports = {
    applyFile
}