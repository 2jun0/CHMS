export interface Option {
    key: any,
    value: any
}

export function parseJsonToOptions(json, 
  getKey=(json, key) => {return key;},
  getValue=(json, key) => {return json[key]}): Array<Option> {
    let options = Array<Option>();
    for(var key in json) {
      options.push({key:getKey(json, key), value:getValue(json, key)});
    }
    
    return options;
}