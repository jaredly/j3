const cons = (a, b) => ({type: 'cons', 0: a, 1: b})

const nil = {type: 'nil'}

const arr = (values) => {
  let v = nil
  for (let i=values.length-1;i>=0;i--) {
    v = cons(values[i], v)
  }
  return v
}

const unwrapArray = value => value.type === 'nil' ? [] : [value[0], ...unwrapArray(value[1])]

const foldlArr = (i, v, f) => v.type === 'nil' ? i : foldlArr(f(i, v[0]), v[1], f)

const set = (obj, k, v) => (obj[k] = v, obj)

const valueToString = (v) => {
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

const parse = node => {
  switch (node.type) {
    case 'identifier': {
      return parsePrim(node) || c.evar(node.text, node.loc)
    }
    case 'string': {
      const exprs = node.templates.map(t => parse(t.expr))
      return {type: 'estr', 0: node.first.text, 1: arr(
        node.templates.map((t, i) => pair(exprs[i], t.suffix.text))
      ), 2: node.loc}
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
    case 'raw-code':
      return {type: 'estr', 0: node.raw, 1: nil, 2: node.loc}
  }
  throw new Error(`cant parse ${JSON.stringify(node)}`)
}

const forms = {
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
}

const test = v => valueToString(parse(v))

const p = {
  prim: (v, loc=-1) => ({type: 'pprim', 0: v, 1: loc}),
  bool: (v, loc=-1) => ({type: 'pbool', 0: v, 1: loc}),
  int: (v, loc=-1) => ({type: 'pint', 0: v, 1: loc}),
  any: loc => ({type: 'pany', 0: loc}),
  con: (name, args, loc) => ({type: 'pcon', 0: name, 1: arr(args), 2: loc}),
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
}

const parseStmt = (node) => {
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
}

const stmtForms = {
  deftype(loc, head, ...tail) {
    if (!head || !tail.length) return
    const name = head.type === 'identifier' ? head.text : head.type === 'list' && head.values.length >= 1 && head.values[0].type === 'identifier' ? head.values[0].text : null
    if (!name) return
    const constructors = tail.map(item => {
      if (item.type !== 'list') throw new Error(`constructor not a list`)
      if (item.values.length < 1) throw new Error(`empty list`)
      return {type: ',,', 0: item.values[0].text, 1: item.values.length - 1, 2: item.values[0].loc}
    })
    return {type: 'sdeftype', 0: name, 1: arr(constructors)}
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
      env[node[0]] = value
      return value
    case 'sdeftype':
      const res = {}
      unwrapArray(node[1]).forEach(({0: name, 1: count}) => {
        res[name] = env[name] = constrFn(name, count)
      })
      return res
  }
}

const constrFn = (name, count) => {
  const next = (left) => {
    if (left === 0) return values => ({type: name, ...values})
    return values => arg => next(left - 1)([...values, arg])
  }
  return next(count)([])
}

const evaluate = (node, scope) => {
  switch (node.type) {
    case 'eprim':
      return node[0][0]
    case 'estr':
      return slash(node[0]) + unwrapArray(node[1]).map(({0: exp, 1: suf}) => evaluate(exp, scope) + slash(suf)).join('')
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
    case 'equot':
      return node[0]
  }
  throw new Error(`cant evaluatoe ${node.type}`)
}

const evalPat = (node, v) => {
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
}

const run = v => {
  const res = evaluate(parse(v), {',': a => b => pair(a,b)})
  if (typeof res === 'number' || typeof res === 'string') return res
  return valueToString(res)
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

const stmts = stmts => {
  if (stmts.type !== 'array') throw new Error('need array')
  const env = {',': a => b => pair(a, b)}
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
    case 'sdef': return [[stmt[0], {type: 'value'}, stmt[2]]]
    case 'sdeftype': return unwrapArray(stmt[1]).map(c => [c[0], {type: 'value'}, c[2]])
  }
}

const externals_expr = (expr, locals) => {
  switch (expr.type) {
    case 'evar': return locals.includes(expr[0]) ? [] : [[expr[0], {type: 'value'}, expr[1]]]
    case 'eapp': return externals_expr(expr[0], locals).concat(externals_expr(expr[1], locals))
    case 'elambda': return externals_expr(expr[1], locals.concat(pat_names(expr[0])))
    case 'eprim': return []
    case 'estr': return unwrapArray(expr[1]).flatMap(v => externals_expr(v[0], locals))
    case 'elet': return externals_expr(expr[1], locals).concat(
      externals_expr(expr[2], locals.concat(pat_names(expr[0]))))
    case 'ematch':
      return externals_expr(expr[0], locals).concat(
        unwrapArray(expr[1]).flatMap(kase => externals_expr(kase[1], locals.concat(pat_names(kase[0])))))
  }
  return []
}

const pat_names = pat => {
  switch (pat.type) {
    case 'pvar': return [pat[0]]
    case 'pany': return []
    case 'pprim': return []
    case 'pcon':
      return unwrapArray(pat[1]).flatMap(pat_names)
  }
  return []
}

const testExt = v => valueToString(externals(parseStmt(v)))

const testNames = v => valueToString(names(parseStmt(v)))

const compile_ = node => {
  switch (node.type) {
    case 'eprim': return '' + node[0][0]
    case 'estr': return `\`${unslash(node[0])}${unwrapArray(node[1]).map(
      ({0: expr, 1: suf}) => `\${${compile(expr)}}${unslash(suf)}\``
    ).join('\n')}`
    case 'evar': return sanitize(node[0])
    case 'elambda':
      return `(${patArgs(node[0])}) => ${compile(node[1])}`
    case 'eapp':
      return `(${compile(node[0])})(${compile(node[1])})`
    case 'elet':
      return `((${patArgs(node[0])}) => ${compile(node[2])})(${compile(node[1])})`
    case 'ematch':
      return `(($target) => {${unwrapArray(node[1]).map(({0: pat, 1: body}) => compilePat(pat, '$target', 'return ' + compile(body))).join('\n')})(${compile(node[0])})`
  }
}

const compilePat_ = (node, target, body) => {
  switch (node.type) {
    case 'pany':
      return body
    case 'pvar':
      return `{const ${sanitize(node[0])} = ${target};\n${body}}`
    case 'pprim':
      return `if (${target} === ${node[0][0]}) {${body}}`
    case 'pcon':
      const args = unwrapArray(node[1])
  }
}

const compile = ast => _meta => `$env.evaluate(${JSON.stringify(ast)}, $env)`

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

const sanitize = (raw) => {
    for (let [key, val] of Object.entries(sanMap)) {
        raw = raw.replaceAll(key, val);
    }
    kwdRx.forEach(([rx, res]) => {
        raw = raw.replaceAll(rx, res);
    });
    return raw;
  }

const compile_stmt = ast => _meta => `${ast.type === 'sdef' ? `const ${sanitize(ast[0])} = ` : ast.type === 'sdeftype' ? `const {${
  unwrapArray(ast[1]).map(c => `"${c[0]}": ${sanitize(c[0])}`)
}} = ` : ''}$env.evaluateStmt(${JSON.stringify(ast)}, $env)`

const makePrelude = obj => Object.entries(obj).reduce((obj, [k, v]) => (obj[k] = typeof v === 'function' ? '' + v : typeof v === 'string' ? v : JSON.stringify(v), obj), {})

const prelude = makePrelude({evaluate,evaluateStmt,unwrapArray,constrFn,sanitize,sanMap,evalPat,kwdRx: kwdString,slash, 'eval': v => new Function('return ' + v)()})

const testCompileStmt = v => compile_stmt(parseStmt(v))()

return ({type: 'fns', prelude,
  compile, compile_stmt,
  parse_stmt: parseStmt, parse_expr: parse,
  names: s => arr(names(s)),
  externals_stmt: s => arr(externals(s)),
  externals_expr: e => arr(externals_expr(e, [])),
  fromNode: x => x,
  toNode: x => x})