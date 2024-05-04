const list = (values) => {
  let v = nil
  for (let i=values.length-1;i>=0;i--) {
    v = cons(values[i], v)
  }
  return v
}

const cons = (a, b) => ({type: 'cons', 0: a, 1: b})

const nil = {type: 'nil'}

const unwrapList = value => value.type === 'nil' ? [] : [value[0], ...unwrapList(value[1])]

const set = (obj, k, v) => (obj[k] = v, obj)

const valueToString = (v) => {
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

    return '' + v;
};

const pair = (a, b) => ({type: ',', 0: a, 1: b})

const foldr = (init, items, f) => items.length === 0 ? init : f(foldr(init, items.slice(1), f), items[0])

const loop = (v, f) => f(v, n => loop(n, f))

const makePairs = array => {
  const res = [];
  for (let i=0; i<array.length; i+=2) {
    res.push([array[i], array[i + 1]]);
  }
  return res
}

const parsePrim = node => {
  const v = +node.text
  if (!isNaN(v)) {
    return c.prim(c.int(v, node.loc), node.loc)
  }
  if (node.text === 'true' || node.text === 'false') {
    return c.prim(c.bool(node.text === 'true', node.loc), node.loc)
  }
}

const parseType = node => {
  if (node.type === 'identifier') {
    return {type: 'tcon', 0: node.text, 1: node.loc}
  }
  if (node.type === 'list') {
    const values = filterBlanks(node.values)
    if (!values.length) return {type: 'tcon', 0: '()', 1: node.loc}
    if (values.length === 3 && values[0].type === 'identifier' && values[1].type === 'array') {
      return {type: 'tcon', 0: 'a function', 1: node.loc}
    }
    let res = parseType(values[0])
    for (let i=1;i<values.length; i++) {
      res = {type: 'tapp', 0: res, 1: parseType(values[i]), 2: node.loc}
    }
    return res
  }
  throw new Error(`cant parse type ${node.type}`)
}

const filterBlanks = values => values.filter(n => !['blank', 'comment', 'rich-text', 'comment-node'].includes(n.type))

const parse = node => {
  switch (node.type) {
    case 'identifier': {
      return parsePrim(node) || c.evar(node.text, node.loc)
    }
    case 'string': {
      const exprs = node.templates.map(t => parse(t.expr))
      return {type: 'estr', 0: node.first.text, 1: list(
        node.templates.map((t, i) => pair(exprs[i], t.suffix.text))
      ), 2: node.loc}
    }
    case 'list': {
      const values = filterBlanks(node.values)
      if (!values.length) return c.evar('()', node.loc)
      if (values[0].type === 'identifier') {
        const first = values[0].text;
        if (forms[first]) {
          const res = forms[first](node.loc, ...values.slice(1))
          if (res) return res
        }
      }
      const parsed = values.map(parse)
      let res = parsed[0]
      for (let i=1; i<parsed.length; i++) {
        res = c.app(res, parsed[i], node.loc)
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
    case 'raw-code':
      return {type: 'estr', 0: node.raw, 1: nil, 2: node.loc}
  }
  throw new Error(`cant parse ${JSON.stringify(node)}`)
}

const forms = {
  fn: (loc, args, body) => {
    if (!args || !body) return
    if (args.type !== 'array') return
    const pats = filterBlanks(args.values).map(parsePat)
    return foldr(parse(body), pats, (body, arg) =>
      arg.type === 'pvar' ?
    ({type: 'elambda', 0: arg[0], 1: body, 2: loc}) : {
      type: 'elambda', 0: '$arg', 1: {type: 'ematch', 0: {type: 'evar', 0: '$arg', 1: loc}, 1: list([pair(arg, body)]), 2: loc}}
    )
  },
  let: (loc, bindings, body) => {
    if (!bindings || !body) return
    if (bindings.type !== 'array') return
    const pairs = makePairs(filterBlanks(bindings.values))
    return foldr(parse(body), pairs, (body, [pat, init]) => {
      if (pat.type === 'identifier') {
        return {type: 'elet', 0: pat.text, 1: parse(init), 2: body, 3: loc}
      }
      return {type: 'ematch', 0: parse(init), 1: list([pair(parsePat(pat), body)]), 2: loc}
    })
  },
  match: (loc, target, ...rest) => {
    if (!target || !rest.length) return
    const cases = makePairs(rest)
    return {type: 'ematch', 0: parse(target), 1: list(cases.map(([pat, body]) => pair(parsePat(pat), parse(body)))), 2: loc}
  },
  '@': (loc, inner) => ({type: 'equot', 0: parse(inner), 1: loc}),
  '@@': (loc, inner) => ({type: 'equot', 0: fromNode(inner), 1: loc}),
  '@!': (loc, inner) => ({type: 'equot', 0: parseStmt(inner), 1: loc}),
  'if': (loc, cond, yes, no) => ({type: 'ematch', 0: parse(cond), 1: arr([pair(
    {type: 'pprim', 0: {type: 'pbool', 0: true, 1: loc}, 1: loc},
    parse(yes)
    ), pair(
      {type: 'pany', 0: loc},
      parse(no)
    )
  ])}),
}

const c = {
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
  
}

const fromNode = node => {
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
      return {type: 'cst/' + node.type, 0: list(node.values.map(fromNode).filter(Boolean)), 1: node.loc}
    case 'string':
      return {type: 'cst/string', 0: node.first.text, 1: list(
        node.templates.map(item => ({
          type: ',,',
          0: fromNode(item.expr) ?? {type: 'cst/string', 0: '', 1: nil},
          1: item.suffix.text,
          2: item.suffix.loc,
        }))
      ), 2: node.loc}
  }
}

const test = v => valueToString(parse(v))

const p = {
  prim: (v, loc=-1) => ({type: 'pprim', 0: v, 1: loc}),
  bool: (v, loc=-1) => ({type: 'pbool', 0: v, 1: loc}),
  int: (v, loc=-1) => ({type: 'pint', 0: v, 1: loc}),
  any: loc => ({type: 'pany', 0: loc}),
  con: (name, args, loc) => ({type: 'pcon', 0: name, 1: list(args), 2: loc}),
  cons: (one, two, loc) => p.con('cons', [one, two], loc),
  nil: loc => p.con('nil', [], loc),
}

const parsePat = node => {
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
    case 'list': {
      const values = filterBlanks(node.values)
      if (!values.length) return p.con('()', [], node.loc)
      if (values[0].type !== 'identifier') throw new Error('pat exp must start with identifier')
      return p.con(values[0].text, values.slice(1).map(parsePat), node.loc)
    }
    case 'array':
      const values = filterBlanks(node.values)
      if (!values.length) return p.nil(node.loc)
      let last = values[values.length - 1]
      let res = last.type === 'spread' ? parsePat(last.contents) : p.cons(parsePat(last), p.nil(node.loc), node.loc)
      for (let i=values.length - 2; i>=0; i--) {
        res = p.cons(parsePat(values[i]), res, node.loc)
      }
      return res
  }
  throw new Error('unknown pat' + JSON.stringify(node))
}

const parseStmt = (node) => {
  switch (node.type) {
    case 'blank':
    case 'comment':
    case 'comment-node':
    case 'rich-text':
      return;
    case 'list':
      const values = filterBlanks(node.values)
      if (values.length && values[0].type === 'identifier') {
        const f = stmtForms[values[0].text];
        if (f) {
          const res = f(node.loc, ...values.slice(1))
          if (res) return res
        }
      }
  }
  const inner = parse(node)
  return inner ? {type: 'sexpr', 0: inner, 1: node.loc} : inner
}

const stmtForms = {
  deftype(loc, head, ...tail) {
    if (!head || !tail.length) return
    const name = head.type === 'identifier' ? head.text : head.type === 'list' && head.values.length >= 1 && head.values[0].type === 'identifier' ? head.values[0].text : null
    if (!name) return
    const constructors = tail.map(item => {
      if (item.type !== 'list') throw new Error(`constructor not a list`)
      const values = filterBlanks(item.values)
      if (values.length < 1) throw new Error(`empty list`)
      return {type: ',,', 0: values[0].text, 1: list(values.slice(1).map(parseType)), 2: values[0].loc}
    })
    return {type: 'sdeftype', 0: name, 1: list(constructors)}
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
}

const testStmt = v => valueToString(parseStmt(v))

const evaluateStmt = (node, env) => {
  switch (node.type) {
    case 'sexpr': return evaluate(node[0], env)
    case 'sdef':
      const value = evaluate(node[1], env)
      env[sanitize(node[0])] = value
      return value
    case 'sdeftype':
      const res = {}
      unwrapList(node[1]).forEach(({0: name, 1: args}) => {
        res[sanitize(name)] = env[sanitize(name)] = constrFn(name, args)
      })
      return res
  }
}

const constrFn = (name, args) => {
  const next = (args) => {
    if (args.type === 'nil') return values => ({type: name, ...values})
    return values => arg => next(args[1])([...values, arg])
  }
  return next(args)([])
}

const evaluate = (node, scope) => {
  switch (node.type) {
    case 'eprim':
      return node[0][0]
    case 'estr':
      return slash(node[0]) + unwrapList(node[1]).map(({0: exp, 1: suf}) => evaluate(exp, scope) + slash(suf)).join('')
    case 'evar':
      var name = sanitize(node[0])
      if (!Object.hasOwn(scope, name)) {
        throw new Error(`Unknown vbl: ${name}. ${Object.keys(scope).join(', ')}`)
      }
      return scope[name]
    case 'elambda':
      return v => evaluate(node[1], {...scope, [sanitize(node[0])]: v})
    case 'eapp':
      return evaluate(node[0], scope)(evaluate(node[1], scope))
    case 'elet':
      const init = evaluate(node[1], scope)
      return evaluate(node[2], {...scope, [sanitize(node[0])]: init})
    case 'ematch':
      const target = evaluate(node[0], scope)
      for (let {0: pat, 1: body} of unwrapList(node[1])) {
        const got = evalPat(pat, target)
        if (got) {
          return evaluate(body, {...scope, ...got})
        }
      }
      throw new Error(`match failed (${node[2]}): ${JSON.stringify(target)}`)
    case 'equot':
      return node[0]
  }
  throw new Error(`cant evaluatoe ${node.type}`)
}

const evalPat = (node, v) => {
  switch (node.type) {
    case 'pany': return {}
    case 'pprim': return v === node[0][0] ? {} : null
    case 'pstr': return v === node[0]
    case 'pvar':
      return {[sanitize(node[0])]: v}
    case 'pcon':
      if (v.type === node[0]) {
        const args = unwrapList(node[1])
        const scope = {}
        for (let i=0; i<args.length; i++) {
          const sub = evalPat(args[i], v[i])
          if (!sub) return
          Object.assign(scope, sub)
        }
        return scope
      }
  }
}

const slash = (n) =>
    n.replaceAll(/\\./g, (m) => {
        if (m[1] === 'n') {
            return '\n';
        }
        if (m[1] === 't') {
            return '\t';
        }
        if (m[1] === 'r') {
            return '\r';
        }
        return m[1];
    })

const run = v => {
  const res = evaluate(parse(v), {'$co': a => b => pair(a,b)})
  if (typeof res === 'number' || typeof res === 'string') return res
  return valueToString(res)
}

const evalStmts = stmts => {
  if (stmts.type !== 'array') throw new Error('need array')
  const env = {'$co': a => b => pair(a, b)}
  let res
  stmts.values.forEach(stmt => {
    res = evaluateStmt(parseStmt(stmt), env)
  });
  return valueToString(res)
}

const externals = stmt => {
  switch (stmt.type) {
    case 'sexpr': return externals_expr(stmt[0], [])
    case 'sdef': return externals_expr(stmt[1], [stmt[0]])
    case 'sdeftype': return []
  }
  return []
}

const names = stmt => {
  switch (stmt.type) {
    case 'sexpr': return []
    case 'sdef': return [{name: stmt[0], kind: 'value', loc: stmt[2]}]
    case 'sdeftype': return unwrapList(stmt[1]).map(c => ({name: c[0], kind: 'value', loc: c[2]}))
  }
}

const externals_expr = (expr, locals) => {
  switch (expr.type) {
    case 'evar': return locals.includes(expr[0]) ? [] : [{name: expr[0], kind: 'value', loc: expr[1]}]
    case 'eapp': return externals_expr(expr[0], locals).concat(externals_expr(expr[1], locals))
    case 'elambda': return externals_expr(expr[1], locals.concat(expr[0]))
    case 'eprim': return []
    case 'estr': return unwrapList(expr[1]).flatMap(v => externals_expr(v[0], locals))
    case 'elet': return externals_expr(expr[1], locals).concat(
      externals_expr(expr[2], locals.concat(expr[0])))
    case 'ematch':
      return externals_expr(expr[0], locals).concat(
        unwrapList(expr[1]).flatMap(kase => externals_expr(kase[1], locals.concat(pat_names(kase[0])))))
  }
  return []
}

const pat_names = pat => {
  switch (pat.type) {
    case 'pvar': return [pat[0]]
    case 'pany': return []
    case 'pprim': return []
    case 'pcon':
      return unwrapList(pat[1]).flatMap(pat_names)
  }
  return []
}

const testExt = v =>(externals(parseStmt(v)))

const testNames = v => names(parseStmt(v))

const makePrelude = obj => Object.entries(obj).reduce((obj, [k, v]) => (obj[k] = typeof v === 'function' ? '' + v : typeof v === 'string' ? v : JSON.stringify(v), obj), {})

const compile = ast => _meta => `$env.evaluate(${JSON.stringify(ast)}, $env)`

const compile_stmt = ast => _meta => `${ast.type === 'sdef' ? `const ${sanitize(ast[0])} = ` : ast.type === 'sdeftype' ? `const {${
  unwrapList(ast[1]).map(c => `"${c[0]}": ${sanitize(c[0])}`)
}} = ` : ''}$env.evaluateStmt(${JSON.stringify(ast)}, $env)`

const testCompileStmt = v => compile_stmt(parseStmt(v))()

const sanitize = (raw) => {
    for (let [key, val] of Object.entries(sanMap)) {
        raw = raw.replaceAll(key, val);
    }
    kwdRx.forEach(([rx, res]) => {
        raw = raw.replaceAll(rx, res);
    });
    return raw;
  }

const sanMap = {
    '-': '_',
    '+': '$pl',
    '*': '$ti',
    '=': '$eq',
    '>': '$gt',
    '<': '$lt',
    "'": '$qu',
    '"': '$dq',
    ',': '$co',
    '/': '$sl',
    ';': '$semi',
    '@': '$at',
    '!': '$ex',
    '|': '$bar',
    '()': '$unit',
    '?': '$qe',
    $: '$$',
  };

const kwdRx = (() => {
  const kwds =
    'case new var const let if else return super break while for default';
  const rx = [];
  kwds.split(' ').forEach((kwd) =>
    rx.push([new RegExp(`^${kwd}$`, 'g'), '$' + kwd]),
  );
  return rx;
  })();

const kwdString = '[' + kwdRx.map(([r, v]) => `[${r}, "${v}"]`).join(', ') + ']'

const prelude = makePrelude({evaluate,evaluateStmt,unwrapList,constrFn,sanitize,sanMap,evalPat,kwdRx: kwdString,slash})

return ({type: 'fns', prelude,
  compile, compile_stmt,
  parse_stmt: parseStmt, parse_expr: parse,
  names,
  externals_stmt: externals,
  externals_expr: e => externals_expr(e, []),
  fromNode: x => x,
  toNode: x => x})