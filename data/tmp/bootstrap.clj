(** ## Bootstrap (js) parser + compiler **)

(** Parser consumes (Node)s and produces (stmt /  expr) **)

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

(** foldlArr = (i, v, f) => v.type === 'nil' ? i : foldlArr(f(i, v[0]), v[1], f) **)

(** set = (obj, k, v) => (obj[k] = v, obj) **)

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

(** foldr = (init, items, f) => items.length === 0 ? init : f(foldr(init, items.slice(1), f), items[0]) **)

(** loop = (v, f) => f(v, n => loop(n, f)) **)

(** makePairs = array => {
  const res = [];
  for (let i=0; i<array.length; i+=2) {
    res.push([array[i], array[i + 1]]);
  }
  return res
} **)

(** ## Parser **)

(** parsePrim = node => {
  const v = +node.text
  if (!isNaN(v)) {
    return c.prim(c.int(v, node.loc), node.loc)
  }
  if (node.text === 'true' || node.text === 'false') {
    return c.prim(c.bool(node.text === 'true', node.loc), node.loc)
  }
} **)

(** ## Expressions **)

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
    case 'array': {
      if (!node.values.length) return c.evar('nil', node.loc)
      let last = node.values[node.values.length - 1]
      let res = last.type === 'spread'
        ? parse(last.contents)
        : c.cons(parse(last), c.nil(node.loc), node.loc)
      for (let i=node.values.length - 2; i>=0; i--) {
        res = c.cons(parse(node.values[i]), res)
      }
      return res
    }
  }
  throw new Error(`cant parse ${JSON.stringify(node)}`)
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

(parse 1)

(@ 12)

(parse "hi${1}")

(parse true)

(parse [1 2 3])

(** test = v => valueToString(parse(v)) **)

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
            "(elet (pcon \",\" [(pvar \"a\" 182) (pvar \"b\" 184)] 180) (evar \"c\" 185) (evar \"d\" 186) 175)")
        (,
        (@ (let [[a ..b] c] d))
            "(elet (pcon \"cons\" [(pvar \"a\" 203) (pvar \"b\" 204)] 202) (evar \"c\" 208) (evar \"d\" 209) 196)")])

(** ## Patterns **)

(** p = {
  prim: (v, loc=-1) => ({type: 'pprim', 0: v, 1: loc}),
  bool: (v, loc=-1) => ({type: 'pbool', 0: v, 1: loc}),
  int: (v, loc=-1) => ({type: 'pint', 0: v, 1: loc}),
  any: loc => ({type: 'pany', 0: loc}),
  con: (name, args, loc) => ({type: 'pcon', 0: name, 1: arr(args), 2: loc}),
  cons: (one, two, loc) => p.con('cons', [one, two], loc),
  nil: loc => p.con('nil', [], loc),
} **)

(** parsePat = node => {
  switch (node.type) {
    case 'identifier':
      switch(node.text) {
        case '_': return p.any(node.loc)
        case 'true': case 'false':
          return p.prim(p.bool(node.text === 'true', node.loc), node.loc)
      }
      const v = +node.text
      if (!isNaN(v)) return p.prim(p.int(v, node.loc), node.loc)
      return {type: 'pvar', 0: node.text, 1: node.loc}
    case 'string':
      return {type: 'pstr', 0: node.first.text, 1: node.loc}
    case 'list':
      if (!node.values.length) return p.con('()', [], node.loc)
      if (node.values[0].type !== 'identifier') throw new Error('pat exp must start with identifier')
      return p.con(node.values[0].text, node.values.slice(1).map(parsePat), node.loc)
    case 'array':
      if (!node.values.length) return p.nil(node.loc)
      let last = node.values[node.values.length - 1]
      let res = last.type === 'spread' ? parsePat(last.contents) : p.cons(parsePat(last), p.nil(node.loc), node.loc)
      for (let i=node.values.length - 2; i>=0; i--) {
        res = p.cons(parsePat(node.values[i]), res, node.loc)
      }
      return res
  }
  throw new Error('unknown pat' + JSON.stringify(node))
} **)

(** ## Statements **)

(** parseStmt = (node) => {
  switch (node.type) {
    case 'blank':
    case 'comment':
    case 'comment-node':
    case 'rich-text':
      return;
    case 'list':
      if (node.values.length && node.values[0].type === 'identifier') {
        const f = stmtForms[node.values[0].text];
        if (f) {
          const res = f(node.loc, ...node.values.slice(1))
          if (res) return res
        }
      }
  }
  const inner = parse(node)
  return inner ? {type: 'sexpr', 0: inner, 1: node.loc} : inner
} **)

(** stmtForms = {
  deftype(loc, head, ...tail) {
    if (!head || !tail.length) return
    const name = head.type === 'identifier' ? head.text : head.type === 'list' && head.values.length >= 1 && head.values[0].type === 'identifier' ? head.values[0].text : null
    if (!name) return
    const constructors = tail.map(item => {
      if (item.type !== 'list') throw new Error(`constructor not a list`)
      if (item.values.length < 1) throw new Error(`empty list`)
      return pair(item.values[0].text, item.values.length - 1)
    })
    return {type: 'sdeftype', 0: name, 1: constructors}
  },
  def(loc, name, value) {
    if (!name || !value) return
    if (name.type !== 'identifier') return
    return {type: 'sdef', 0: name.text, 1: parse(value), 2: loc}
  },
  defn(loc, name, args, value) {
    if (!name || !args || !value) return
    if (name.type !== 'identifier' || args.type !== 'array') return
    const body = forms.fn(loc, args, value)
    if (!body) return
    return {type: 'sdef', 0: name.text, 1: body, 2: loc}
  }
} **)

(** testStmt = v => valueToString(parseStmt(v)) **)

(testStmt 1)

(,
    testStmt
        [(, (@ 1) "(sexpr (eprim (pint 1 238) 238) 238)")
        (, (@ (def hi 10)) "(sdef \"hi\" (eprim (pint 10 254) 254) 245)")
        (,
        (@ (defn lol [a b] (+ a b)))
            "(sdef \"lol\" (elambda (pvar \"a\" 268) (elambda (pvar \"b\" 269) (eapp (eapp (evar \"+\" 271) (evar \"a\" 272) 270) (evar \"b\" 273) 270) 261) 261) 261)")])

(** ## Tree-Walking Evaluator **)

(** evaluate = (node, scope) => {
  switch (node.type) {
    case 'eprim':
      return node[0][0]
    case 'evar':
      if (!Object.hasOwn(scope, node[0])) {
        throw new Error(`Unknown vbl: ${node[0]}. ${Object.keys(scope).join(', ')}`)
      }
      return scope[node[0]]
    case 'elambda':
      return v => evaluate(node[1], {...scope, ...evalPat(node[0], v)})
    case 'eapp':
      return evaluate(node[0], scope)(evaluate(node[1], scope))
    case 'elet':
      const init = evaluate(node[1], scope)
      const got = evalPat(node[0], init)
      if (!got) throw new Error(`let pattern didnt match: ${JSON.stringify(init)}`)
      return evaluate(node[2], {...scope, ...got})
    case 'ematch':
      const target = evaluate(node[0], scope)
      for (let {0: pat, 1: body} of unwrapArray(node[1])) {
        const got = evalPat(pat, target)
        if (got) {
          return evaluate(body, {...scope, ...got})
        }
      }
      throw new Error(`match failed (${node[2]}): ${JSON.stringify(target)}`)
  }
  return node.type
} **)

(** evalPat = (node, v) => {
  switch (node.type) {
    case 'pany': return {}
    case 'pprim': return v === node[0][0] ? {} : null
    case 'pvar':
      return {[node[0]]: v}
    case 'pcon':
      if (v.type === node[0]) {
        const args = unwrapArray(node[1])
        const scope = {}
        for (let i=0; i<args.length; i++) {
          const sub = evalPat(args[i], v[i])
          if (!sub) return
          Object.assign(scope, sub)
        }
        return scope
      }
  }
}        **)

(** run = v => evaluate(parse(v), {',': a => b => pair(a,b)}) **)

(run ((fn [x] 1) 10))

(run (, 1 2))

(run (let [(, x 3) (, 212 3)] x))

(run
    (match 3
        2 1
        3 10))

(test (, 1 2))

(run ((fn [(, a _)] a) (, 1 12)))

(test (fn [(, a _)] a))

(parse 1)



