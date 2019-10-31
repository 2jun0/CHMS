key = 0;

function getRandomString(size) {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";

    key = (key + 1) % (chars.length - 1);
    var randomstring = chars.substring(key, key + 1);
    for (var i = 1; i < size; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
}

function getStringsStartsWith(array, search, preFunc) {
    var results = []

    for (var str of array) {
        if (str.startsWith(search)) {
            if (preFunc) { str = preFunc(str); }
            results.push(str);
        }
    }

    return results;
}

// Filtering undefined or null value in object, it can prevent errors
function filterNullInObject(object) {
    let newObject = {};

    let keys = Object.keys(object);

    for (var key of keys) {
        if (object[key] || object[key] == false) {
            newObject[key] = object[key];
        }
    }

    return newObject;
}

function cloneObject(obj) {
    let clone;
    if (typeof (obj) == "object") {
        if (Array.isArray(obj)) {
            clone = [];
            for (var i = 0; i < obj.length; i++) {
                if (typeof (obj[i]) == "object" && obj[i] != null) {
                    clone[i] = cloneObject(obj[i]);
                } else {
                    clone[i] = obj[i];
                }
            }
        } else {
            clone = {};
            for (var i in obj) {
                if (typeof (obj[i]) == "object" && (obj[i] != null && Object.keys(obj[i]) > 0)) {
                    clone[i] = cloneObject(obj[i]);
                } else {
                    clone[i] = obj[i];
                }
            }
        }
    } else {
        clone = obj;
    }
    return clone;
}

function getValueByKey(data, _key) {
    let keys = _key.split('.');
    let value = data;

    for (var key of keys) {
        value = value[key];
    }

    return value;
}

exports.getRandomString = getRandomString;
exports.getStringsStartsWith = getStringsStartsWith;
exports.filterNullInObject = filterNullInObject;
exports.cloneObject = cloneObject;
exports.getValueByKey = getValueByKey;