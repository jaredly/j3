(** ## Bootstrap (js) parser + compiler **)

(** Parser consumes (Node)s and produces (stmt /  expr) **)

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

(** pair = (a, b) => ({type: ',', 0: a, 1: b}) **)

(** c = {
  prim: (prim, loc=-1) => ({type: 'eprim', 0: prim, 1: loc}),
  int: (v, loc=-1) => ({type: 'pint', 0: v, 1: loc}),
  bool: (v, loc=-1) => ({type: 'pbool', 0: v, 1: loc}),
  evar: (text, loc=-1) => ({type: 'evar', 0: text, 1: loc}),
  app: (target, arg, loc=-1) => ({type: 'eapp', 0: target, 1: arg, 2: loc}),
  nil: l => c.evar('nil', l),
  cons: (a, b, l) => c.app(c.app(c.evar('cons', l), a, l), b, l),
  list: (values, l) => {
    let v = c.nil(l)
    for (let i=values.length-1;i>=0;i--) {
      v = c.cons(values[i], v, l)
    }
    return v
  },
  
} **)

(** parsePrim = node => {
  const v = +node.text
  if (!isNaN(v)) {
    return c.prim(c.int(v, node.loc), node.loc)
  }
  if (node.text === 'true' || node.text === 'false') {
    return c.prim(c.bool(node.text === 'true', node.loc), node.loc)
  }
} **)

(** parse = node => {
  switch (node.type) {
    case 'identifier': {
      return parsePrim(node) || c.evar(node.text, node.loc)
    }
    case 'array': {
      return c.list(node.values.map(parse), node.loc)
    }
    case 'string': {
      const exprs = node.templates.map(t => parse(t.expr))
      return {type: 'estr', 0: node.first.text, 1: arr(
        node.templates.map((t, i) => pair(exprs[i], t.suffix.text))
      )}
    }
    case 'list': {
      if (!node.values.length) return c.evar('()', node.loc)
      if (node.values[0].type === 'identifier') {
        const first = node.values[0].text;
        if (forms[first]) {
          const res = forms[first](node.loc, ...node.values.slice(1))
          if (res) return res
        }
      }
      const values = node.values.map(parse)
      let res = values[0]
      for (let i=1; i<values.length; i++) {
        res = c.app(res, values[i], node.loc)
      }
      return res
    }
  }
  return 'lol' + node.type
} **)

(** forms = {
  fn: (loc, args, body) => {
    if (!args || !body) return
    if (args.type !== 'array') return
    const pats = args.values.map(parsePat)
    return foldr(parse(body), pats, (body, arg) => ({type: 'elambda', 0: arg, 1: body, 2: loc}))
  },
  let: (loc, bindings, body) => {
    if (!bindings || !body) return
    if (bindings.type !== 'array') return
    const pairs = makePairs(bindings.values)
    return foldr(parse(body), pairs, (body, [pat, init]) => {
      return {type: 'elet', 0: parsePat(pat), 1: parse(init), 2: body, 3: loc}
    })
  },
  match: (loc, target, ...rest) => {
    if (!target || !rest.length) return
    const cases = makePairs(rest)
    return {type: 'ematch', 0: parse(target), 1: arr(cases.map(([pat, body]) => pair(parsePat(pat), parse(body)))), 2: loc}
  },
  '@': (loc, inner) => ({type: 'equot', 0: parse(inner), 1: loc}),
  '@@': (loc, inner) => ({type: 'equot', 0: inner, 1: loc}),
  '@!': (loc, inner) => ({type: 'equot', 0: parseStmt(inner), 1: loc}),
  'if': (loc, cond, yes, no) => ({type: 'ematch', 0: parse(cond), 1: arr([pair(
    {type: 'pprim', 0: {type: 'pbool', 0: true, 1: loc}, 1: loc},
    parse(yes)
    ), pair(
      {type: 'pany', 0: loc},
      parse(no)
    )
  ])}),
} **)

(** makePairs = array => {
  const res = [];
  for (let i=0; i<array.length; i+=2) {
    res.push([array[i], array[i + 1]]);
  }
  return res
} **)

(** parsePat = node => {
  switch (node.type) {
    case 'identifier':
      switch(node.text) {
        case '_': return {type: 'pany', 0: node.loc}
        case 'true': case 'false':
          return {type: 'pprim', 0: {type: 'pbool', 0: node.text === 'true', 1: node.loc}, 1: node.loc}
      }
      const v = +node.text
      if (!isNaN(v)) return {type: 'pprim', 0: {type: 'pint', 0: v, 1: node.loc}, 1: node.loc}
      return {type: 'pvar', 0: node.text, 1: node.loc}
    case 'string':
      return {type: 'pstr', 0: node.first.text, 1: node.loc}
    case 'list':
      if (!node.values.length) return {type: 'pcon', 0: '()', 1: nil}
      if (node.values[0].type !== 'identifier') throw new Error('pat exp must start with identifier')
      return {type: 'pcon', 0: node.values[0].text, 1: arr(node.values.slice(1).map(parsePat))}
  }
} **)

(** foldr = (init, items, f) => items.length === 0 ? init : f(foldr(init, items.slice(1), f), items[0]) **)

(** loop = (v, f) => f(v, n => loop(n, f)) **)

(** test = v => valueToString(parse(v)) **)

(parse 1)

(@ 12)

(,
    test
        [(, (@ 1) "(eprim (pint 1 89) 89)")
        (, [] "(evar \"nil\" 118)")
        (,
        (@ (fn [a] 1))
            "(elambda (pvar \"a\" 136) (eprim (pint 1 133) 133) 129)")
        (,
        (@
            (match x
                1    2
                "hi" 1))
            "(ematch (evar \"x\" 161) [(, (pprim (pint 1 162) 162) (eprim (pint 2 163) 163)) (, (pstr \"hi\" 164) (eprim (pint 1 166) 166))] 157)")
        (,
        (@ (let [(, a b) c] d))
            "(elet (pcon \",\" [(pvar \"a\" 182) (pvar \"b\" 184)]) (evar \"c\" 185) (evar \"d\" 186) 175)")])

(parse "hi${1}")

(parse true)

(parse [1 2 3])

[1 2 3]





