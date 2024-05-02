(** ## JCST
    Converting the concrete syntax tree into s-expr-y values to work with our languages that don't have records. **)

(** ## Prelude
    Some basic handy functions **)

(** cons = (a, b) => ({type: 'cons', 0: a, 1: b}) **)

(** nil = {type: 'nil'} **)

(** arr = (values) => {
  let v = nil
  for (let i=values.length-1;i>=0;i--) {
    v = cons(values[i], v)
  }
  return v
} **)

(** unwrapArray = value => value.type === 'nil' ? [] : [value[0], ...unwrapArray(value[1])] **)

(** unwrapArray(arr([1,2,3])) **)

(** pair = (a, b) => ({type: ',', 0: a, 1: b}) **)

(** makePairs = array => {
  const res = [];
  for (let i=0; i<array.length; i+=2) {
    res.push([array[i], array[i + 1]]);
  }
  return res
} **)

(** fromNode = node => {
  switch (node.type) {
    case 'comment':
    case 'comment-node':
    case 'rich-text':
      return
    case 'identifier':
      return {type: 'cst/identifier', 0: node.text, 1: node.loc}
    case 'spread':
      const inner = fromNode(node.contents)
      return inner
      ? {type: 'cst/spread', 0: inner, 1: node.loc}
      : {type: 'cst/empty-spread', 0: node.loc}
    case 'array':
    case 'record':
    case 'list':
      return {type: 'cst/' + node.type, 0: arr(node.values.map(fromNode).filter(Boolean)), 1: node.loc}
    case 'string':
      return {type: 'cst/string', 0: node.first.text, 1: arr(
        node.templates.map(item => ({
          type: ',,',
          0: fromNode(item.expr) ?? {type: 'cst/string', 0: '', 1: nil},
          1: item.suffix.text,
          2: item.suffix.loc,
        }))
      ), 2: node.loc}
  }
} **)

(** test = v => valueToString(fromNode(v)) **)

(,
    test
        [(, (@ 10) "(cst/identifier \"10\" 55)")
        (,
        (@ [1 ; ya 2 ])
            "(cst/array [(cst/identifier \"1\" 69) (cst/identifier \"2\" 71)] 68)")
        (,
        (@ "hi ${1} 12")
            "(cst/string \"hi \" [(,, (cst/identifier \"1\" 81) \" 12\" 82)] 79)")
        (,
        {hi 10}
            "(cst/record [(cst/identifier \"hi\" 92) (cst/identifier \"10\" 93)] 88)")])

(** toNode = jcst => {
  switch (jcst.type) {
    case 'cst/identifier':
      return {type: 'identifier', text: node[0], loc: node[1]}
    case 'cst/spread':
      return {type: 'spread', contents: toNode(node[0]), loc: node[1]}
    case 'cst/empty-spread':
      return {type: 'spread', contents: {type: 'blank', loc: node[0]}, loc: node[0]}
    case 'cst/array':
    case 'cst/list':
    case 'cst/record':
      return {type: jcst.type.slice(4), values: unwrapArray(node[0]).map(toNode), loc: node[1]}
    case 'cst/string':
      return {type: 'string', first: {type: 'stringText', text: node[0], loc: node[2]},
        templates: unwrapArray(node[1]).map(({0: expr, 1: text, 2: loc}) => ({
          expr: toNode(expr),
          suffix: {text, loc},
          loc,
        })),
        loc: node[2]
      }
  }
} **)

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

(** ({fromNode, toNode}) **)