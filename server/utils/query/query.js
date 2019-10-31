exports.createQuery = function(_query) {
    let query = {};
    let keys = Object.keys(_query);

    for (var key of keys) {
        if(_query[key]) {
            query[key] = _query[key];
        }
    }

    return query;
}

exports.addCodetypeToQuery = function (query, key, value, codetype) {
    return new Promise((resolve, reject) => {
        if (value) {
            return codetype.findOneByDescription(value)
                .then(codetype => { 
                    query[key] = codetype;
                    resolve();
                });
        }else{
            resolve();
        }
    })
}

exports.addCodetypesToQuery = function(query, key1, value, key2, codetype) {
    return new Promise((resolve, reject) => {
        if (value) {
            let promiseArray = [];

            for(var i = 0; i < query.length; i++) {
                promiseArray.push(codetype.findOneByDescription(value[i][key2])
                    .then(codetype => {
                        query[i][key1] = codetype;
                    }).catch(err => {
                        reject(err);
                    })
                )
            }

            Promise.all(promiseArray).then(() => {resolve()})
        }else{
            resolve();
        }
    });
}