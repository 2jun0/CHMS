const NONE_VALUE = '';

// {
//      'key' : value',
//      $or : [
//          {'key' : value},
//          {'key' : value}
//      ]
// }
exports.createFilter = function (_filter) {
  let filter = {};
  let keys = Object.keys(_filter)
  for (var key of keys) {
    var value = _filter[key];
    if (!value) { continue; }

    if (key === '$or' || key === '$and') {
      let orValue = [];
      for (var i = 0; i < value.length; i++) {
        var childFilter = exports.createFilter(value[i]);
        if (childFilter && Object.keys(childFilter).length > 0) {
          orValue.push(childFilter);
        }
      }
      if (orValue.length > 0) { filter[key] = orValue; }
      continue;
    }

    if (value instanceof Array) {
      if (value.length === 0) {
        // 아무것도 선택안했으니까 아무결과도 안나오도록 설정
        filter[key] = NONE_VALUE;
      } else {
        // 문자열은 자동으로 regex 넣어줌
        if (value[0] instanceof String || typeof value === 'string') {
          for (var i = 0; i < value.length; i++) {
            value[i] = { '$regex': value[i].trim() };
          }
        }

        filter[key] = { $in: value };
      }
    } else {
      if (value instanceof String || typeof value === 'string') {
        value = { '$regex': value.trim() };
      }

      filter[key] = value;
    }
  }

  return filter;
}

exports.addCodetypeToFilter = function (filter, key, value, codetype) {
  return new Promise((resolve, reject) => {
    if (value) {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          filter[key] = '';
          resolve();
        } else {
          return codetype.findManyByDescriptions(value)
            .then(codetypes => {
              filter[key] = { $in: codetypes };
              resolve();
            });
        }
      } else {
        return codetype.findOneByDescription(value)
          .then(codetype => {
            filter[key] = codetype;
            resolve();
          });
      }
    }
  })
}