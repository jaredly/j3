const pair = (a, b) => ({type: ',', 0: a, 1: b})

// turn a javascript array into a linked list with `cons` and `nil`.
const list = (values) => {
  let v = nil
  for (let i = values.length - 1; i >= 0; i--) {
    v = cons(values[i], v)
  }
  return v
}
const cons = (a, b) => ({type: 'cons', 0: a, 1: b})
const nil = {type: 'nil'}
// unwrap a list into a javascript array
const unwrapList = (value) => {
  return value.type === 'nil' ? [] : [value[0], ...unwrapList(value[1])]
}


// This will be useful for the `let` and `match` forms, where we expect a list of pairs of nodes.
const makePairs = array => {
  const res = [];
  for (let i = 0; i < array.length - 1; i += 2) {
    res.push([array[i], array[i + 1]]);
  }
  return res
}

// turn a runtime value into a nice-to-read string. Roughly corresponds to `show` from Haskell
// or `repr` from python
const valueToString = (v) => {
    if (typeof v === 'object' && v && 'type' in v) {
        if (v.type === 'cons' || v.type === 'nil') {
            const un = unwrapList(v);
            return '[' + un.map(valueToString).join(' ') + ']';
        }
        if (v.type === ',') {
            const items = unwrapTuple(v);
            return `(, ${items.map(valueToString).join(' ')})`
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
const unwrapTuple = (v) => [v[0], ...(v[1].type === ',' ? unwrapTuple(v[1]) : [v[1]])]

// These are the CST nodes that we want to ignore while parsing.
const isBlank = n => ['blank', 'comment', 'rich-text', 'comment-node'].includes(n.type)
const filterBlanks = values => values.filter(node => !isBlank(node))

const parse = node => {
  switch (node.type) {
    case 'identifier': {
      return parsePrim(node) || c.evar(node.text, node.loc)
    }
    case 'string': {
      const exprs = node.templates.map(t => parse(t.expr))
      return {
        type: 'estr',
        0: node.first.text,
        1: list(node.templates.map((t, i) => 
          pair(exprs[i], pair(t.suffix.text, t.suffix.loc)))),
        2: node.loc
      }
    }
    case 'list': {
      const values = filterBlanks(node.values)
      // empty list gets parsed as a `()` unit value.
      if (!values.length) return c.evar('()', node.loc)
      if (values[0].type === 'identifier') {
        const first = values[0].text;
        // If we're in a list w/ the first item being an identifier, see if
        // we're in a 'special form' (defined below)
        if (forms[first]) {
          const res = forms[first](node.loc, ...values.slice(1))
          if (res) return res
        }
      }
      // Otherwise do function application.
      const parsed = values.map(parse)
      return c.app(parsed[0], list(parsed.slice(1)), node.loc)
    }
    case 'array': {
      if (!node.values.length) return c.evar('nil', node.loc)
      let last = node.values[node.values.length - 1]
      // a normal list [1 2 3] turns into (cons 1 (cons 2 (cons 3 nil))).
      // a final `spread` node is neatly represented by replacing the
      // final `nil` with the contents of the spread.
      // so [a b ..c] becomes (cons a (cons b c))
      let res = last.type === 'spread'
        ? parse(last.contents)
        : c.cons(parse(last), c.nil(node.loc), node.loc)
      for (let i = node.values.length - 2; i >= 0; i--) {
        res = c.cons(parse(node.values[i]), res)
      }
      return res
    }
    // for our language, the `raw-code` node just gets passed through as a runtime string.
    // we can call `eval` on it if we need an escape hatch for e.g. producing the API
    // expected by the structured editor.
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
    return {type: 'elambda', 0: list(pats), 1: parse(body), 2: loc}
  },
  let: (loc, bindings, body) => {
    if (!bindings || !body) return
    if (bindings.type !== 'array') return
    const pairs = makePairs(filterBlanks(bindings.values))
    return {type: 'elet', 0: list(
      pairs.map(([pat, init]) => pair(parsePat(pat), parse(init)))),
      1: parse(body),
      2: loc
    }
  },
  'let->': (loc, bindings, body) => {
    if (!bindings || !body) return;
    if (bindings.type !== 'array') return
    const pairs = makePairs(filterBlanks(bindings.values))
    return pairs.reduceRight(
      (body, [pat, init]) => c.app(c.evar('>>=', loc), list([
        parse(init),
        {type: 'elambda', 0: list([parsePat(pat)]), 1: body, 2: loc}
      ]), loc),
      parse(body)
    )
  },
  match: (loc, target, ...rest) => {
    if (!target || !rest.length) return
    const cases = makePairs(rest)
    return {type: 'ematch',
            0: parse(target),
            1: list(cases.map(([pat, body]) => pair(parsePat(pat), parse(body)))),
            2: loc}
  },
  ',': (loc, ...args) => args.map(parse).reduceRight((right, left) =>
    c.app(c.evar(',', loc), list([left, right]), loc)),
  '@': (loc, inner) => ({type: 'equot', 0: {type: 'quot/expr', 0: parse(inner)}, 1: loc}),
  '@!': (loc, inner) => ({type: 'equot', 0: {type: 'quot/top', 0: parseTop(inner)}, 1: loc}),
  '@p': (loc, inner) => ({type: 'equot', 0: {type: 'quot/pat', 0: parsePat(inner)}, 1: loc}),
  '@t': (loc, inner) => ({type: 'equot', 0: {type: 'quot/type', 0: parseType(inner)}, 1: loc}),
  // The "double quote" means that the runtime value isn't going to be an AST type, but rather
  // a CST type! We'll use it in the self-hosting parser to be able to write tests like
  // `(parse (@@ (some form))`. The `fromNode` function that we're calling converts the
  // CST of the structured editor into a data format that fits within our encoding, where
  // attributes of data types have numeric indices, not text labels.
  // So `{type: 'identifier', text: 'a', loc: 10}` becomes `{type: 'identifier', 0: 'a', 1: 10}`
  '@@': (loc, inner) => ({type: 'equot', 0: {type: 'quot/quot', 0: fromNode(inner)}, 1: loc}),
  // Our AST doesn't have a special `if` form, this is just sugar for `(match cond true if-true _ if-false)`
  'if': (loc, cond, yes, no) => ({type: 'ematch', 0: parse(cond), 1: list([pair(
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
  cons: (a, b, l) => c.app(c.evar('cons', l), list([a, b]), l), //c.app(c.app(c.evar('cons', l), list([a]), l), b, l),
  list: (values, l) => {
    let v = c.nil(l)
    for (let i=values.length-1;i>=0;i--) {
      v = c.cons(values[i], v, l)
    }
    return v
  },
  
}

// Here's our utility function for converting the structure editor's CST nodes into values that conform to our
// in-memory data encoding; where data type attributes have numeric indices instead of text labels, and arrays
// are converted to linked lists.
// We also prefix the constructor names with `cst/` to prevent name conflicts with other types.
const fromNode = node => {
  if (isBlank(node)) return
  switch (node.type) {
    case 'identifier':
      return {type: 'cst/id', 0: node.text, 1: node.loc}
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
        node.templates.map(item => pair(fromNode(item.expr) ?? {type: 'cst/string', 0: '', 1: nil},
          pair(item.suffix.text, item.suffix.loc),
        ))
      ), 2: node.loc}
  }
}

// Expects a node of type 'identifier' and if it's an int or true/false, returns
// the appropriate `prim`
const parsePrim = node => {
  const v = +node.text
  if (v + '' === node.text && Math.floor(v) === v) {
    return c.prim(c.int(v, node.loc), node.loc)
  }
  if (node.text === 'true' || node.text === 'false') {
    return c.prim(c.bool(node.text === 'true', node.loc), node.loc)
  }
  return null
}

const parseType = node => {
  if (node.type === 'identifier') {
    return {type: 'tcon', 0: node.text, 1: node.loc}
  }
  if (node.type === 'list') {
    const values = filterBlanks(node.values)
    if (!values.length) return {type: 'tcon', 0: '()', 1: node.loc}
    if (values.length === 3 &&
        values[0].type === 'identifier' &&
        values[0].text === 'fn' &&
        values[1].type === 'array') {
      const body = parseType(values[2])
      // This 'reduceRight' is how we convert a function type declaration
      // with potentially many arguments into function types with only
      // single arguments.
      // for a fn type (fn [a b c] d)
      // the inner function will be called with
      //    [body]           [arg]
      //    d                c
      //    (-> c d)         b
      //    (-> b (-> c d))  a
      // and returns
      //    (-> a (-> b (-> c d)))
      return values[1].values.reduceRight((body, arg) => (
        {type: 'tapp',
         0: {type: 'tapp',
             0: {type: 'tcon', 0: '->', 1: node.loc},
             1: parseType(arg), 2: node.loc},
         1: body,
         2: node.loc}
      ), body)
    }
    // Tuples are also a special case; (, a b c) is sugar for (, a (, b c))
    if (values[0].type === 'identifier' && values[0].text === ',' && values.length > 1) {
      return values.slice(1).map(parseType).reduceRight((right, left) => ({
        type: 'tapp',
        0: {type: 'tapp', 0: {type: 'tcon', 0: ',', 1: values[0].loc}, 1: left, 2: node.loc},
        1: right,
        2: node.loc
      }))
    }
    let res = parseType(values[0])
    for (let i=1;i<values.length; i++) {
      res = {type: 'tapp', 0: res, 1: parseType(values[i]), 2: node.loc}
    }
    return res
  }
  throw new Error(`cant parse type ${node.type}`)
}

// Some helper functions for producing pattern AST nodes
const p = {
  prim: (v, loc=-1) => ({type: 'pprim', 0: v, 1: loc}),
  bool: (v, loc=-1) => ({type: 'pbool', 0: v, 1: loc}),
  int: (v, loc=-1) => ({type: 'pint', 0: v, 1: loc}),
  any: loc => ({type: 'pany', 0: loc}),
  con: (name, nloc, args, loc) => ({type: 'pcon', 0: name, 1: nloc, 2: list(args), 3: loc}),
  cons: (one, two, loc) => p.con('cons', loc, [one, two], loc),
  nil: loc => p.con('nil', loc, [], loc),
}

const parsePat = node => {
  switch (node.type) {
    case 'identifier':
      switch(node.text) {
        case '_': return p.any(node.loc)
        case 'true':
        case 'false':
          return p.prim(p.bool(node.text === 'true', node.loc), node.loc)
      }
      const v = +node.text
      if (v + '' === node.text && Math.floor(v) === v) return p.prim(p.int(v, node.loc), node.loc)
      return {type: 'pvar', 0: node.text, 1: node.loc}
    case 'string':
      return {type: 'pstr', 0: node.first.text, 1: node.loc}
    case 'list': {
      const values = filterBlanks(node.values)
      if (!values.length) return p.con('()', node.loc, [], node.loc)
      if (values[0].type !== 'identifier') throw new Error('pat exp must start with identifier')
      if (values[0].text === ',') {
        return values.slice(1).map(parsePat).reduceRight((right, left) =>
          p.con(',', values[0].loc, [left, right], node.loc))
      }
      return p.con(values[0].text, values[0].loc, values.slice(1).map(parsePat), node.loc)
    }
    case 'array':
      const values = filterBlanks(node.values)
      if (!values.length) return p.nil(node.loc)
      let last = values[values.length - 1]
      // Doing the same trick here with the final spread as we do in the `parse` for expressions
      let res = last.type === 'spread' ? parsePat(last.contents) : p.cons(parsePat(last), p.nil(node.loc), node.loc)
      for (let i=values.length - 2; i>=0; i--) {
        res = p.cons(parsePat(values[i]), res, node.loc)
      }
      return res
  }
  throw new Error('unknown pat' + JSON.stringify(node))
}

const parseTop = (node) => {
  if (isBlank(node)) return
  switch (node.type) {
    // Check for toplevel forms
    case 'list':
      const values = filterBlanks(node.values)
      if (values.length && values[0].type === 'identifier') {
        const f = topForms[values[0].text];
        if (f) {
          const res = f(node.loc, ...values.slice(1))
          if (res) return res
        }
      }
  }
  // Otherwise, it's a toplevel expression
  const inner = parse(node)
  return inner ? {type: 'texpr', 0: inner, 1: node.loc} : inner
}

const topForms = {
  deftype(loc, head, ...tail) {
    if (!head || !tail.length) return
    // handling both `(deftype expr` (no type arg) and `(deftype (list a)` (some type args)
    // we don't actually do anything with the type arguments, because we don't have a type checker yet,
    // and by the time we do we'll be in a self-hosted parser
    const name = head.type === 'identifier'
    ? {head, args: []}
    : head.type === 'list' && head.values.length >= 1 && head.values[0].type === 'identifier'
      ? { head: head.values[0], args: head.values.slice(1).map(node => {
          if (node.type !== 'identifier') throw new Error(`type argument must be an identifier`)
          return pair(node.text, node.loc);
        }
      ) }
      : null;
    if (!name) return
    const constructors = tail.map(item => {
      if (item.type !== 'list') throw new Error(`constructor not a list`)
      const values = filterBlanks(item.values)
      if (values.length < 1) throw new Error(`empty list`)
      return pair(values[0].text, pair(values[0].loc, pair(list(values.slice(1).map(parseType)), item.loc)))
    })
    return {type: 'tdeftype', 0: name.head.text, 1: name.head.loc, 2: list(name.args), 3: list(constructors), 4: loc}
  },
  def(loc, name, value) {
    if (!name || !value) return
    if (name.type !== 'identifier') return
    return {type: 'tdef', 0: name.text, 1: name.loc, 2: parse(value), 3: loc}
  },
  defn(loc, name, args, value) {
    if (!name || !args || !value) return
    if (name.type !== 'identifier' || args.type !== 'array') return
    const body = forms.fn(loc, args, value)
    if (!body) return
    return {type: 'tdef', 0: name.text, 1: name.loc, 2: body, 3: loc}
  },
  typealias(loc, head, tail) {
    return {type: 'ttypealias'}
  },
}

const evaluate = (node, scope) => {
  if (!scope) throw new Error(`evaluate called without scope`)
  switch (node.type) {
    // For primitives, we trivially produce the contained value
    case 'eprim':
      return node[0][0]
    // For strings, we need to handle escapes correctly (e.g. the AST node will have "a\\n", which needs to become "a\n" at runtime) and evaluate
    // any contained template expressions
    case 'estr':
      return unescapeSlashes(node[0]) + unwrapList(node[1]).map(({0: exp, 1: {0: suf}}) => evaluate(exp, scope) + unescapeSlashes(suf)).join('')
    // For variables, we look up the name in the `scope` map that we pass everywhere.
    // We use `sanitize` for compatability with the structured editor environment, which expects variable names to be valid javascript names.
    case 'evar':
      var name = node[0]
      if (name === '()') return null
      if (!Object.hasOwn(scope, name)) {
        throw new Error(`Variable not in scope: ${name} (${node[1]}). ${Object.keys(scope).join(', ')}`)
      }
      return scope[name]
    // For lambdas, we're producing an arrow function that accepts the right number of (curried) arguments, matches each provided value with the
    // corresponding pattern, and then evaluates the body with the `scope` map having all of the resulting bindings.
    // Note that auto-currying means that `(fn [a b] c)` becomes `a => b => c` instead of `(a, b) => c`.
    case 'elambda':
      return unwrapList(node[0]).reduceRight((body, arg) => scope => v => body({...scope, ...evalPat(arg, v)}), scope => evaluate(node[1], scope))(scope)
    // Application is also curried, so we need to loop through the arguments list so that `(eapp t [a b])` becomes `t(a)(b)`.
    case 'eapp':
      return unwrapList(node[1]).reduce((f, arg) => f(evaluate(arg, scope)), evaluate(node[0], scope))
    // For `let`, we go through each binding, evaluate the provided `init` against the pattern, and add any bindings to the scope.
    // We're doing the evaluations in *series* instead of *parallel* to allow later bindings to refer to previous ones.
    // so you can do `(let [a 2 b (+ a 4)] b)` and have it evaluate correctly.
    // Note that this method doesn't allow for self-recursion in let bindings. We'll relax that restriction in the self-hosted compiler.
    case 'elet':
      const inner = unwrapList(node[0]).reduce((scope, {0: pat, 1: init}) => {
        const value = evaluate(init, scope)
        const match = evalPat(pat, value)
        if (match == null) throw new Error(`let pattern didnt't match! ${JSON.stringify(value)} vs ${valueToString(pat)}`)
        return {...scope, ...match}
      }, scope)
      return evaluate(node[1], inner)
    // Match walks through each case, checks to see if the patterns matches the value, and if it does, evaluates the body with any bindings from that
    // pattern added onto the scope.
    // If no cases match, we throw an error.
    case 'ematch':
      const target = evaluate(node[0], scope)
      for (let {0: pat, 1: body} of unwrapList(node[1])) {
        const got = evalPat(pat, target)
        if (got) {
          return evaluate(body, {...scope, ...got})
        }
      }
      throw new Error(`match failed (${node[2]}): ${JSON.stringify(target)} - ${JSON.stringify(node[0])}`)
    // `equot` trivially produces the contained data structure; whether it's CST or AST.
    case 'equot':
      return node[0][0]
  }
  throw new Error(`cant evaluatoe ${node.type}`)
}

// This is our way of figuring out what bindings should result from the application of a
// pattern to a given value.
// If `evalPat` returns `null`, that means that pattern *does not* match the value; otherwise
// it returns a mapping of variable names to bound values.
const evalPat = (node, v) => {
  switch (node.type) {
    case 'pany': return {}
    case 'pprim': return v === node[0][0] ? {} : null
    case 'pstr': return v === node[0]
    case 'pvar':
      return {[node[0]]: v}
    case 'pcon':
      if (node[0] === '()') return v === null ? {} : null
      if (v.type === node[0]) {
        const args = unwrapList(node[2])
        const scope = {}
        for (let i=0; i<args.length; i++) {
          const sub = evalPat(args[i], v[i])
          if (!sub) return null
          Object.assign(scope, sub)
        }
        return scope
      }
      return null
  }
  throw new Error(`Unexpected pat ${JSON.stringify(node)}`)
}       

const testEnv = {
  ',': a => b => pair(a, b),
  cons: a => b => ({type: 'cons', 0: a, 1: b}),
  nil: {type: 'nil'},
  some: a => ({type: 'some', 0: a}),
  none: {type: 'none'},
  '<': a => b => a < b,
  '+': a => b => a + b,
  '-': a => b => a - b,
  '()': null
}

// "A\\nB" -> "A\nB"
const unescapeSlashes = (n) =>
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

const evaluateTop = (node, env) => {
  switch (node.type) {
    case 'texpr': return evaluate(node[0], env)
    case 'tdef':
      const value = evaluate(node[2], env)
      env[node[0]] = value
      return value
    case 'tdeftype':
      const res = {}
      unwrapList(node[3]).forEach(({0: name, 1: {1: {0: args}}}) => {
        res[name] = env[name] = constrFn(name, args)
      })
      return res
  }
}


// this little helper function produces a "constructor function" for a given type constructor definition.
// so `(cons a (list a))` produces `a => b => ({type: 'cons', 0: a, 1: b})`
// and `(ok v)` produces `a => ({type: 'ok', 0: a})`
// and `(nil)` produces `({type: 'nil'})`
const constrFn = (name, args) => {
  const next = (args) => {
    if (args.type === 'nil') return values => ({type: name, ...values})
    return values => arg => next(args[1])([...values, arg])
  }
  return next(args)([])
}

const evalTops = tops => {
  if (tops.type !== 'array') throw new Error('need array')
  const env = {...testEnv} // evaluateTop might mutate the `env` so we need to make a new obj here
  let res
  filterBlanks(tops.values).forEach(top => {
    res = evaluateTop(parseTop(top), env)
  });
  return valueToString(res)
}


// This function collects a list of all "external references" in a given toplevel statement.
// It is used to sort toplevels in the structured editor so that evaluation happens in the
// correct dependency order, and for detecting circular dependencies (which need to be
// evaluated as a group).
const externals = top => {
  switch (top.type) {
    case 'texpr': return externals_expr(top[0], [])
    case 'tdef': return externals_expr(top[2], [top[0]])
    case 'tdeftype': return []
  }
  return []
}

const externals_expr = (expr, locals) => {
  switch (expr.type) {
    case 'evar': return locals.includes(expr[0]) ? [] : [{name: expr[0], kind: 'value', loc: expr[1]}]
    case 'eapp': return externals_expr(expr[0], locals).concat(unwrapList(expr[1]).flatMap(arg => externals_expr(arg, locals)))
    case 'elambda': return externals_expr(expr[1], locals.concat(unwrapList(expr[0]).flatMap(pat_names)))
    case 'eprim': return []
    case 'estr': return unwrapList(expr[1]).flatMap(v => externals_expr(v[0], locals))
    case 'elet': {
      const [ext, loc2] = unwrapList(expr[0]).reduce(([ext, locals], {0: pat, 1: init}) => [
        ext.concat(externals_expr(init, locals)),
        locals.concat(pat_names(pat)),
      ], [[], locals]);
      return ext.concat(externals_expr(expr[1], loc2));
    }
    case 'ematch':
      return externals_expr(expr[0], locals).concat(
        unwrapList(expr[1]).flatMap(kase => externals_expr(kase[1], locals.concat(pat_names(kase[0])))))
  }
  return []
}

// `names` is the complement to `externals`; it produces a list of all values *provided* by a given statement.
// Once we have type checking, we'll also want to report type names produced by a statement (which will have
// `kind: "type"`).
const names = top => {
  switch (top.type) {
    case 'texpr': return []
    case 'tdef': return [{name: top[0], kind: 'value', loc: top[1]}]
    case 'tdeftype': return unwrapList(top[3]).map(({0: name, 1: {0: loc}}) => ({name, kind: 'value', loc}))
  }
  return []
}

// Produce a list of names that are bound when the pattern matches successfully.
const pat_names = pat => {
  switch (pat.type) {
    case 'pvar': return [pat[0]]
    case 'pany': return []
    case 'pprim': return []
    case 'pcon':
      return unwrapList(pat[2]).flatMap(pat_names)
  }
  return []
}


const builtins = `
function equal(a, b) {
    if (a === b) return true;

    if (a && b && typeof a == 'object' && typeof b == 'object') {
        var length, i, keys;
        if (Array.isArray(a)) {
            length = a.length;
            if (length != b.length) return false;
            for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false;
            return true;
        }

        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;

        for (i = length; i-- !== 0; ) {
            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        }

        for (i = length; i-- !== 0; ) {
            var key = keys[i];

            if (!equal(a[key], b[key])) return false;
        }

        return true;
    }

    // true if both NaN, false otherwise
    return a !== a && b !== b;
}

function unescapeString(n) {
    if (n == null || !n.replaceAll) {
        debugger;
        return '';
    }
    return n.replaceAll(/\\\\./g, (m) => {
        if (m[1] === 'n') {
            return '\\n';
        }
        if (m[1] === 't') {
            return '\\t';
        }
        if (m[1] === 'r') {
            return '\\r';
        }
        return m[1];
    });
}

function unwrapList(v) {
    return v.type === 'nil' ? [] : [v[0], ...unwrapList(v[1])];
}

function wrapList(v) {
    let res = { type: 'nil' };
    for (let i = v.length - 1; i >= 0; i--) {
        res = { type: 'cons', 0: v[i], 1: res };
    }
    return res;
}

return {
    '+': (a) => (b) => a + b,
    '-': (a) => (b) => a - b,
    '<': (a) => (b) => a < b,
    '<=': (a) => (b) => a <= b,
    '>': (a) => (b) => a > b,
    '>=': (a) => (b) => a >= b,
    '=': (a) => (b) => equal(a, b),
    '!=': (a) => (b) => !equal(a, b),
    pi: Math.PI,
    'replace-all': a => b => c => a.replaceAll(b, c),
    eval: source => {
      const args = ''; // '{' + Object.keys(ctx).join(',') + '}'
      return new Function(args, 'return ' + source)()//ctx);
    },
    'eval-with': ctx => source => {
      const args = '{' + Object.keys(ctx).join(',') + '}'
      return new Function(args, 'return ' + source)(ctx);
    },
    unescapeString,
    equal,
    'int-to-string': (a) => a.toString(),
    'string-to-int': (a) => {
        const v = Number(a);
        return Number.isInteger(v) ? { type: 'some', 0: v } : { type: 'none' };
    },

    // maps
    'map/nil': [],
    'map/set': (map) => (key) => (value) =>
        [[key, value], ...map.filter((i) => i[0] !== key)],
    'map/rm': (map) => (key) => map.filter((i) => !equal(i[0], key)),
    'map/get': (map) => (key) => {
        const found = map.find((i) => equal(i[0], key));
        return found ? { type: 'some', 0: found } : { type: 'none' };
    },
    'map/map': (fn) => (map) => map.map(([k, v]) => [k, fn(v)]),
    'map/merge': (one) => (two) =>
        [...one, ...two.filter(([key]) => !one.find((a) => equal(a, key)))],
    'map/values': (map) => wrapList(map.map((item) => i[1])),
    'map/keys': (map) => wrapList(map.map((item) => i[0])),
    'map/from-list': (list) =>
        unwrapList(list).map((pair) => [pair[0], pair[1]]),
    'map/to-list': (map) =>
        wrapList(map.map(([key, value]) => ({ type: ',', 0: key, 1: value }))),

    // sets
    'set/nil': [],
    'set/add': (s) => (v) => [v, ...s.filter((m) => !equal(v, m))],
    'set/has': (s) => (v) => s.includes(v),
    'set/rm': (s) => (v) => s.filter((i) => !equal(i, v)),
    // NOTE this is only working for primitives
    'set/diff': (a) => (b) => a.filter((i) => !b.some((j) => equal(i, j))),
    'set/merge': (a) => (b) =>
        [...a, ...b.filter((x) => !a.some((y) => equal(y, x)))],
    'set/overlap': (a) => (b) => a.filter((x) => b.some((y) => equal(y, x))),
    'set/to-list': wrapList,
    'set/from-list': (s) => {
        const res = [];
        unwrapList(s).forEach((item) => {
            if (res.some((m) => equal(item, m))) {
                return;
            }
            res.push(item);
        });
        return res;
    },

    // Various debugging stuff
    jsonify: (v) => JSON.stringify(v) ?? 'undefined',
    fatal: (message) => {
        throw new Error(\`Fatal runtime: \${message}\`);
    },
};

`;

const reader = (text) => {
  let i = 0;
  const pairs = {'[': ']', '{': '}', '(': ')'}
  const skipWhite = () => {
    while (i < text.length && text[i].match(/\s/)) i++;
    return (i >= text.length)
  }
  
  const readString = () => {
    const loc = i;
    i++;
    let first = ''
    let current = ''
    let templates = []
    
    const next = () => {
      if (!templates.length) {
        first = current
      } else {
        templates[templates.length - 1].suffix = current
      }
      current = ''
    }
    
    for (; i < text.length; i++) {
      if (text[i] === '"') break
      if (text[i] === '\\') {
        current += text[i]
        i++
      }
      if (text[i] === '$' && text[i + 1] === '{') {
        next()
        i += 2;
        templates.push({
          expr: read(),
          suffix: '',
          loc: i,
        })
        if (text[i] !== '}') throw new Error('unmatched } in template string');
        continue
      }
      current += text[i]
      // console.log('a', current, text[i])
    }
    next()
    return {first, templates, type: 'string', loc}
  }
    
  const stops = `]}) \t\n`
  const read = () => {
    if (skipWhite()) return
    switch (text[i]) {
      case '[':
      case '{':
      case '(':
        const start = i
        const last = pairs[text[i]];
        i+=1;
        const values = [];
        while (true) {
          const next = read(text)
          if (!next) break
          values.push(next)
        }
        skipWhite()
        if (i >= text.length || text[i] !== last) {
          throw new Error(`Expected ${last}: ${text[i]}`)
        }
        i++
        return {type: last === ']' ? 'array' : last === ')' ? 'list' : 'record', values, loc: start}
      case '"':
        return readString()
      case '.':
        if (text[i + 1] === '.') {
          const loc = i
          i += 2;
          const inner = read()
          return {type: 'spread', contents: inner, loc}
        }
      default: {
        let start = i;
        for (; i < text.length && !stops.includes(text[i]); i++) {}
        if (start === i) return
        return {type: 'identifier', text: text.slice(start, i), loc: start}
      }
    }
  }
  return read()
}

const makePrelude = obj => Object.entries(obj).reduce((obj, [k, v]) => (obj[k] = typeof v === 'function' ? '' + v : typeof v === 'string' ? v : JSON.stringify(v), obj), {})

// Convert an identifier into a valid js identifier, replacing special characters, and accounting for keywords.
const sanitize =  (raw) => {
    for (let [key, val] of Object.entries(sanMap)) {
        raw = raw.replaceAll(key, val);
    }
    if (kwds.includes(raw)) return '$' + raw
    return raw
}


const sanMap = {
    // '$$$$' gets interpreted by replaceAll as '$$', for reasons
    $: '$$$$',
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
    ':': '$cl',
    '#': '$ha',
    '!': '$ex',
    '|': '$bar',
    '()': '$unit',
    '?': '$qe',
  };
const kwds =
    'case new var const let if else return super break while for default'.split(' ');


return ({type: 'fns', prelude: makePrelude({evaluate,evaluateStmt: evaluateTop,unwrapList,constrFn,sanitize,sanMap,evalPat,kwds,unescapeSlashes,valueToString}),
  compile: ast => _meta => `$env.evaluate(${JSON.stringify(ast)}, $env)`,
  compile_stmt: ast => _meta => `${ast.type === 'tdef' ? `const ${sanitize(ast[0])} = ` : ast.type === 'tdeftype' ? `const {${
    unwrapList(ast[3]).map(c => `"${c[0]}": ${sanitize(c[0])}`)
  }} = ` : ''}$env.evaluateStmt(${JSON.stringify(ast)}, $env)`,
  parse_stmt: parseTop, parse_expr: parse,
  names,
  externals_stmt: externals,
  externals_expr: e => externals_expr(e, []),
  fromNode: x => x,
  builtins,
  toNode: x => x})