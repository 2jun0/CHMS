export interface Option {
    value: any,
    str: any
}

export function parseJsonToOptions(json): Array<Option> {
    let options = Array<Option>();
    for(var key in json) {
      options.push({value:key, str:json[key]});
    }
    
    return options;
}