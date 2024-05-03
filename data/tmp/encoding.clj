(** ## A Runtime Encoding
    for our simple language **)

(** One thing we need to decide at the start is: "what kinds of runtime values will the language have?"
    The simplest useful language I can think of would be a calculator language that only has 1 kind of runtime value: the floating-point number. Expressions would be something like expr = number | (expr op expr) where op is one of + - / *.
    Now, for our language to actually be able to self-host & be nice to use, we'll need the following kinds of runtime values:
    - primitives (string, integer, boolean)
    - functions (we'll got with auto-currying for now)
    - algebraic data types (enums from Rust or Swift, or TypeScript's tagged unions). To keep things simple though, we'll omit labels from the arguments.
    And that's all we need! Notably we won't have arrays (but we will have linked lists w/ cons and nil), or objects, or even floats for now.
    
    We'll define a couple of utility functions that the structured editor will make use of: valueToNode and valueToString. This will allow the editor to display & manipulate the values that result from running code written in our language. **)

(** /*
// Here's the type of `Node`
type Node =
| {type: 'identifier', text: string, loc: number}
| {type: 'list', values: Node[], loc: number}
| {type: 'array', values: Node[], loc: number}
} {type: 'string', first: {type: 'stringText', text: string, loc: number},
    templates: {expr: Node, suffix: {type: 'stringText', text: string, loc: number}},
    loc: number}
*/ **)

(** valueToNode = (v) => {
  if (typeof v === 'object' && v && 'type' in v) {
    if (v.type === 'cons' || v.type === 'nil') {
      const un = unwrapList(v)
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
            const un = unwrapList(v);
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
    if (typeof v === 'number' || typeof v === 'boolean') {
      return '' + v;
    }

    if (v == null) {
      return `Unexpected ${v}`
    }
    return 'Unexpected value: ' + JSON.stringify(v);
};
 **)

(** unwrapList = value => value.type === 'nil' ? [] : [value[0], ...unwrapList(value[1])] **)

(** ({valueToString, valueToNode}) **)