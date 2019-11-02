export interface Option {
    key: any,
    value: any
}

export function parseJsonToOptions(json): Array<Option> {
    let options = Array<Option>();
    for(var key in json) {
      options.push({key:key, value:json[key]});
    }
    
    return options;
}