(** ## Bootstrap (js) parser + evaluator **)

(** Because we're using a structured editor for our language, the job of parsing is quite a bit simpler; we just need to turn the CST into the AST, instead of messing around with tokenizing, counting parentheses, etc. **)

(** ## Prelude
    Some basic handy functions **)

(** // turn a javascript array into a linked list with `cons` and `nil`.
list = (values) => {
  let v = nil
  for (let i = values.length - 1; i >= 0; i--) {
    v = cons(values[i], v)
  }
  return v
} **)

(** cons = (a, b) => ({type: 'cons', 0: a, 1: b}) **)

(** nil = {type: 'nil'} **)

(** // unwrap a list into a javascript array
unwrapList = value => value.type === 'nil' ? [] : [value[0], ...unwrapList(value[1])] **)

(** unwrapList(list([1,2,3])) **)

(** pair = (a, b) => ({type: ',', 0: a, 1: b}) **)

(** foldr = (init, items, f) => items.length === 0 ? init : f(foldr(init, items.slice(1), f), items[0]) **)

(** // This will be useful for the `let` and `match` forms, where we expect a list of pairs of nodes.
makePairs = array => {
  const res = [];
  for (let i = 0; i < array.length - 1; i += 2) {
    res.push([array[i], array[i + 1]]);
  }
  return res
} **)

(, (** makePairs **) [(, (** [1, 2, 3, 4] **) (** [[1, 2], [3, 4]] **))])

(** // turn a runtime value into a nice-to-read string. Roughly corresponds to `show` from Haskell
// or `repr` from python
valueToString = (v) => {
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
 **)

(** // These are the CST nodes that we want to ignore while parsing.
filterBlanks = values => values.filter(n => !['blank', 'comment', 'rich-text', 'comment-node'].includes(n.type)) **)

(** ## Parser **)

(** ## Expressions **)

(** Let's remind ourselves what the AST looks like that we're parsing into: **)

(deftype expr
    (** the trailing int on each constructor is a unique id **)
        (eprim prim int)
        (** estr: prefix, template-pairs. All strings are template strings in our language :)
        So "Hello ${world}!" would parse into
        (estr "Hello" [(,, (evar "world") "!" 1234)])
        template-pairs is a list of expression and suffix (with a unique ID for the string tacked on) **)
        (estr string (list (,, expr string int)) int)
        (** evar: a variable reference! might be local or global **)
        (evar string int)
        (** equot: this form allows embedding of the CST or AST into the runtime, which makes writing tests for our parsers, compilers, and type checkers much simpler. **)
        (equot quot int)
        (** elambda: args, body , parsed from the form (fn [arg1 arg2] body). **)
        (elambda (list pat) expr int)
        (** eapp: target, args **)
        (eapp expr (list expr) int)
        (** elet: bindings, body **)
        (elet (list (, pat expr)) expr int)
        (** ematch: target, cases **)
        (ematch expr (list (, pat expr))))

(deftype quot
    (quot/expr expr)
        (quot/stmt stmt)
        (quot/type type)
        (quot/pat pat)
        (quot/quot cst))

(** parse = node => {
  switch (node.type) {
    case 'identifier': {
      return parsePrim(node) || c.evar(node.text, node.loc)
    }
    case 'string': {
      const exprs = node.templates.map(t => parse(t.expr))
      return {
        type: 'estr',
        0: node.first.text,
        1: list(node.templates.map((t, i) => ({type: ',,', 0: exprs[i], 1: t.suffix.text, 2: t.suffix.loc}))),
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
      return c.app(parsed[0], list(parsed.slice(1)))
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
      for (let i=node.values.length - 2; i>=0; i--) {
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
} **)

(** forms = {
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
  match: (loc, target, ...rest) => {
    if (!target || !rest.length) return
    const cases = makePairs(rest)
    return {type: 'ematch',
            0: parse(target),
            1: list(cases.map(([pat, body]) => pair(parsePat(pat), parse(body)))),
            2: loc}
  },
  '@': (loc, inner) => ({type: 'equot', 0: {type: 'quot/expr', 0: parse(inner)}, 1: loc}),
  '@!': (loc, inner) => ({type: 'equot', 0: {type: 'quot/stmt', 0: parseStmt(inner)}, 1: loc}),
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
  cons: (a, b, l) => c.app(c.evar('cons', l), list([a, b]), l), //c.app(c.app(c.evar('cons', l), list([a]), l), b, l),
  list: (values, l) => {
    let v = c.nil(l)
    for (let i=values.length-1;i>=0;i--) {
      v = c.cons(values[i], v, l)
    }
    return v
  },
  
} **)

(** // Here's our utility function for converting the structure editor's CST nodes into values that conform to our
// in-memory data encoding; where data type attributes have numeric indices instead of text labels, and arrays
// are converted to linked lists.
// We also prefix the constructor names with `cst/` to prevent name conflicts with other types.
fromNode = node => {
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
} **)

(,
    (** v => valueToString(parse(v)) **)
        [(, (@ 1) (** "(eprim (pint 1 89) 89)" **))
        (, (@ []) (** '(evar "nil" 118)' **))
        (,
        (@@ abc)
            (** '(equot (quot/quot (cst/identifier "abc" 1207)) 1204)' **))
        (,
        (@ [1 2])
            (** '(eapp (evar "cons" -1) [(eprim (pint 1 1179) 1179) (eapp (evar "cons" 1178) [(eprim (pint 2 1181) 1181) (evar "nil" 1178)] 1178)] -1)' **))
        (, (@ true) (** "(eprim (pbool true 1170) 1170)" **))
        (,
        (@ "hi ${name}!")
            (** '(estr "hi " [(,, (evar "name" 1199) "!" 1200)] 1197)' **))
        (,
        (fn [a b] 1)
            (** '(elambda [(pvar "a" 136) (pvar "b" 1505)] (eprim (pint 1 133) 133) 129)' **))
        (,
        (@
            (match x
                1    2
                "hi" 1))
            (** '(ematch (evar "x" 161) [(, (pprim (pint 1 162) 162) (eprim (pint 2 163) 163)) (, (pstr "hi" 164) (eprim (pint 1 166) 166))] 157)' **))
        (,
        (@ (let [(, a b) c] d))
            (** '(elet [(, (pcon "," [(pvar "a" 182) (pvar "b" 184)] 180) (evar "c" 185))] (evar "d" 186) 175)' **))
        (,
        (@ (let [[a ..b] c] d))
            (** '(elet [(, (pcon "cons" [(pvar "a" 203) (pvar "b" 204)] 202) (evar "c" 208))] (evar "d" 209) 196)' **))
        (,
        (@ [a ..b])
            (** '(eapp (evar "cons" -1) [(evar "a" 790) (evar "b" 791)] -1)' **))])

(** ## Primitives
    just ints and booleans at the moment **)

(** // Expects a node of type 'identifier' and if it's an int or true/false, returns
// the appropriate `prim`
parsePrim = node => {
  const v = +node.text
  if (v + '' === node.text && Math.floor(v) === v) {
    return c.prim(c.int(v, node.loc), node.loc)
  }
  if (node.text === 'true' || node.text === 'false') {
    return c.prim(c.bool(node.text === 'true', node.loc), node.loc)
  }
  return null
} **)

(** parsePrim({text: '23', loc: 10}) **)

(,
    (** n => valueToString(parsePrim(n) ?? "not a prim") **)
        [(, (@ true) (** "(eprim (pbool true 1080) 1080)" **))
        (, (@ false) (** "(eprim (pbool false 1103) 1103)" **))
        (, (@ 123) (** "(eprim (pint 123 1087) 1087)" **))
        (, (@ hi) (** '"not a prim"' **))])

(** ## Types **)

(** parseType = node => {
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
    let res = parseType(values[0])
    for (let i=1;i<values.length; i++) {
      res = {type: 'tapp', 0: res, 1: parseType(values[i]), 2: node.loc}
    }
    return res
  }
  throw new Error(`cant parse type ${node.type}`)
} **)

(,
    (** x => valueToString(parseType(x)) **)
        [(, (@ list) (** '(tcon "list" 1114)' **))
        (,
        (@ (list a ;  a comment is ignored))
            (** '(tapp (tcon "list" 1123) (tcon "a" 1124) 1122)' **))
        (,
        (@ (fn [x] 10))
            (** '(tapp (tapp (tcon "->" 1131) (tcon "x" 1137) 1131) (tcon "10" 1138) 1131)' **))])

(** ## Patterns **)

(** // Some helper functions for producing pattern AST nodes
p = {
  prim: (v, loc=-1) => ({type: 'pprim', 0: v, 1: loc}),
  bool: (v, loc=-1) => ({type: 'pbool', 0: v, 1: loc}),
  int: (v, loc=-1) => ({type: 'pint', 0: v, 1: loc}),
  any: loc => ({type: 'pany', 0: loc}),
  con: (name, args, loc) => ({type: 'pcon', 0: name, 1: list(args), 2: loc}),
  cons: (one, two, loc) => p.con('cons', [one, two], loc),
  nil: loc => p.con('nil', [], loc),
} **)

(** parsePat = node => {
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
      if (!values.length) return p.con('()', [], node.loc)
      if (values[0].type !== 'identifier') throw new Error('pat exp must start with identifier')
      return p.con(values[0].text, values.slice(1).map(parsePat), node.loc)
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
} **)

(,
    (** x => valueToString(parsePat(x)) **)
        [(, (@ hi) (** '(pvar "hi" 1226)' **))
        (, (@ _) (** "(pany 1234)" **))
        (,
        (@ (, a b))
            (** '(pcon "," [(pvar "a" 1243) (pvar "b" 1244)] 1241)' **))
        (, (@ []) (** '(pcon "nil" [] 1251)' **))
        (,
        (@ [a b ..c])
            (** '(pcon "cons" [(pvar "a" 1263) (pcon "cons" [(pvar "b" 1268) (pvar "c" 1269)] 1258)] 1258)' **))
        (, (@ 12) (** "(pprim (pint 12 1279) 1279)" **))
        (, (@ "hi") (** '(pstr "hi" 1286)' **))])

(** ## Statements **)

(** parseStmt = (node) => {
  switch (node.type) {
    // Ignore blanks and comments
    case 'blank':
    case 'comment':
    case 'comment-node':
    case 'rich-text':
      return;
    // Check for toplevel forms
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
  // Otherwise, it's a toplevel expression
  const inner = parse(node)
  return inner ? {type: 'sexpr', 0: inner, 1: node.loc} : inner
} **)

(** stmtForms = {
  deftype(loc, head, ...tail) {
    if (!head || !tail.length) return
    // handling both `(deftype expr` (no type arg) and `(deftype (list a)` (some type args)
    // we don't actually do anything with the type arguments, because we don't have a type checker yet,
    // and by the time we do we'll be in a self-hosted parser
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
} **)

(,
    (** v => valueToString(parseStmt(v)) **)
        [(, (@ 1) (** "(sexpr (eprim (pint 1 238) 238) 238)" **))
        (, (@ (def hi 10)) (** '(sdef "hi" (eprim (pint 10 254) 254) 245)' **))
        (,
        (@ (deftype (option a) (some a) (none)))
            (** '(sdeftype "option" [(,, "some" [(tcon "a" 1018)] 1017) (,, "none" [] 1020)])' **))
        (,
        (@ (defn lol [a b] (+ a b)))
            (** '(sdef "lol" (elambda [(pvar "a" 268) (pvar "b" 269)] (eapp (evar "+" 271) [(evar "a" 272) (evar "b" 273)] -1) 261) 261)' **))])

(** ## Tree-Walking Evaluator **)

(** To evaluate our code in this bootstrap environment, we're treating the AST as a very basic "bytecode" that we're evaluating in a "virtual machine". Evaluating a program, in this paradigm, simply consists of walking each node of the tree and "reducing" it to a runtime value. **)

(** evaluate = (node, scope) => {
  if (!scope) throw new Error(`evaluate called without scope`)
  switch (node.type) {
    // For primitives, we trivially produce the contained value
    case 'eprim':
      return node[0][0]
    // For strings, we need to handle escapes correctly (e.g. the AST node will have "a\\n", which needs to become "a\n" at runtime) and evaluate
    // any contained template expressions
    case 'estr':
      return unescapeSlashes(node[0]) + unwrapList(node[1]).map(({0: exp, 1: suf}) => evaluate(exp, scope) + unescapeSlashes(suf)).join('')
    // For variables, we look up the name in the `scope` map that we pass everywhere.
    // We use `sanitize` for compatability with the structured editor environment, which expects variable names to be valid javascript names.
    case 'evar':
      var name = sanitize(node[0])
      if (!Object.hasOwn(scope, name)) {
        throw new Error(`Unknown vbl: ${name}. ${Object.keys(scope).join(', ')}`)
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
      throw new Error(`match failed (${node[2]}): ${JSON.stringify(target)}`)
    // `equot` trivially produces the contained data structure; whether it's CST or AST.
    case 'equot':
      return node[0][0]
  }
  throw new Error(`cant evaluatoe ${node.type}`)
} **)

(,
    (** v => evaluate(parse(v), {'$co': a => b => pair(a,b)}) **)
        [(, (@ ((fn [x] 1) 0)) 1)
        (, (@ (let [(, x _) (, 1 2)] x)) 1)
        (,
        (@
            (match 3
                1 2
                3 10))
            10)
        (, (@ (@t list)) (** {"0":"list","1":1575,"type":"tcon"} **))
        (, (@ "hi ${1}.") "hi 1.")
        (, (@ "hi") "hi")
        (, (@ (, 1 2)) (** {"0":1,"1":2,"type":","} **))])

(** // This is our way of figuring out what bindings should result from the application of a
// pattern to a given value.
// If `evalPat` returns `null`, that means that pattern *does not* match the value; otherwise
// it returns a mapping of variable names to bound values.
evalPat = (node, v) => {
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
          if (!sub) return null
          Object.assign(scope, sub)
        }
        return scope
      }
      return null
  }
  throw new Error(`Unexpected pat ${JSON.stringify(node)}`)
}        **)

(,
    (** ({values: [pat, val]}) => evalPat(parsePat(pat), evaluate(parse(val), testEnv)) **)
        [(, [a 10] (** {"a":10} **))
        (, [(, a b) 10] )
        (, [(, a b) (, 10 20)] (** {"a":10,"b":20} **))
        (, [[1 _ ..rest] [1 2 3 4]] (** {"rest": list([3, 4])} **))])

(** testEnv = {
  '$co': a => b => pair(a, b),
  cons: a => b => ({type: 'cons', 0: a, 1: b}),
  nil: {type: 'nil'},
  some: a => ({type: 'some', 0: a}),
  none: {type: 'none'},
} **)

(** // "A\\nB" -> "A\nB"
unescapeSlashes = (n) =>
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
    }) **)

(,
    (** unescapeSlashes **)
        [(, "\n" "\n") (, "\\n" "\n") (, "\\\\n" "\\n") (, "\\\\" "\\") (, "\\\n" "\\\n")])

(** evaluateStmt = (node, env) => {
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
 **)

(** // this little helper function produces a "constructor function" for a given type constructor definition.
// so `(cons a (list a))` produces `a => b => ({type: 'cons', 0: a, 1: b})`
// and `(ok v)` produces `a => ({type: 'ok', 0: a})`
// and `(nil)` produces `({type: 'nil'})`
constrFn = (name, args) => {
  const next = (args) => {
    if (args.type === 'nil') return values => ({type: name, ...values})
    return values => arg => next(args[1])([...values, arg])
  }
  return next(args)([])
} **)

(** evalStmts = stmts => {
  if (stmts.type !== 'array') throw new Error('need array')
  const env = {...testEnv} // evaluateStmt might mutate the `env` so we need to make a new obj here
  let res
  filterBlanks(stmts.values).forEach(stmt => {
    res = evaluateStmt(parseStmt(stmt), env)
  });
  return valueToString(res)
}
 **)

(,
    (** evalStmts **)
        [(, [0] (** "0" **))
        (, [(def n 10) n] (** "10" **))
        (, [(defn hi [x] (, x 2)) (hi 5)] (** "(, 5 2)" **))
        (, [(some 10)] (** "(some 10)" **))
        (,
        [(match (some 10)
            (some v) v
            _        5)]
            (** "10" **))
        (, [(deftype lots (lol a b c)) (lol 1 true "hi")] (** '(lol 1 true "hi")' **))
        (, [(deftype a (com, 1 2)) (com, 1 2)] (** "(com, 1 2)" **))
        (, [(deftype (list a) (cons a (list a)) (nil)) [1 2]] (** "[1 2]" **))])

(** ## Analysis **)

(** // This function collects a list of all "external references" in a given toplevel statement.
// It is used to sort toplevels in the structured editor so that evaluation happens in the
// correct dependency order, and for detecting circular dependencies (which need to be
// evaluated as a group).
externals = stmt => {
  switch (stmt.type) {
    case 'sexpr': return externals_expr(stmt[0], [])
    case 'sdef': return externals_expr(stmt[1], [stmt[0]])
    case 'sdeftype': return []
  }
  return []
} **)

(,
    (** v =>(externals(parseStmt(v))) **)
        [(, (@ lol) (** [{"name":"lol","kind":"value","loc":620}] **))
        (, (@ (fn [(, x)] (+ x))) (** [{"name":"+","kind":"value","loc":641}] **))
        (, (@ "hi ${x}") (** [{"name":"x","kind":"value","loc":653}] **))
        (,
        (@
            (match m
                (, a b) (+ a)))
            (** [{"name":"m","kind":"value","loc":663},{"name":"+","kind":"value","loc":665}] **))
        (, (@ (let [x 2] (+ x))) (** [{"name":"+","kind":"value","loc":686}] **))
        (,
        (@
            (defn pat-loop [target args i inner]
                (match args
                    []           inner
                    [arg ..rest] (compile-pat
                                     arg
                                         "${target}[${i}]"
                                         (pat-loop target rest (+ i 1) inner)))))
            (** [{"name":"compile-pat","kind":"value","loc":855},{"name":"+","kind":"value","loc":868}] **))])

(** externals_expr = (expr, locals) => {
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
} **)

(** // `names` is the complement to `externals`; it produces a list of all values *provided* by a given statement.
// Once we have type checking, we'll also want to report type names produced by a statement (which will have
// `kind: "type"`).
names = stmt => {
  switch (stmt.type) {
    case 'sexpr': return []
    case 'sdef': return [{name: stmt[0], kind: 'value', loc: stmt[2]}]
    case 'sdeftype': return unwrapList(stmt[1]).map(c => ({name: c[0], kind: 'value', loc: c[2]}))
  }
} **)

(,
    (** v => names(parseStmt(v)) **)
        [(, (@ hi) (** [] **))
        (, (@ (def x 10)) (** [{"name":"x","kind":"value","loc":712}] **))
        (,
        (@ (deftype (option x) (some x) (none)))
            (** [{"name":"some","kind":"value","loc":730},{"name":"none","kind":"value","loc":733}] **))])

(** // Produce a list of names that are bound when the pattern matches successfully.
pat_names = pat => {
  switch (pat.type) {
    case 'pvar': return [pat[0]]
    case 'pany': return []
    case 'pprim': return []
    case 'pcon':
      return unwrapList(pat[1]).flatMap(pat_names)
  }
  return []
}
 **)

(** ## Packaging it up as a Compiler for the structured editor **)

(** ({type: 'fns', prelude,
  compile, compile_stmt,
  parse_stmt: parseStmt, parse_expr: parse,
  names,
  externals_stmt: externals,
  externals_expr: e => externals_expr(e, []),
  fromNode: x => x,
  toNode: x => x}) **)

(** makePrelude = obj => Object.entries(obj).reduce((obj, [k, v]) => (obj[k] = typeof v === 'function' ? '' + v : typeof v === 'string' ? v : JSON.stringify(v), obj), {}) **)

(** compile = ast => _meta => `$env.evaluate(${JSON.stringify(ast)}, $env)` **)

(** compile_stmt = ast => _meta => `${ast.type === 'sdef' ? `const ${sanitize(ast[0])} = ` : ast.type === 'sdeftype' ? `const {${
  unwrapList(ast[1]).map(c => `"${c[0]}": ${sanitize(c[0])}`)
}} = ` : ''}$env.evaluateStmt(${JSON.stringify(ast)}, $env)` **)

(** testCompileStmt = v => compile_stmt(parseStmt(v))() **)

((** testCompileStmt **) (deftype card (red) (black)))

(** // Convert an identifier into a valid js identifier, replacing special characters, and accounting for keywords.
sanitize =  (raw) => {
    for (let [key, val] of Object.entries(sanMap)) {
        raw = raw.replaceAll(key, val);
    }
    if (kwds.includes(raw)) return '$' + raw
    return raw
}
 **)

(,
    (** sanitize **)
        [(, "hello-world" "hello_world")
        (, "a/b/c" "a$slb$slc")
        (, "abc$" "abc$$")])

(** sanMap = {
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
    '!': '$ex',
    '|': '$bar',
    '()': '$unit',
    '?': '$qe',
  };
 **)

(** kwds = (() => {
  const kwds =
    'case new var const let if else return super break while for default';
  const rx = [];
  return kwds.split(' ')
})();
 **)

(** sanitize('for') **)

(** prelude = makePrelude({evaluate,evaluateStmt,unwrapList,constrFn,sanitize,sanMap,evalPat,kwds,unescapeSlashes})  **)

