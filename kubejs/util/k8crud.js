function read(client,spec, callback){
    client.read(spec).then(( {body,response} ) => {
        console.log('patching ', spec.metadata.name);
        callback(undefined, 200);

    },(rejReason) => {
        console.log('spec doesnt exist', spec.metadata.name);
        callback(undefined, 404);
    });
}

function patch(client, spec, callback){
    client.patch(spec).then(({body,response}) => {
        console.log('patching status : ',spec.metadata.name,' ',response.statusCode);
        callback(undefined, 200);
    }, (rejReason) => {
        console.log('patching rejected', spec.metadata.name);
        callback(undefined, 500);
    })
}

function create(client, spec, callback){
    client.create(spec).then(({body,response}) => {
        console.log('create status : ',spec.metadata.name,' ',response.statusCode);
        callback(undefined, 200);
    }, (rejReason) => {
        console.log('creation rejected', spec.metadata.name);
        console.log(rejReason);
        callback(undefined, 500);
    })
}


module.exports = {
    create,
    patch,
    read
}