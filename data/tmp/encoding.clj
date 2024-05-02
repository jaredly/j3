(** ## A Runtime Encoding
    that's very "simple".
    Values are:
    - primitives (string, int, bool)
    - variants, of the form {type: "name", 0: arg1, 1: arg2, ...}
    - functions, which don't (currently) support serialization
    - ...and that's it! lists are made of cons & nil **)

(** valueToNode = (v) => {
  if (typeof v === 'object' && v && 'type' in v) {
    if (v.type === 'cons' || v.type === 'nil') {
      const un = unwrapArray(v)
      return {type: 'array', values: un.map(valueToNode), loc: -1}
    }
    let args = [];
    for (let i=0; i in v; i++) {
      args.push(v[i]);
    }
    return {type: 'list', values: [{type: 'identifier', text: v.type, loc: -1}, ...args.map(valueToNode)], loc: -1}
  }
  if (typeof v === 'string') {
    return {type: 'string', first: {type: 'stringText', text: v, loc: -1}, templates: [], loc: -1}
  }
  if (typeof v === 'number' || typeof v === 'boolean') {
    return {type: 'identifier', text: v + '', loc: -1}
  }
  return null 
}
 **)

(** valueToString = (v) => {
    if (Array.isArray(v)) {
        return `[${v.map(valueToString).join(', ')}]`;
    }

    if (typeof v === 'object' && v && 'type' in v) {
        if (v.type === 'cons' || v.type === 'nil') {
            const un = unwrapArray(v);
            return '[' + un.map(valueToString).join(' ') + ']';
        }

        let args = [];
        for (let i = 0; i in v; i++) {
            args.push(v[i]);
        }
        return `(${v.type}${args
            .map((arg) => ' ' + valueToString(arg))
            .join('')})`;
    }
    if (typeof v === 'string') {
        if (v.includes('"') && !v.includes("'")) {
            return (
                "'" + JSON.stringify(v).slice(1, -1).replace(/\\"/g, '"') + "'"
            );
        }
        return JSON.stringify(v);
    }
    if (typeof v === 'function') {
        return '<function>';
    }

    return '' + v;
};
 **)

(** unwrapArray = value => value.type === 'nil' ? [] : [value[0], ...unwrapArray(value[1])] **)

(** ({valueToString, valueToNode}) **)