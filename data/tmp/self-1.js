const $env = {}
const $builtins = (() => {
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
    return n.replaceAll(/\\./g, (m) => {
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
    });
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
    '.': '$do',
    ':': '$cl',
    '#': '$ha',
    '!': '$ex',
    '|': '$bar',
    '()': '$unit',
    '?': '$qe',
  };
 const kwds =
    'case new var const let if else return super break while for default eval'.split(' ');

// Convert an identifier into a valid js identifier, replacing special characters, and accounting for keywords.
function sanitize(raw) {
    for (let [key, val] of Object.entries(sanMap)) {
        raw = raw.replaceAll(key, val);
    }
    if (kwds.includes(raw)) return '$' + raw
    return raw
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

 const valueToString = (v) => {
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
                "'" + JSON.stringify(v).slice(1, -1).replace(/\"/g, '"') + "'"
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
      return `Unexpected ${v}`;
    }
    return '' + v;
}; 

return {
    '+': (a) => (b) => a + b,
    '-': (a) => (b) => a - b,
    '<': (a) => (b) => a < b,
    '<=': (a) => (b) => a <= b,
    '>': (a) => (b) => a > b,
    '>=': (a) => (b) => a >= b,
    '=': (a) => (b) => equal(a, b),
    '!=': (a) => (b) => !equal(a, b),
    $unit: null,
    pi: Math.PI,
    'replace-all': a => b => c => a.replaceAll(b, c),
    eval: source => {
      return new Function('', 'return ' + source)();
    },
    'eval-with': ctx => source => {
      const args = '{' + Object.keys(ctx).join(',') + '}'
      return new Function(args, 'return ' + source)(ctx);
    },
    errorToString: f => arg => {
      try {
        return f(arg)
      } catch (err) {
        return err.message;
      }
    },
    valueToString,
    unescapeString,
    sanitize,
    equal: a => b => equal(a, b),
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
        return found ? { type: 'some', 0: found[1] } : { type: 'none' };
    },
    'map/map': (fn) => (map) => map.map(([k, v]) => [k, fn(v)]),
    'map/merge': (one) => (two) =>
        [...one, ...two.filter(([key]) => !one.find(([a]) => equal(a, key)))],
    'map/values': (map) => wrapList(map.map((item) => item[1])),
    'map/keys': (map) => wrapList(map.map((item) => item[0])),
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
        throw new Error(`Fatal runtime: ${message}`);
    },
};

})();
Object.assign($env, $builtins);
const {"+": $pl, "-": _, "<": $lt, "<=": $lt$eq, ">": $gt, ">=": $gt$eq, "=": $eq, "!=": $ex$eq, "$unit": $unit, "pi": pi, "replace-all": replace_all, "eval": $eval, "eval-with": eval_with, "errorToString": errorToString, "valueToString": valueToString, "unescapeString": unescapeString, "sanitize": sanitize, "equal": equal, "int-to-string": int_to_string, "string-to-int": string_to_int, "map/nil": map$slnil, "map/set": map$slset, "map/rm": map$slrm, "map/get": map$slget, "map/map": map$slmap, "map/merge": map$slmerge, "map/values": map$slvalues, "map/keys": map$slkeys, "map/from-list": map$slfrom_list, "map/to-list": map$slto_list, "set/nil": set$slnil, "set/add": set$sladd, "set/has": set$slhas, "set/rm": set$slrm, "set/diff": set$sldiff, "set/merge": set$slmerge, "set/overlap": set$sloverlap, "set/to-list": set$slto_list, "set/from-list": set$slfrom_list, "jsonify": jsonify, "fatal": fatal} = $builtins;
const $prelude = (() => {const evaluate = (node, scope) => {
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
};

const evaluateStmt = (node, env) => {
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
};

const unwrapList = (value) => {
  return value.type === 'nil' ? [] : [value[0], ...unwrapList(value[1])]
};

const constrFn = (name, args) => {
  const next = (args) => {
    if (args.type === 'nil') return values => ({type: name, ...values})
    return values => arg => next(args[1])([...values, arg])
  }
  return next(args)([])
};

const sanMap = {"$":"$$$$","-":"_","+":"$pl","*":"$ti","=":"$eq",">":"$gt","<":"$lt","'":"$qu",".":"$do","\"":"$dq",",":"$co","/":"$sl",";":"$semi","@":"$at",":":"$cl","#":"$ha","!":"$ex","|":"$bar","()":"$unit","?":"$qe"};

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
};

const kwds = ["case","new","var","const","let","if","else","return","super","break","while","for","default","eval"];

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
    });

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
return {evaluate,evaluateStmt,unwrapList,constrFn,sanMap,evalPat,kwds,unescapeSlashes,valueToString}})();
Object.assign($env, $prelude);
const {"pint": pint,"pbool": pbool} = $env.evaluateStmt({"0":"prim","1":531,"2":{"type":"nil"},"3":{"0":{"0":"pint","1":{"0":536,"1":{"0":{"0":{"0":"int","1":537,"type":"tcon"},"1":{"0":{"0":"int","1":5378,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":535,"type":","},"type":","},"type":","},"1":{"0":{"0":"pbool","1":{"0":539,"1":{"0":{"0":{"0":"bool","1":540,"type":"tcon"},"1":{"0":{"0":"int","1":5379,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":538,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":529,"type":"tdeftype"}, $env)
const {"pany": pany,"pvar": pvar,"pprim": pprim,"pstr": pstr,"pcon": pcon} = $env.evaluateStmt({"0":"pat","1":543,"2":{"type":"nil"},"3":{"0":{"0":"pany","1":{"0":545,"1":{"0":{"0":{"0":"int","1":5055,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":544,"type":","},"type":","},"type":","},"1":{"0":{"0":"pvar","1":{"0":547,"1":{"0":{"0":{"0":"string","1":548,"type":"tcon"},"1":{"0":{"0":"int","1":5056,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":546,"type":","},"type":","},"type":","},"1":{"0":{"0":"pprim","1":{"0":3936,"1":{"0":{"0":{"0":"prim","1":3937,"type":"tcon"},"1":{"0":{"0":"int","1":5057,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":3935,"type":","},"type":","},"type":","},"1":{"0":{"0":"pstr","1":{"0":4150,"1":{"0":{"0":{"0":"string","1":4151,"type":"tcon"},"1":{"0":{"0":"int","1":5058,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":4149,"type":","},"type":","},"type":","},"1":{"0":{"0":"pcon","1":{"0":550,"1":{"0":{"0":{"0":"string","1":551,"type":"tcon"},"1":{"0":{"0":"int","1":5302,"type":"tcon"},"1":{"0":{"0":{"0":"list","1":553,"type":"tcon"},"1":{"0":"pat","1":554,"type":"tcon"},"2":552,"type":"tapp"},"1":{"0":{"0":"int","1":5059,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":549,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"4":541,"type":"tdeftype"}, $env)
const {"tvar": tvar,"tapp": tapp,"tcon": tcon} = $env.evaluateStmt({"0":"type","1":557,"2":{"type":"nil"},"3":{"0":{"0":"tvar","1":{"0":559,"1":{"0":{"0":{"0":"string","1":560,"type":"tcon"},"1":{"0":{"0":"int","1":5061,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":558,"type":","},"type":","},"type":","},"1":{"0":{"0":"tapp","1":{"0":562,"1":{"0":{"0":{"0":"type","1":563,"type":"tcon"},"1":{"0":{"0":"type","1":564,"type":"tcon"},"1":{"0":{"0":"int","1":5060,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":561,"type":","},"type":","},"type":","},"1":{"0":{"0":"tcon","1":{"0":566,"1":{"0":{"0":{"0":"string","1":567,"type":"tcon"},"1":{"0":{"0":"int","1":5062,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":565,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"4":555,"type":"tdeftype"}, $env)
const {"tdeftype": tdeftype,"tdef": tdef,"texpr": texpr,"ttypealias": ttypealias} = $env.evaluateStmt({"0":"top","1":660,"2":{"type":"nil"},"3":{"0":{"0":"tdeftype","1":{"0":662,"1":{"0":{"0":{"0":"string","1":663,"type":"tcon"},"1":{"0":{"0":"int","1":6416,"type":"tcon"},"1":{"0":{"0":{"0":"list","1":6419,"type":"tcon"},"1":{"0":{"0":{"0":",","1":6424,"type":"tcon"},"1":{"0":"string","1":6425,"type":"tcon"},"2":6420,"type":"tapp"},"1":{"0":"int","1":6426,"type":"tcon"},"2":6420,"type":"tapp"},"2":6418,"type":"tapp"},"1":{"0":{"0":{"0":"list","1":665,"type":"tcon"},"1":{"0":{"0":{"0":",","1":667,"type":"tcon"},"1":{"0":"string","1":668,"type":"tcon"},"2":666,"type":"tapp"},"1":{"0":{"0":{"0":",","1":667,"type":"tcon"},"1":{"0":"int","1":6524,"type":"tcon"},"2":666,"type":"tapp"},"1":{"0":{"0":{"0":",","1":667,"type":"tcon"},"1":{"0":{"0":"list","1":670,"type":"tcon"},"1":{"0":"type","1":671,"type":"tcon"},"2":669,"type":"tapp"},"2":666,"type":"tapp"},"1":{"0":"int","1":4901,"type":"tcon"},"2":666,"type":"tapp"},"2":666,"type":"tapp"},"2":666,"type":"tapp"},"2":664,"type":"tapp"},"1":{"0":{"0":"int","1":5063,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":661,"type":","},"type":","},"type":","},"1":{"0":{"0":"tdef","1":{"0":673,"1":{"0":{"0":{"0":"string","1":674,"type":"tcon"},"1":{"0":{"0":"int","1":6414,"type":"tcon"},"1":{"0":{"0":"expr","1":675,"type":"tcon"},"1":{"0":{"0":"int","1":5064,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":672,"type":","},"type":","},"type":","},"1":{"0":{"0":"texpr","1":{"0":677,"1":{"0":{"0":{"0":"expr","1":678,"type":"tcon"},"1":{"0":{"0":"int","1":5065,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":676,"type":","},"type":","},"type":","},"1":{"0":{"0":"ttypealias","1":{"0":6516,"1":{"0":{"type":"nil"},"1":6515,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"4":568,"type":"tdeftype"}, $env)
const {"nil": nil,"cons": cons} = $env.evaluateStmt({"0":"list","1":598,"2":{"0":{"0":"a","1":600,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"nil","1":{"0":616,"1":{"0":{"type":"nil"},"1":614,"type":","},"type":","},"type":","},"1":{"0":{"0":"cons","1":{"0":604,"1":{"0":{"0":{"0":"a","1":606,"type":"tcon"},"1":{"0":{"0":{"0":"list","1":610,"type":"tcon"},"1":{"0":"a","1":612,"type":"tcon"},"2":608,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":602,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":590,"type":"tdeftype"}, $env)
const join = $env.evaluateStmt({"0":"join","1":2012,"2":{"0":{"0":{"0":"sep","1":2016,"type":"pvar"},"1":{"0":{"0":"items","1":2018,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":{"0":"items","1":2024,"type":"evar"},"1":{"0":{"0":{"0":"nil","1":2026,"2":{"type":"nil"},"3":2026,"type":"pcon"},"1":{"0":"","1":{"type":"nil"},"2":2028,"type":"estr"},"type":","},"1":{"0":{"0":{"0":"cons","1":2032,"2":{"0":{"0":"one","1":2034,"type":"pvar"},"1":{"0":{"0":"rest","1":2036,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":2032,"type":"pcon"},"1":{"0":{"0":"rest","1":2180,"type":"evar"},"1":{"0":{"0":{"0":"nil","1":2182,"2":{"type":"nil"},"3":2182,"type":"pcon"},"1":{"0":"one","1":2184,"type":"evar"},"type":","},"1":{"0":{"0":{"0":2188,"type":"pany"},"1":{"0":"","1":{"0":{"0":{"0":"one","1":4812,"type":"evar"},"1":{"0":"","1":4813,"type":","},"type":","},"1":{"0":{"0":{"0":"sep","1":4810,"type":"evar"},"1":{"0":"","1":4811,"type":","},"type":","},"1":{"0":{"0":{"0":{"0":"join","1":4816,"type":"evar"},"1":{"0":{"0":"sep","1":4817,"type":"evar"},"1":{"0":{"0":"rest","1":4818,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4814,"type":"eapp"},"1":{"0":"","1":4815,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":4808,"type":"estr"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2176,"type":"ematch"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2020,"type":"ematch"},"2":2008,"type":"elambda"},"3":2008,"type":"tdef"}, $env)
const map = $env.evaluateStmt({"0":"map","1":2252,"2":{"0":{"0":{"0":"values","1":2262,"type":"pvar"},"1":{"0":{"0":"f","1":2264,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":{"0":"values","1":2270,"type":"evar"},"1":{"0":{"0":{"0":"nil","1":2272,"2":{"type":"nil"},"3":2272,"type":"pcon"},"1":{"0":"nil","1":2274,"type":"evar"},"type":","},"1":{"0":{"0":{"0":"cons","1":2276,"2":{"0":{"0":"one","1":2278,"type":"pvar"},"1":{"0":{"0":"rest","1":2280,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":2276,"type":"pcon"},"1":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":{"0":"f","1":2292,"type":"evar"},"1":{"0":{"0":"one","1":2294,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":2290,"type":"eapp"},"1":{"0":{"0":{"0":"map","1":2304,"type":"evar"},"1":{"0":{"0":"rest","1":2306,"type":"evar"},"1":{"0":{"0":"f","1":2308,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2296,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2266,"type":"ematch"},"2":2248,"type":"elambda"},"3":2248,"type":"tdef"}, $env)
const foldl = $env.evaluateStmt({"0":"foldl","1":2316,"2":{"0":{"0":{"0":"init","1":2320,"type":"pvar"},"1":{"0":{"0":"items","1":2322,"type":"pvar"},"1":{"0":{"0":"f","1":2324,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":{"0":{"0":"items","1":2330,"type":"evar"},"1":{"0":{"0":{"0":"nil","1":2332,"2":{"type":"nil"},"3":2332,"type":"pcon"},"1":{"0":"init","1":2334,"type":"evar"},"type":","},"1":{"0":{"0":{"0":"cons","1":2336,"2":{"0":{"0":"one","1":2338,"type":"pvar"},"1":{"0":{"0":"rest","1":2340,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":2336,"type":"pcon"},"1":{"0":{"0":"foldl","1":2354,"type":"evar"},"1":{"0":{"0":{"0":"f","1":2358,"type":"evar"},"1":{"0":{"0":"init","1":2360,"type":"evar"},"1":{"0":{"0":"one","1":2362,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2356,"type":"eapp"},"1":{"0":{"0":"rest","1":2364,"type":"evar"},"1":{"0":{"0":"f","1":2366,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":2352,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2326,"type":"ematch"},"2":2312,"type":"elambda"},"3":2312,"type":"tdef"}, $env)
const mapi = $env.evaluateStmt({"0":"mapi","1":2431,"2":{"0":{"0":{"0":"i","1":2433,"type":"pvar"},"1":{"0":{"0":"values","1":2460,"type":"pvar"},"1":{"0":{"0":"f","1":2434,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":{"0":{"0":"values","1":2437,"type":"evar"},"1":{"0":{"0":{"0":"nil","1":2438,"2":{"type":"nil"},"3":2438,"type":"pcon"},"1":{"0":"nil","1":2439,"type":"evar"},"type":","},"1":{"0":{"0":{"0":"cons","1":2440,"2":{"0":{"0":"one","1":2441,"type":"pvar"},"1":{"0":{"0":"rest","1":2442,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":2440,"type":"pcon"},"1":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":{"0":"f","1":2448,"type":"evar"},"1":{"0":{"0":"i","1":2449,"type":"evar"},"1":{"0":{"0":"one","1":2462,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2447,"type":"eapp"},"1":{"0":{"0":{"0":"mapi","1":2454,"type":"evar"},"1":{"0":{"0":{"0":"+","1":2466,"type":"evar"},"1":{"0":{"0":{"0":1,"1":2468,"type":"pint"},"1":2468,"type":"eprim"},"1":{"0":{"0":"i","1":2470,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2464,"type":"eapp"},"1":{"0":{"0":"rest","1":2455,"type":"evar"},"1":{"0":{"0":"f","1":2456,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":2450,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2435,"type":"ematch"},"2":2402,"type":"elambda"},"3":2402,"type":"tdef"}, $env)
const foldr = $env.evaluateStmt({"0":"foldr","1":2685,"2":{"0":{"0":{"0":"init","1":2687,"type":"pvar"},"1":{"0":{"0":"items","1":2688,"type":"pvar"},"1":{"0":{"0":"f","1":2689,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":{"0":{"0":"items","1":2692,"type":"evar"},"1":{"0":{"0":{"0":"nil","1":2693,"2":{"type":"nil"},"3":2693,"type":"pcon"},"1":{"0":"init","1":2694,"type":"evar"},"type":","},"1":{"0":{"0":{"0":"cons","1":2695,"2":{"0":{"0":"one","1":2696,"type":"pvar"},"1":{"0":{"0":"rest","1":2697,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":2695,"type":"pcon"},"1":{"0":{"0":"f","1":2712,"type":"evar"},"1":{"0":{"0":{"0":"foldr","1":2716,"type":"evar"},"1":{"0":{"0":"init","1":2718,"type":"evar"},"1":{"0":{"0":"rest","1":2720,"type":"evar"},"1":{"0":{"0":"f","1":2722,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":2714,"type":"eapp"},"1":{"0":{"0":"one","1":2724,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2710,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2690,"type":"ematch"},"2":2658,"type":"elambda"},"3":2658,"type":"tdef"}, $env)
const replaces = $env.evaluateStmt({"0":"replaces","1":2870,"2":{"0":{"0":{"0":"target","1":2874,"type":"pvar"},"1":{"0":{"0":"repl","1":2876,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":{"0":"repl","1":2882,"type":"evar"},"1":{"0":{"0":{"0":"nil","1":2884,"2":{"type":"nil"},"3":2884,"type":"pcon"},"1":{"0":"target","1":2886,"type":"evar"},"type":","},"1":{"0":{"0":{"0":"cons","1":2952,"2":{"0":{"0":"one","1":2954,"type":"pvar"},"1":{"0":{"0":"rest","1":2956,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":2952,"type":"pcon"},"1":{"0":{"0":"one","1":2968,"type":"evar"},"1":{"0":{"0":{"0":",","1":2972,"2":{"0":{"0":"find","1":2974,"type":"pvar"},"1":{"0":{"0":"nw","1":2976,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":2970,"type":"pcon"},"1":{"0":{"0":"replaces","1":2986,"type":"evar"},"1":{"0":{"0":{"0":"replace-all","1":2988,"type":"evar"},"1":{"0":{"0":"target","1":2989,"type":"evar"},"1":{"0":{"0":"find","1":2990,"type":"evar"},"1":{"0":{"0":"nw","1":2991,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":2987,"type":"eapp"},"1":{"0":{"0":"rest","1":2992,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2978,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"2":2964,"type":"ematch"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2878,"type":"ematch"},"2":2864,"type":"elambda"},"3":2864,"type":"tdef"}, $env)
const constructor_fn = $env.evaluateStmt({"0":"constructor-fn","1":3122,"2":{"0":{"0":{"0":"name","1":3126,"type":"pvar"},"1":{"0":{"0":"args","1":3128,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":"({type: \\\"","1":{"0":{"0":{"0":"name","1":5405,"type":"evar"},"1":{"0":"\\\"","1":5406,"type":","},"type":","},"1":{"0":{"0":{"0":{"0":"join","1":5409,"type":"evar"},"1":{"0":{"0":"","1":{"type":"nil"},"2":5410,"type":"estr"},"1":{"0":{"0":{"0":"mapi","1":5413,"type":"evar"},"1":{"0":{"0":{"0":0,"1":5414,"type":"pint"},"1":5414,"type":"eprim"},"1":{"0":{"0":"args","1":5415,"type":"evar"},"1":{"0":{"0":{"0":{"0":"i","1":5419,"type":"pvar"},"1":{"0":{"0":"arg","1":5420,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":", ","1":{"0":{"0":{"0":{"0":"int-to-string","1":5425,"type":"evar"},"1":{"0":{"0":"i","1":5426,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5423,"type":"eapp"},"1":{"0":": ","1":5424,"type":","},"type":","},"1":{"0":{"0":{"0":"arg","1":5432,"type":"evar"},"1":{"0":"","1":5433,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5421,"type":"estr"},"2":5416,"type":"elambda"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":5412,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5407,"type":"eapp"},"1":{"0":"})","1":5408,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5403,"type":"estr"},"2":3118,"type":"elambda"},"3":3118,"type":"tdef"}, $env)
const {"eprim": eprim,"estr": estr,"evar": evar,"equot": equot,"elambda": elambda,"eapp": eapp,"elet": elet,"ematch": ematch} = $env.evaluateStmt({"0":"expr","1":4724,"2":{"type":"nil"},"3":{"0":{"0":"eprim","1":{"0":4727,"1":{"0":{"0":{"0":"prim","1":4728,"type":"tcon"},"1":{"0":{"0":"int","1":4729,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":4726,"type":","},"type":","},"type":","},"1":{"0":{"0":"estr","1":{"0":4732,"1":{"0":{"0":{"0":"string","1":4733,"type":"tcon"},"1":{"0":{"0":{"0":"list","1":4735,"type":"tcon"},"1":{"0":{"0":{"0":",","1":4737,"type":"tcon"},"1":{"0":"expr","1":4738,"type":"tcon"},"2":4736,"type":"tapp"},"1":{"0":{"0":{"0":",","1":4737,"type":"tcon"},"1":{"0":"string","1":4739,"type":"tcon"},"2":4736,"type":"tapp"},"1":{"0":"int","1":4740,"type":"tcon"},"2":4736,"type":"tapp"},"2":4736,"type":"tapp"},"2":4734,"type":"tapp"},"1":{"0":{"0":"int","1":4741,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4731,"type":","},"type":","},"type":","},"1":{"0":{"0":"evar","1":{"0":4744,"1":{"0":{"0":{"0":"string","1":4745,"type":"tcon"},"1":{"0":{"0":"int","1":4746,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":4743,"type":","},"type":","},"type":","},"1":{"0":{"0":"equot","1":{"0":4749,"1":{"0":{"0":{"0":"quot","1":4750,"type":"tcon"},"1":{"0":{"0":"int","1":4751,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":4748,"type":","},"type":","},"type":","},"1":{"0":{"0":"elambda","1":{"0":4754,"1":{"0":{"0":{"0":{"0":"list","1":4756,"type":"tcon"},"1":{"0":"pat","1":4757,"type":"tcon"},"2":4755,"type":"tapp"},"1":{"0":{"0":"expr","1":4758,"type":"tcon"},"1":{"0":{"0":"int","1":4759,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4753,"type":","},"type":","},"type":","},"1":{"0":{"0":"eapp","1":{"0":4762,"1":{"0":{"0":{"0":"expr","1":4763,"type":"tcon"},"1":{"0":{"0":{"0":"list","1":4765,"type":"tcon"},"1":{"0":"expr","1":4766,"type":"tcon"},"2":4764,"type":"tapp"},"1":{"0":{"0":"int","1":4767,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4761,"type":","},"type":","},"type":","},"1":{"0":{"0":"elet","1":{"0":4770,"1":{"0":{"0":{"0":{"0":"list","1":4772,"type":"tcon"},"1":{"0":{"0":{"0":",","1":4774,"type":"tcon"},"1":{"0":"pat","1":4775,"type":"tcon"},"2":4773,"type":"tapp"},"1":{"0":"expr","1":4776,"type":"tcon"},"2":4773,"type":"tapp"},"2":4771,"type":"tapp"},"1":{"0":{"0":"expr","1":4777,"type":"tcon"},"1":{"0":{"0":"int","1":4778,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4769,"type":","},"type":","},"type":","},"1":{"0":{"0":"ematch","1":{"0":4781,"1":{"0":{"0":{"0":"expr","1":4782,"type":"tcon"},"1":{"0":{"0":{"0":"list","1":4784,"type":"tcon"},"1":{"0":{"0":{"0":",","1":4786,"type":"tcon"},"1":{"0":"pat","1":4787,"type":"tcon"},"2":4785,"type":"tapp"},"1":{"0":"expr","1":4788,"type":"tcon"},"2":4785,"type":"tapp"},"2":4783,"type":"tapp"},"1":{"0":{"0":"int","1":5279,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4780,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"4":4720,"type":"tdeftype"}, $env)
const {"quot/expr": quot$slexpr,"quot/top": quot$sltop,"quot/type": quot$sltype,"quot/pat": quot$slpat,"quot/quot": quot$slquot} = $env.evaluateStmt({"0":"quot","1":4791,"2":{"type":"nil"},"3":{"0":{"0":"quot/expr","1":{"0":4793,"1":{"0":{"0":{"0":"expr","1":4794,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":4792,"type":","},"type":","},"type":","},"1":{"0":{"0":"quot/top","1":{"0":4796,"1":{"0":{"0":{"0":"top","1":4797,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":4795,"type":","},"type":","},"type":","},"1":{"0":{"0":"quot/type","1":{"0":4799,"1":{"0":{"0":{"0":"type","1":4800,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":4798,"type":","},"type":","},"type":","},"1":{"0":{"0":"quot/pat","1":{"0":4802,"1":{"0":{"0":{"0":"pat","1":4803,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":4801,"type":","},"type":","},"type":","},"1":{"0":{"0":"quot/quot","1":{"0":4805,"1":{"0":{"0":{"0":"cst","1":4806,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":4804,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"4":4789,"type":"tdeftype"}, $env)
const {"cst/identifier": cst$slidentifier,"cst/list": cst$sllist,"cst/array": cst$slarray,"cst/record": cst$slrecord,"cst/spread": cst$slspread,"cst/string": cst$slstring} = $env.evaluateStmt({"0":"cst","1":4822,"2":{"type":"nil"},"3":{"0":{"0":"cst/identifier","1":{"0":4824,"1":{"0":{"0":{"0":"string","1":4825,"type":"tcon"},"1":{"0":{"0":"int","1":4826,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":4823,"type":","},"type":","},"type":","},"1":{"0":{"0":"cst/list","1":{"0":4828,"1":{"0":{"0":{"0":{"0":"list","1":4830,"type":"tcon"},"1":{"0":"cst","1":4831,"type":"tcon"},"2":4829,"type":"tapp"},"1":{"0":{"0":"int","1":4832,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":4827,"type":","},"type":","},"type":","},"1":{"0":{"0":"cst/array","1":{"0":4834,"1":{"0":{"0":{"0":{"0":"list","1":4836,"type":"tcon"},"1":{"0":"cst","1":4837,"type":"tcon"},"2":4835,"type":"tapp"},"1":{"0":{"0":"int","1":4838,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":4833,"type":","},"type":","},"type":","},"1":{"0":{"0":"cst/record","1":{"0":4840,"1":{"0":{"0":{"0":{"0":"list","1":4842,"type":"tcon"},"1":{"0":"cst","1":4843,"type":"tcon"},"2":4841,"type":"tapp"},"1":{"0":{"0":"int","1":4844,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":4839,"type":","},"type":","},"type":","},"1":{"0":{"0":"cst/spread","1":{"0":4846,"1":{"0":{"0":{"0":"cst","1":4847,"type":"tcon"},"1":{"0":{"0":"int","1":4848,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":4845,"type":","},"type":","},"type":","},"1":{"0":{"0":"cst/string","1":{"0":4850,"1":{"0":{"0":{"0":"string","1":4851,"type":"tcon"},"1":{"0":{"0":{"0":"list","1":4853,"type":"tcon"},"1":{"0":{"0":{"0":",","1":4855,"type":"tcon"},"1":{"0":"cst","1":4856,"type":"tcon"},"2":4854,"type":"tapp"},"1":{"0":{"0":{"0":",","1":4855,"type":"tcon"},"1":{"0":"string","1":4857,"type":"tcon"},"2":4854,"type":"tapp"},"1":{"0":"int","1":4858,"type":"tcon"},"2":4854,"type":"tapp"},"2":4854,"type":"tapp"},"2":4852,"type":"tapp"},"1":{"0":{"0":"int","1":4859,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4849,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"4":4819,"type":"tdeftype"}, $env)
const maybe_parens = $env.evaluateStmt({"0":"maybe-parens","1":5119,"2":{"0":{"0":{"0":"inner","1":5123,"type":"pvar"},"1":{"0":{"0":"parens","1":5124,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":{"0":"parens","1":5127,"type":"evar"},"1":{"0":{"0":{"0":{"0":true,"1":5125,"type":"pbool"},"1":5125,"type":"pprim"},"1":{"0":"(","1":{"0":{"0":{"0":"inner","1":5130,"type":"evar"},"1":{"0":")","1":5131,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"2":5128,"type":"estr"},"type":","},"1":{"0":{"0":{"0":5125,"type":"pany"},"1":{"0":"inner","1":5132,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"ematch"},"2":5116,"type":"elambda"},"3":5116,"type":"tdef"}, $env)
const needs_parens = $env.evaluateStmt({"0":"needs-parens","1":5136,"2":{"0":{"0":{"0":"expr","1":5138,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"expr","1":5141,"type":"evar"},"1":{"0":{"0":{"0":"elambda","1":5143,"2":{"0":{"0":5144,"type":"pany"},"1":{"0":{"0":5145,"type":"pany"},"1":{"0":{"0":5146,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"3":5142,"type":"pcon"},"1":{"0":{"0":true,"1":5147,"type":"pbool"},"1":5147,"type":"eprim"},"type":","},"1":{"0":{"0":{"0":"eprim","1":5149,"2":{"0":{"0":5150,"type":"pany"},"1":{"0":{"0":5151,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5148,"type":"pcon"},"1":{"0":{"0":true,"1":5152,"type":"pbool"},"1":5152,"type":"eprim"},"type":","},"1":{"0":{"0":{"0":5153,"type":"pany"},"1":{"0":{"0":false,"1":5154,"type":"pbool"},"1":5154,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":5139,"type":"ematch"},"2":5133,"type":"elambda"},"3":5133,"type":"tdef"}, $env)
const compile_quot = $env.evaluateStmt({"0":"compile-quot","1":5308,"2":{"0":{"0":{"0":"quot","1":5310,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"quot","1":5313,"type":"evar"},"1":{"0":{"0":{"0":"quot/quot","1":5315,"2":{"0":{"0":"x","1":5316,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"3":5314,"type":"pcon"},"1":{"0":{"0":"jsonify","1":5318,"type":"evar"},"1":{"0":{"0":"x","1":5319,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5317,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"quot/expr","1":5321,"2":{"0":{"0":"x","1":5322,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"3":5320,"type":"pcon"},"1":{"0":{"0":"jsonify","1":5324,"type":"evar"},"1":{"0":{"0":"x","1":5325,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5323,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"quot/top","1":5327,"2":{"0":{"0":"x","1":5328,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"3":5326,"type":"pcon"},"1":{"0":{"0":"jsonify","1":5330,"type":"evar"},"1":{"0":{"0":"x","1":5331,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5329,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"quot/pat","1":5334,"2":{"0":{"0":"x","1":5335,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"3":5333,"type":"pcon"},"1":{"0":{"0":"jsonify","1":5337,"type":"evar"},"1":{"0":{"0":"x","1":5338,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5336,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"quot/type","1":5340,"2":{"0":{"0":"x","1":5341,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"3":5339,"type":"pcon"},"1":{"0":{"0":"jsonify","1":5343,"type":"evar"},"1":{"0":{"0":"x","1":5344,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5342,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"2":5311,"type":"ematch"},"2":5305,"type":"elambda"},"3":5305,"type":"tdef"}, $env)
const compile_prim = $env.evaluateStmt({"0":"compile-prim","1":5391,"2":{"0":{"0":{"0":"prim","1":5393,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"prim","1":1754,"type":"evar"},"1":{"0":{"0":{"0":"pint","1":1773,"2":{"0":{"0":"int","1":1774,"type":"pvar"},"1":{"0":{"0":5380,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":1772,"type":"pcon"},"1":{"0":{"0":"int-to-string","1":1776,"type":"evar"},"1":{"0":{"0":"int","1":1777,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":1775,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"pbool","1":1779,"2":{"0":{"0":"bool","1":1780,"type":"pvar"},"1":{"0":{"0":5381,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":1778,"type":"pcon"},"1":{"0":{"0":"bool","1":1783,"type":"evar"},"1":{"0":{"0":{"0":{"0":true,"1":4075,"type":"pbool"},"1":4075,"type":"pprim"},"1":{"0":"true","1":{"type":"nil"},"2":1784,"type":"estr"},"type":","},"1":{"0":{"0":{"0":{"0":false,"1":4076,"type":"pbool"},"1":4076,"type":"pprim"},"1":{"0":"false","1":{"type":"nil"},"2":1786,"type":"estr"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":1781,"type":"ematch"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":1752,"type":"ematch"},"2":5389,"type":"elambda"},"3":5389,"type":"tdef"}, $env)
const indices = $env.evaluateStmt({"0":"indices","1":5496,"2":{"0":{"0":{"0":"lst","1":5506,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"mapi","1":5502,"type":"evar"},"1":{"0":{"0":{"0":0,"1":5504,"type":"pint"},"1":5504,"type":"eprim"},"1":{"0":{"0":"lst","1":5505,"type":"evar"},"1":{"0":{"0":{"0":{"0":"i","1":5510,"type":"pvar"},"1":{"0":{"0":5511,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":"i","1":5512,"type":"evar"},"2":5507,"type":"elambda"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":5501,"type":"eapp"},"2":5492,"type":"elambda"},"3":5492,"type":"tdef"}, $env)
const concat = $env.evaluateStmt({"0":"concat","1":5740,"2":{"0":{"0":{"0":"lsts","1":5742,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"lsts","1":5745,"type":"evar"},"1":{"0":{"0":{"0":"nil","1":5746,"2":{"type":"nil"},"3":5746,"type":"pcon"},"1":{"0":"nil","1":5748,"type":"evar"},"type":","},"1":{"0":{"0":{"0":"cons","1":5749,"2":{"0":{"0":"one","1":5759,"type":"pvar"},"1":{"0":{"0":"nil","1":5749,"2":{"type":"nil"},"3":5749,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5749,"type":"pcon"},"1":{"0":"one","1":5751,"type":"evar"},"type":","},"1":{"0":{"0":{"0":"cons","1":5885,"2":{"0":{"0":"nil","1":5886,"2":{"type":"nil"},"3":5886,"type":"pcon"},"1":{"0":{"0":"rest","1":5887,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5885,"type":"pcon"},"1":{"0":{"0":"concat","1":5892,"type":"evar"},"1":{"0":{"0":"rest","1":5893,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5891,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"cons","1":5752,"2":{"0":{"0":"cons","1":5753,"2":{"0":{"0":"one","1":5754,"type":"pvar"},"1":{"0":{"0":"rest","1":5755,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5753,"type":"pcon"},"1":{"0":{"0":"lsts","1":5766,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5752,"type":"pcon"},"1":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":"one","1":5774,"type":"evar"},"1":{"0":{"0":{"0":"concat","1":5771,"type":"evar"},"1":{"0":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":"rest","1":5777,"type":"evar"},"1":{"0":{"0":"lsts","1":5778,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"2":5770,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"2":5743,"type":"ematch"},"2":5737,"type":"elambda"},"3":5737,"type":"tdef"}, $env)
const {"some": some,"none": none} = $env.evaluateStmt({"0":"option","1":6040,"2":{"0":{"0":"a","1":6041,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"some","1":{"0":6043,"1":{"0":{"0":{"0":"a","1":6044,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":6042,"type":","},"type":","},"type":","},"1":{"0":{"0":"none","1":{"0":6046,"1":{"0":{"type":"nil"},"1":6045,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":6036,"type":"tdeftype"}, $env)
const m = $env.evaluateStmt({"0":"m","1":6532,"2":{"0":{"0":"jsonify","1":6534,"type":"evar"},"1":{"0":{"0":{"0":1,"1":6535,"type":"pint"},"1":6535,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":6533,"type":"eapp"},"3":6529,"type":"tdef"}, $env)
const {",": $co} = $env.evaluateStmt({"0":",","1":6540,"2":{"0":{"0":"a","1":6541,"type":","},"1":{"0":{"0":"b","1":6542,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",","1":{"0":6544,"1":{"0":{"0":{"0":"a","1":6545,"type":"tcon"},"1":{"0":{"0":"b","1":6546,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":6543,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":6536,"type":"tdeftype"}, $env)
const builtins = $env.evaluateStmt({"0":"builtins","1":6567,"2":{"0":"function equal(a, b) {\n    if (a === b) return true;\n\n    if (a && b && typeof a == 'object' && typeof b == 'object') {\n        var length, i, keys;\n        if (Array.isArray(a)) {\n            length = a.length;\n            if (length != b.length) return false;\n            for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false;\n            return true;\n        }\n\n        keys = Object.keys(a);\n        length = keys.length;\n        if (length !== Object.keys(b).length) return false;\n\n        for (i = length; i-- !== 0; ) {\n            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;\n        }\n\n        for (i = length; i-- !== 0; ) {\n            var key = keys[i];\n\n            if (!equal(a[key], b[key])) return false;\n        }\n\n        return true;\n    }\n\n    // true if both NaN, false otherwise\n    return a !== a && b !== b;\n}\n\nfunction unescapeString(n) {\n    if (n == null || !n.replaceAll) {\n        debugger;\n        return '';\n    }\n    return n.replaceAll(/\\\\\\\\./g, (m) => {\n        if (m[1] === 'n') {\n            return '\\\\n';\n        }\n        if (m[1] === 't') {\n            return '\\\\t';\n        }\n        if (m[1] === 'r') {\n            return '\\\\r';\n        }\n        return m[1];\n    });\n}\n\nfunction unwrapList(v) {\n    return v.type === 'nil' ? [] : [v[0], ...unwrapList(v[1])];\n}\n\nfunction wrapList(v) {\n    let res = { type: 'nil' };\n    for (let i = v.length - 1; i >= 0; i--) {\n        res = { type: 'cons', 0: v[i], 1: res };\n    }\n    return res;\n}\n\nconst sanMap = {\n    // '$$$$' gets interpreted by replaceAll as '$$', for reasons\n    $: '$$$$',\n    '-': '_',\n    '+': '$pl',\n    '*': '$ti',\n    '=': '$eq',\n    '>': '$gt',\n    '<': '$lt',\n    \"'\": '$qu',\n    '\"': '$dq',\n    ',': '$co',\n    '/': '$sl',\n    ';': '$semi',\n    '@': '$at',\n    ':': '$cl',\n    '#': '$ha',\n    '!': '$ex',\n    '|': '$bar',\n    '()': '$unit',\n    '?': '$qe',\n  };\nconst kwds =\n    'case new var const let if else return super break while for default eval'.split(' ');\n\n// Convert an identifier into a valid js identifier, replacing special characters, and accounting for keywords.\nfunction sanitize(raw) {\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    if (kwds.includes(raw)) return '$' + raw\n    return raw\n}\n\nconst valueToString = (v) => {\n    if (Array.isArray(v)) {\n        return `[${v.map(valueToString).join(', ')}]`;\n    }\n    if (typeof v === 'object' && v && 'type' in v) {\n        if (v.type === 'cons' || v.type === 'nil') {\n            const un = unwrapList(v);\n            return '[' + un.map(valueToString).join(' ') + ']';\n        }\n\n        let args = [];\n        for (let i = 0; i in v; i++) {\n            args.push(v[i]);\n        }\n        return `(${v.type}${args\n            .map((arg) => ' ' + valueToString(arg))\n            .join('')})`;\n    }\n    if (typeof v === 'string') {\n        if (v.includes('\"') && !v.includes(\"'\")) {\n            return (\n                \"'\" + JSON.stringify(v).slice(1, -1).replace(/\\\\\"/g, '\"') + \"'\"\n            );\n        }\n        return JSON.stringify(v);\n    }\n    if (typeof v === 'function') {\n        return '<function>';\n    }\n\n    return '' + v;\n};\n\nreturn {\n    '+': (a) => (b) => a + b,\n    '-': (a) => (b) => a - b,\n    '<': (a) => (b) => a < b,\n    '<=': (a) => (b) => a <= b,\n    '>': (a) => (b) => a > b,\n    '>=': (a) => (b) => a >= b,\n    '=': (a) => (b) => equal(a, b),\n    '!=': (a) => (b) => !equal(a, b),\n    pi: Math.PI,\n    'replace-all': a => b => c => a.replaceAll(b, c),\n    eval: source => {\n      return new Function('', 'return ' + source)();\n    },\n    'eval-with': ctx => source => {\n      const args = '{' + Object.keys(ctx).join(',') + '}'\n      return new Function(args, 'return ' + source)(ctx);\n    },\n    $unit: null,\n    errorToString: f => arg => {\n      try {\n        return f(arg)\n      } catch (err) {\n        return err.message;\n      }\n    },\n    valueToString,\n    unescapeString,\n    sanitize,\n    equal: a => b => equal(a, b),\n    'int-to-string': (a) => a.toString(),\n    'string-to-int': (a) => {\n        const v = Number(a);\n        return Number.isInteger(v) ? { type: 'some', 0: v } : { type: 'none' };\n    },\n    'string-to-float': (a) => {\n        const v = Number(a);\n        return Number.isFinite(v) ? { type: 'some', 0: v } : { type: 'none' };\n    },\n\n    // maps\n    'map/nil': [],\n    'map/set': (map) => (key) => (value) =>\n        [[key, value], ...map.filter((i) => i[0] !== key)],\n    'map/rm': (map) => (key) => map.filter((i) => !equal(i[0], key)),\n    'map/get': (map) => (key) => {\n        const found = map.find((i) => equal(i[0], key));\n        return found ? { type: 'some', 0: found[1] } : { type: 'none' };\n    },\n    'map/map': (fn) => (map) => map.map(([k, v]) => [k, fn(v)]),\n    'map/merge': (one) => (two) =>\n        [...one, ...two.filter(([key]) => !one.find(([a]) => equal(a, key)))],\n    'map/values': (map) => wrapList(map.map((item) => item[1])),\n    'map/keys': (map) => wrapList(map.map((item) => item[0])),\n    'map/from-list': (list) =>\n        unwrapList(list).map((pair) => [pair[0], pair[1]]),\n    'map/to-list': (map) =>\n        wrapList(map.map(([key, value]) => ({ type: ',', 0: key, 1: value }))),\n\n    // sets\n    'set/nil': [],\n    'set/add': (s) => (v) => [v, ...s.filter((m) => !equal(v, m))],\n    'set/has': (s) => (v) => s.includes(v),\n    'set/rm': (s) => (v) => s.filter((i) => !equal(i, v)),\n    // NOTE this is only working for primitives\n    'set/diff': (a) => (b) => a.filter((i) => !b.some((j) => equal(i, j))),\n    'set/merge': (a) => (b) =>\n        [...a, ...b.filter((x) => !a.some((y) => equal(y, x)))],\n    'set/overlap': (a) => (b) => a.filter((x) => b.some((y) => equal(y, x))),\n    'set/to-list': wrapList,\n    'set/from-list': (s) => {\n        const res = [];\n        unwrapList(s).forEach((item) => {\n            if (res.some((m) => equal(item, m))) {\n                return;\n            }\n            res.push(item);\n        });\n        return res;\n    },\n\n    // Various debugging stuff\n    jsonify: (v) => JSON.stringify(v) ?? 'undefined',\n    fatal: (message) => {\n        throw new Error(\\`Fatal runtime: \\${message}\\`);\n    },\n}","1":{"type":"nil"},"2":6564,"type":"estr"},"3":6565,"type":"tdef"}, $env)
const builtins_for_eval = $env.evaluateStmt({"0":"builtins-for-eval","1":6593,"2":{"0":{"0":{"0":"eval","1":6576,"type":"evar"},"1":{"0":{"0":"builtins => sanitize => {\n  const san = {}\n  Object.keys(builtins).forEach(k => san[sanitize(k)] = builtins[k])\n  return san\n}","1":{"type":"nil"},"2":6577,"type":"estr"},"1":{"0":{"0":{"0":"eval","1":6573,"type":"evar"},"1":{"0":{"0":"(() => {","1":{"0":{"0":{"0":"builtins","1":6574,"type":"evar"},"1":{"0":"})()","1":6601,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"2":6599,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"2":6572,"type":"eapp"},"1":{"0":{"0":"sanitize","1":6588,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":6575,"type":"eapp"},"1":{"type":"nil"},"2":6568,"type":"eapp"},"3":6591,"type":"tdef"}, $env)
const eval_with_builtins = $env.evaluateStmt({"0":"eval-with-builtins","1":6597,"2":{"0":{"0":"eval-with","1":6603,"type":"evar"},"1":{"0":{"0":"builtins-for-eval","1":6604,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":6598,"type":"eapp"},"3":6594,"type":"tdef"}, $env)
const compile_pat_naive = $env.evaluateStmt({"0":"compile-pat-naive","1":4082,"2":{"0":{"0":{"0":"pat","1":4084,"type":"pvar"},"1":{"0":{"0":"target","1":4133,"type":"pvar"},"1":{"0":{"0":"inner","1":4134,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":{"0":{"0":"pat","1":4087,"type":"evar"},"1":{"0":{"0":{"0":"pany","1":4089,"2":{"0":{"0":5070,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"3":4088,"type":"pcon"},"1":{"0":"inner","1":4090,"type":"evar"},"type":","},"1":{"0":{"0":{"0":"pprim","1":4094,"2":{"0":{"0":"prim","1":4095,"type":"pvar"},"1":{"0":{"0":5071,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":4092,"type":"pcon"},"1":{"0":"if (","1":{"0":{"0":{"0":"target","1":4224,"type":"evar"},"1":{"0":" === ","1":4225,"type":","},"type":","},"1":{"0":{"0":{"0":{"0":"compile-prim","1":5384,"type":"evar"},"1":{"0":{"0":"prim","1":5385,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":4905,"type":"eapp"},"1":{"0":") {\\n","1":4139,"type":","},"type":","},"1":{"0":{"0":{"0":"inner","1":4140,"type":"evar"},"1":{"0":"\\n}","1":4141,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":4105,"type":"estr"},"type":","},"1":{"0":{"0":{"0":"pstr","1":4152,"2":{"0":{"0":"str","1":4153,"type":"pvar"},"1":{"0":{"0":5072,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":4148,"type":"pcon"},"1":{"0":"if (","1":{"0":{"0":{"0":"target","1":4230,"type":"evar"},"1":{"0":" === \\\"","1":4231,"type":","},"type":","},"1":{"0":{"0":{"0":"str","1":4156,"type":"evar"},"1":{"0":"\\\"){\\n","1":4157,"type":","},"type":","},"1":{"0":{"0":{"0":"inner","1":4158,"type":"evar"},"1":{"0":"\\n}","1":4159,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":4154,"type":"estr"},"type":","},"1":{"0":{"0":{"0":"pvar","1":4130,"2":{"0":{"0":"name","1":4131,"type":"pvar"},"1":{"0":{"0":5073,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":4129,"type":"pcon"},"1":{"0":"{\\nlet ","1":{"0":{"0":{"0":{"0":"sanitize","1":4473,"type":"evar"},"1":{"0":{"0":"name","1":4161,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":4472,"type":"eapp"},"1":{"0":" = ","1":4162,"type":","},"type":","},"1":{"0":{"0":{"0":"target","1":4228,"type":"evar"},"1":{"0":";\\n","1":4229,"type":","},"type":","},"1":{"0":{"0":{"0":"inner","1":4163,"type":"evar"},"1":{"0":"\\n}","1":4164,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":4132,"type":"estr"},"type":","},"1":{"0":{"0":{"0":"pcon","1":4166,"2":{"0":{"0":"name","1":4167,"type":"pvar"},"1":{"0":{"0":5303,"type":"pany"},"1":{"0":{"0":"args","1":4168,"type":"pvar"},"1":{"0":{"0":5074,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":4165,"type":"pcon"},"1":{"0":"if (","1":{"0":{"0":{"0":"target","1":4285,"type":"evar"},"1":{"0":".type === \\\"","1":4286,"type":","},"type":","},"1":{"0":{"0":{"0":"name","1":4287,"type":"evar"},"1":{"0":"\\\") {\\n","1":4288,"type":","},"type":","},"1":{"0":{"0":{"0":{"0":"pat-loop","1":4291,"type":"evar"},"1":{"0":{"0":"target","1":4914,"type":"evar"},"1":{"0":{"0":"args","1":4292,"type":"evar"},"1":{"0":{"0":{"0":0,"1":4293,"type":"pint"},"1":4293,"type":"eprim"},"1":{"0":{"0":"inner","1":4294,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"2":4289,"type":"eapp"},"1":{"0":"\\n}","1":4290,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":4283,"type":"estr"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"2":4085,"type":"ematch"},"2":4079,"type":"elambda"},"3":4079,"type":"tdef"}, $env)

const pat_loop = $env.evaluateStmt({"0":"pat-loop","1":4280,"2":{"0":{"0":{"0":"target","1":4255,"type":"pvar"},"1":{"0":{"0":"args","1":4302,"type":"pvar"},"1":{"0":{"0":"i","1":4256,"type":"pvar"},"1":{"0":{"0":"inner","1":4281,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":{"0":{"0":"args","1":4259,"type":"evar"},"1":{"0":{"0":{"0":"nil","1":4260,"2":{"type":"nil"},"3":4260,"type":"pcon"},"1":{"0":"inner","1":4261,"type":"evar"},"type":","},"1":{"0":{"0":{"0":"cons","1":4262,"2":{"0":{"0":"arg","1":4263,"type":"pvar"},"1":{"0":{"0":"rest","1":4264,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":4262,"type":"pcon"},"1":{"0":{"0":"compile-pat-naive","1":4269,"type":"evar"},"1":{"0":{"0":"arg","1":4270,"type":"evar"},"1":{"0":{"0":"","1":{"0":{"0":{"0":"target","1":4297,"type":"evar"},"1":{"0":"[","1":4298,"type":","},"type":","},"1":{"0":{"0":{"0":{"0":"int-to-string","1":4295,"type":"evar"},"1":{"0":{"0":"i","1":4904,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":4903,"type":"eapp"},"1":{"0":"]","1":4296,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4271,"type":"estr"},"1":{"0":{"0":{"0":"pat-loop","1":4274,"type":"evar"},"1":{"0":{"0":"target","1":4275,"type":"evar"},"1":{"0":{"0":"rest","1":4301,"type":"evar"},"1":{"0":{"0":{"0":"+","1":4277,"type":"evar"},"1":{"0":{"0":"i","1":4278,"type":"evar"},"1":{"0":{"0":{"0":1,"1":4279,"type":"pint"},"1":4279,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4276,"type":"eapp"},"1":{"0":{"0":"inner","1":4282,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"2":4273,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":4268,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4257,"type":"ematch"},"2":4251,"type":"elambda"},"3":4251,"type":"tdef"}, $env)
const compile_pat_list = $env.evaluateStmt({"0":"compile-pat-list","1":5663,"2":{"0":{"0":{"0":"pat","1":5665,"type":"pvar"},"1":{"0":{"0":"target","1":5666,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":{"0":"pat","1":5669,"type":"evar"},"1":{"0":{"0":{"0":"pany","1":5671,"2":{"0":{"0":5672,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"3":5670,"type":"pcon"},"1":{"0":{"0":",","1":5896,"type":"evar"},"1":{"0":{"0":"nil","1":5898,"type":"evar"},"1":{"0":{"0":"nil","1":5673,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5896,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"pprim","1":5676,"2":{"0":{"0":"prim","1":5677,"type":"pvar"},"1":{"0":{"0":5678,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5675,"type":"pcon"},"1":{"0":{"0":",","1":5899,"type":"evar"},"1":{"0":{"0":{"0":"cons","1":5732,"type":"evar"},"1":{"0":{"0":"","1":{"0":{"0":{"0":"target","1":5686,"type":"evar"},"1":{"0":" === ","1":5687,"type":","},"type":","},"1":{"0":{"0":{"0":{"0":"compile-prim","1":5691,"type":"evar"},"1":{"0":{"0":"prim","1":5692,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5688,"type":"eapp"},"1":{"0":"","1":5689,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5684,"type":"estr"},"1":{"0":{"0":"nil","1":5732,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5732,"type":"eapp"},"1":{"0":{"0":"nil","1":5902,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5899,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"pstr","1":5694,"2":{"0":{"0":"str","1":5695,"type":"pvar"},"1":{"0":{"0":5696,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5693,"type":"pcon"},"1":{"0":{"0":",","1":5903,"type":"evar"},"1":{"0":{"0":{"0":"cons","1":5733,"type":"evar"},"1":{"0":{"0":"","1":{"0":{"0":{"0":"target","1":5703,"type":"evar"},"1":{"0":" === \\\"","1":5704,"type":","},"type":","},"1":{"0":{"0":{"0":"str","1":5707,"type":"evar"},"1":{"0":"\\\"","1":5708,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5701,"type":"estr"},"1":{"0":{"0":"nil","1":5733,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5733,"type":"eapp"},"1":{"0":{"0":"nil","1":5905,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5903,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"pvar","1":5710,"2":{"0":{"0":"name","1":5711,"type":"pvar"},"1":{"0":{"0":5712,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5709,"type":"pcon"},"1":{"0":{"0":",","1":5906,"type":"evar"},"1":{"0":{"0":"nil","1":5908,"type":"evar"},"1":{"0":{"0":{"0":"cons","1":5734,"type":"evar"},"1":{"0":{"0":"let ","1":{"0":{"0":{"0":{"0":"sanitize","1":5722,"type":"evar"},"1":{"0":{"0":"name","1":5723,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5720,"type":"eapp"},"1":{"0":" = ","1":5721,"type":","},"type":","},"1":{"0":{"0":{"0":"target","1":5724,"type":"evar"},"1":{"0":";","1":5725,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5717,"type":"estr"},"1":{"0":{"0":"nil","1":5734,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5734,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5906,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"pcon","1":5727,"2":{"0":{"0":"name","1":5728,"type":"pvar"},"1":{"0":{"0":5729,"type":"pany"},"1":{"0":{"0":"args","1":5730,"type":"pvar"},"1":{"0":{"0":5894,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":5726,"type":"pcon"},"1":{"0":{"0":{"0":{"0":",","1":5917,"2":{"0":{"0":"check","1":5918,"type":"pvar"},"1":{"0":{"0":"assign","1":5919,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5916,"type":"pcon"},"1":{"0":{"0":"pat-loop-list","1":5921,"type":"evar"},"1":{"0":{"0":"target","1":5922,"type":"evar"},"1":{"0":{"0":"args","1":5923,"type":"evar"},"1":{"0":{"0":{"0":0,"1":5924,"type":"pint"},"1":5924,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":5920,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":",","1":5909,"type":"evar"},"1":{"0":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":"","1":{"0":{"0":{"0":"target","1":5787,"type":"evar"},"1":{"0":".type === \\\"","1":5788,"type":","},"type":","},"1":{"0":{"0":{"0":"name","1":5789,"type":"evar"},"1":{"0":"\\\"","1":5790,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5785,"type":"estr"},"1":{"0":{"0":"check","1":5792,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"1":{"0":{"0":"assign","1":5912,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5909,"type":"eapp"},"2":5913,"type":"elet"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"2":5667,"type":"ematch"},"2":5660,"type":"elambda"},"3":5660,"type":"tdef"}, $env)

const pat_loop_list = $env.evaluateStmt({"0":"pat-loop-list","1":5809,"2":{"0":{"0":{"0":"target","1":5813,"type":"pvar"},"1":{"0":{"0":"args","1":5814,"type":"pvar"},"1":{"0":{"0":"i","1":5815,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":{"0":{"0":"args","1":5818,"type":"evar"},"1":{"0":{"0":{"0":"nil","1":5819,"2":{"type":"nil"},"3":5819,"type":"pcon"},"1":{"0":{"0":",","1":5820,"type":"evar"},"1":{"0":{"0":"nil","1":5929,"type":"evar"},"1":{"0":{"0":"nil","1":5930,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5820,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"cons","1":5821,"2":{"0":{"0":"arg","1":5822,"type":"pvar"},"1":{"0":{"0":"rest","1":5823,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5821,"type":"pcon"},"1":{"0":{"0":{"0":{"0":",","1":5933,"2":{"0":{"0":"check","1":5934,"type":"pvar"},"1":{"0":{"0":"assign","1":5935,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5932,"type":"pcon"},"1":{"0":{"0":"compile-pat-list","1":5828,"type":"evar"},"1":{"0":{"0":"arg","1":5829,"type":"evar"},"1":{"0":{"0":"","1":{"0":{"0":{"0":"target","1":5832,"type":"evar"},"1":{"0":"[","1":5833,"type":","},"type":","},"1":{"0":{"0":{"0":{"0":"int-to-string","1":5836,"type":"evar"},"1":{"0":{"0":"i","1":5837,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5834,"type":"eapp"},"1":{"0":"]","1":5835,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5830,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5827,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":",","1":5939,"2":{"0":{"0":"c2","1":5940,"type":"pvar"},"1":{"0":{"0":"a2","1":5941,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5938,"type":"pcon"},"1":{"0":{"0":"pat-loop-list","1":5943,"type":"evar"},"1":{"0":{"0":"target","1":5944,"type":"evar"},"1":{"0":{"0":"rest","1":5945,"type":"evar"},"1":{"0":{"0":{"0":"+","1":5947,"type":"evar"},"1":{"0":{"0":"i","1":5948,"type":"evar"},"1":{"0":{"0":{"0":1,"1":5949,"type":"pint"},"1":5949,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5946,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":5942,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":{"0":",","1":5840,"type":"evar"},"1":{"0":{"0":{"0":"concat","1":5952,"type":"evar"},"1":{"0":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":"check","1":5954,"type":"evar"},"1":{"0":{"0":{"0":"cons","1":5953,"type":"evar"},"1":{"0":{"0":"c2","1":5955,"type":"evar"},"1":{"0":{"0":"nil","1":5953,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5953,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"2":5951,"type":"eapp"},"1":{"0":{"0":{"0":"concat","1":5957,"type":"evar"},"1":{"0":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":"assign","1":5959,"type":"evar"},"1":{"0":{"0":{"0":"cons","1":5958,"type":"evar"},"1":{"0":{"0":"a2","1":5960,"type":"evar"},"1":{"0":{"0":"nil","1":5958,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5958,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"2":5956,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5840,"type":"eapp"},"2":5855,"type":"elet"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5816,"type":"ematch"},"2":5806,"type":"elambda"},"3":5806,"type":"tdef"}, $env)
const escape_string = $env.evaluateStmt({"0":"escape-string","1":3310,"2":{"0":{"0":{"0":"string","1":3312,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"replaces","1":3316,"type":"evar"},"1":{"0":{"0":"string","1":3318,"type":"evar"},"1":{"0":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":{"0":",","1":3322,"type":"evar"},"1":{"0":{"0":"\\\\","1":{"type":"nil"},"2":3326,"type":"estr"},"1":{"0":{"0":"\\\\\\\\","1":{"type":"nil"},"2":3330,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":3322,"type":"eapp"},"1":{"0":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":{"0":",","1":3334,"type":"evar"},"1":{"0":{"0":"\\n","1":{"type":"nil"},"2":3338,"type":"estr"},"1":{"0":{"0":"\\\\n","1":{"type":"nil"},"2":3342,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":3334,"type":"eapp"},"1":{"0":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":{"0":",","1":3346,"type":"evar"},"1":{"0":{"0":"\\\"","1":{"type":"nil"},"2":3350,"type":"estr"},"1":{"0":{"0":"\\\\\"","1":{"type":"nil"},"2":3354,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":3346,"type":"eapp"},"1":{"0":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":{"0":",","1":4474,"type":"evar"},"1":{"0":{"0":"`","1":{"type":"nil"},"2":4476,"type":"estr"},"1":{"0":{"0":"\\\\`","1":{"type":"nil"},"2":4478,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4474,"type":"eapp"},"1":{"0":{"0":{"0":"cons","1":3320,"type":"evar"},"1":{"0":{"0":{"0":",","1":4480,"type":"evar"},"1":{"0":{"0":"$","1":{"type":"nil"},"2":4482,"type":"estr"},"1":{"0":{"0":"\\\\$","1":{"type":"nil"},"2":4484,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4480,"type":"eapp"},"1":{"0":{"0":"nil","1":3320,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":3320,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":3314,"type":"eapp"},"2":3306,"type":"elambda"},"3":3306,"type":"tdef"}, $env)
const pat_as_arg_inner = $env.evaluateStmt({"0":"pat-as-arg-inner","1":4929,"2":{"0":{"0":{"0":"pat","1":4931,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"pat","1":4934,"type":"evar"},"1":{"0":{"0":{"0":"pany","1":4936,"2":{"0":{"0":5075,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"3":4935,"type":"pcon"},"1":{"0":"none","1":4937,"type":"evar"},"type":","},"1":{"0":{"0":{"0":"pprim","1":4940,"2":{"0":{"0":4941,"type":"pany"},"1":{"0":{"0":5076,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":4939,"type":"pcon"},"1":{"0":"none","1":4942,"type":"evar"},"type":","},"1":{"0":{"0":{"0":"pstr","1":4956,"2":{"0":{"0":4957,"type":"pany"},"1":{"0":{"0":5077,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":4943,"type":"pcon"},"1":{"0":"none","1":4958,"type":"evar"},"type":","},"1":{"0":{"0":{"0":"pvar","1":4960,"2":{"0":{"0":"name","1":4961,"type":"pvar"},"1":{"0":{"0":5053,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":4959,"type":"pcon"},"1":{"0":{"0":"some","1":4963,"type":"evar"},"1":{"0":{"0":{"0":"sanitize","1":4964,"type":"evar"},"1":{"0":{"0":"name","1":5228,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5227,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"2":4962,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"pcon","1":4966,"2":{"0":{"0":4967,"type":"pany"},"1":{"0":{"0":5304,"type":"pany"},"1":{"0":{"0":"args","1":4968,"type":"pvar"},"1":{"0":{"0":5054,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":4965,"type":"pcon"},"1":{"0":{"0":{"0":"foldl","1":4970,"type":"evar"},"1":{"0":{"0":{"0":",","1":4971,"type":"evar"},"1":{"0":{"0":{"0":0,"1":4973,"type":"pint"},"1":4973,"type":"eprim"},"1":{"0":{"0":"nil","1":4974,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4971,"type":"eapp"},"1":{"0":{"0":"args","1":4975,"type":"evar"},"1":{"0":{"0":{"0":{"0":",","1":4981,"2":{"0":{"0":"i","1":4982,"type":"pvar"},"1":{"0":{"0":"res","1":4983,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":4980,"type":"pcon"},"1":{"0":{"0":"arg","1":4984,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":{"0":",","1":5004,"type":"evar"},"1":{"0":{"0":{"0":"+","1":5007,"type":"evar"},"1":{"0":{"0":"i","1":5008,"type":"evar"},"1":{"0":{"0":{"0":1,"1":5009,"type":"pint"},"1":5009,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5006,"type":"eapp"},"1":{"0":{"0":{"0":{"0":"pat-as-arg-inner","1":4988,"type":"evar"},"1":{"0":{"0":"arg","1":4989,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":4987,"type":"eapp"},"1":{"0":{"0":{"0":"none","1":4991,"2":{"type":"nil"},"3":4990,"type":"pcon"},"1":{"0":"res","1":4992,"type":"evar"},"type":","},"1":{"0":{"0":{"0":"some","1":4996,"2":{"0":{"0":"arg","1":4997,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"3":4995,"type":"pcon"},"1":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":"","1":{"0":{"0":{"0":{"0":"int-to-string","1":5036,"type":"evar"},"1":{"0":{"0":"i","1":5037,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5034,"type":"eapp"},"1":{"0":": ","1":5035,"type":","},"type":","},"1":{"0":{"0":{"0":"arg","1":4999,"type":"evar"},"1":{"0":"","1":5033,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5031,"type":"estr"},"1":{"0":{"0":"res","1":5000,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4985,"type":"ematch"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5004,"type":"eapp"},"2":4977,"type":"elambda"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":4969,"type":"eapp"},"1":{"0":{"0":{"0":",","1":5017,"2":{"0":{"0":5018,"type":"pany"},"1":{"0":{"0":"nil","1":5012,"2":{"type":"nil"},"3":5012,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5016,"type":"pcon"},"1":{"0":"none","1":5013,"type":"evar"},"type":","},"1":{"0":{"0":{"0":",","1":5014,"2":{"0":{"0":5020,"type":"pany"},"1":{"0":{"0":"args","1":5021,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5019,"type":"pcon"},"1":{"0":{"0":"some","1":5022,"type":"evar"},"1":{"0":{"0":"{","1":{"0":{"0":{"0":{"0":"join","1":5027,"type":"evar"},"1":{"0":{"0":", ","1":{"type":"nil"},"2":5028,"type":"estr"},"1":{"0":{"0":"args","1":5030,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5025,"type":"eapp"},"1":{"0":"}","1":5026,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"2":5023,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"2":5015,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5010,"type":"ematch"},"type":","},"1":{"0":{"0":{"0":5048,"type":"pany"},"1":{"0":{"0":"fatal","1":5050,"type":"evar"},"1":{"0":{"0":"No pat ","1":{"0":{"0":{"0":{"0":"jsonify","1":5238,"type":"evar"},"1":{"0":{"0":"pat","1":5241,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5240,"type":"eapp"},"1":{"0":"","1":5239,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"2":5051,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"2":5049,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"2":4932,"type":"ematch"},"2":4926,"type":"elambda"},"3":4926,"type":"tdef"}, $env)
{
    const test = $env.evaluate({"0":"pat-as-arg-inner","1":5580,"type":"evar"}, $env);
    
    const in_0 = $env.evaluate({"0":{"0":{"0":",","1":5587,"2":{"0":{"0":"a","1":5588,"type":"pvar"},"1":{"0":{"0":5589,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5586,"type":"pcon"},"type":"quot/pat"},"1":5584,"type":"equot"}, $env);
    const mod_0 = test(in_0);
    const out_0 = $env.evaluate({"0":{"0":"some","1":5592,"type":"evar"},"1":{"0":{"0":"{0: a}","1":{"type":"nil"},"2":5593,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"2":5591,"type":"eapp"}, $env);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (5577) failing 0. Not equal.`);
    }
    

    const in_1 = $env.evaluate({"0":{"0":{"0":5601,"type":"pany"},"type":"quot/pat"},"1":5597,"type":"equot"}, $env);
    const mod_1 = test(in_1);
    const out_1 = $env.evaluate({"0":{"0":"none","1":5603,"type":"evar"},"1":{"type":"nil"},"2":5602,"type":"eapp"}, $env);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (5577) failing 1. Not equal.`);
    }
    

    const in_2 = $env.evaluate({"0":{"0":{"0":"cons","1":5610,"2":{"0":{"0":"a","1":5611,"type":"pvar"},"1":{"0":{"0":"cons","1":5610,"2":{"0":{"0":{"0":2,"1":5620,"type":"pint"},"1":5620,"type":"pprim"},"1":{"0":{"0":"rest","1":5612,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5610,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5610,"type":"pcon"},"type":"quot/pat"},"1":5606,"type":"equot"}, $env);
    const mod_2 = test(in_2);
    const out_2 = $env.evaluate({"0":{"0":"some","1":5626,"type":"evar"},"1":{"0":{"0":"{1: {1: rest}, 0: a}","1":{"type":"nil"},"2":5627,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"2":5625,"type":"eapp"}, $env);
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (5577) failing 2. Not equal.`);
    }
    

    const in_3 = $env.evaluate({"0":{"0":{"0":"arg","1":5636,"type":"pvar"},"type":"quot/pat"},"1":5631,"type":"equot"}, $env);
    const mod_3 = test(in_3);
    const out_3 = $env.evaluate({"0":{"0":"some","1":5638,"type":"evar"},"1":{"0":{"0":"arg","1":{"type":"nil"},"2":5639,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"2":5637,"type":"eapp"}, $env);
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (5577) failing 3. Not equal.`);
    }
    

    const in_4 = $env.evaluate({"0":{"0":{"0":"case","1":6219,"type":"pvar"},"type":"quot/pat"},"1":6215,"type":"equot"}, $env);
    const mod_4 = test(in_4);
    const out_4 = $env.evaluate({"0":{"0":"some","1":6221,"type":"evar"},"1":{"0":{"0":"$case","1":{"type":"nil"},"2":6222,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"2":6220,"type":"eapp"}, $env);
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (5577) failing 4. Not equal.`);
    }
    
}
const compile_pat = $env.evaluateStmt({"0":"compile-pat","1":5965,"2":{"0":{"0":{"0":"pat","1":5968,"type":"pvar"},"1":{"0":{"0":"target","1":5969,"type":"pvar"},"1":{"0":{"0":"inner","1":5970,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":{"0":{"0":{"0":{"0":",","1":5975,"2":{"0":{"0":"check","1":5976,"type":"pvar"},"1":{"0":{"0":"assign","1":5977,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5974,"type":"pcon"},"1":{"0":{"0":"compile-pat-list","1":5979,"type":"evar"},"1":{"0":{"0":"pat","1":5980,"type":"evar"},"1":{"0":{"0":"target","1":5981,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5978,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"inner","1":5986,"type":"pvar"},"1":{"0":{"0":"assign","1":5989,"type":"evar"},"1":{"0":{"0":{"0":"nil","1":5990,"2":{"type":"nil"},"3":5990,"type":"pcon"},"1":{"0":"inner","1":5991,"type":"evar"},"type":","},"1":{"0":{"0":{"0":5992,"type":"pany"},"1":{"0":"{\\n","1":{"0":{"0":{"0":{"0":"join","1":5997,"type":"evar"},"1":{"0":{"0":"\\n","1":{"type":"nil"},"2":6001,"type":"estr"},"1":{"0":{"0":"assign","1":5998,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5995,"type":"eapp"},"1":{"0":"\\n","1":5996,"type":","},"type":","},"1":{"0":{"0":{"0":"inner","1":6005,"type":"evar"},"1":{"0":"\\n}","1":6006,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5993,"type":"estr"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5987,"type":"ematch"},"type":","},"1":{"0":{"0":{"0":"inner","1":6008,"type":"pvar"},"1":{"0":{"0":"check","1":6011,"type":"evar"},"1":{"0":{"0":{"0":"nil","1":6012,"2":{"type":"nil"},"3":6012,"type":"pcon"},"1":{"0":"inner","1":6013,"type":"evar"},"type":","},"1":{"0":{"0":{"0":6014,"type":"pany"},"1":{"0":"if (","1":{"0":{"0":{"0":{"0":"join","1":6019,"type":"evar"},"1":{"0":{"0":" &&\\n","1":{"type":"nil"},"2":6020,"type":"estr"},"1":{"0":{"0":"check","1":6023,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6017,"type":"eapp"},"1":{"0":") {\\n","1":6018,"type":","},"type":","},"1":{"0":{"0":{"0":"inner","1":6026,"type":"evar"},"1":{"0":"\\n}","1":6027,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6015,"type":"estr"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6009,"type":"ematch"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":{"0":"inner","1":6007,"type":"evar"},"2":5971,"type":"elet"},"2":5962,"type":"elambda"},"3":5962,"type":"tdef"}, $env)
{
    const test = $env.evaluate({"0":{"0":{"0":",","1":6054,"2":{"0":{"0":"name","1":6055,"type":"pvar"},"1":{"0":{"0":"args","1":6056,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6053,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"constructor-fn","1":6058,"type":"evar"},"1":{"0":{"0":"name","1":6059,"type":"evar"},"1":{"0":{"0":"args","1":6060,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6057,"type":"eapp"},"2":6050,"type":"elambda"}, $env);
    
    const in_0 = $env.evaluate({"0":{"0":",","1":6064,"type":"evar"},"1":{"0":{"0":"nil","1":{"type":"nil"},"2":6066,"type":"estr"},"1":{"0":{"0":"nil","1":6068,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6064,"type":"eapp"}, $env);
    const mod_0 = test(in_0);
    const out_0 = $env.evaluate({"0":"({type: \"nil\"})","1":{"type":"nil"},"2":6074,"type":"estr"}, $env);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (6047) failing 0. Not equal.`);
    }
    

    const in_1 = $env.evaluate({"0":{"0":",","1":6073,"type":"evar"},"1":{"0":{"0":"cons","1":{"type":"nil"},"2":6078,"type":"estr"},"1":{"0":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":"10","1":{"type":"nil"},"2":6081,"type":"estr"},"1":{"0":{"0":{"0":"cons","1":6080,"type":"evar"},"1":{"0":{"0":"a","1":{"type":"nil"},"2":6083,"type":"estr"},"1":{"0":{"0":"nil","1":6080,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6080,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6073,"type":"eapp"}, $env);
    const mod_1 = test(in_1);
    const out_1 = $env.evaluate({"0":"({type: \"cons\", 0: 10, 1: a})","1":{"type":"nil"},"2":6085,"type":"estr"}, $env);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (6047) failing 1. Not equal.`);
    }
    
}
{
    const test = $env.evaluate({"0":{"0":{"0":"pat","1":6096,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"compile-pat-list","1":6094,"type":"evar"},"1":{"0":{"0":"pat","1":6098,"type":"evar"},"1":{"0":{"0":"v","1":{"type":"nil"},"2":6099,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6097,"type":"eapp"},"2":6093,"type":"elambda"}, $env);
    
    const in_0 = $env.evaluate({"0":{"0":{"0":"hi","1":6107,"type":"pvar"},"type":"quot/pat"},"1":6104,"type":"equot"}, $env);
    const mod_0 = test(in_0);
    const out_0 = $env.evaluate({"0":{"0":",","1":6109,"type":"evar"},"1":{"0":{"0":"nil","1":6111,"type":"evar"},"1":{"0":{"0":{"0":"cons","1":6112,"type":"evar"},"1":{"0":{"0":"let hi = v;","1":{"type":"nil"},"2":6113,"type":"estr"},"1":{"0":{"0":"nil","1":6112,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6112,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6109,"type":"eapp"}, $env);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (6089) failing 0. Not equal.`);
    }
    

    const in_1 = $env.evaluate({"0":{"0":{"0":6120,"type":"pany"},"type":"quot/pat"},"1":6117,"type":"equot"}, $env);
    const mod_1 = test(in_1);
    const out_1 = $env.evaluate({"0":{"0":",","1":6121,"type":"evar"},"1":{"0":{"0":"nil","1":6123,"type":"evar"},"1":{"0":{"0":"nil","1":6124,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6121,"type":"eapp"}, $env);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (6089) failing 1. Not equal.`);
    }
    

    const in_2 = $env.evaluate({"0":{"0":{"0":"cons","1":6130,"2":{"0":{"0":{"0":1,"1":6131,"type":"pint"},"1":6131,"type":"pprim"},"1":{"0":{"0":"cons","1":6130,"2":{"0":{"0":"lol","1":6133,"2":{"0":{"0":"hi","1":6134,"type":"pstr"},"1":{"0":{"0":"x","1":6136,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6132,"type":"pcon"},"1":{"0":{"0":"cons","1":6130,"2":{"0":{"0":{"0":23,"1":6137,"type":"pint"},"1":6137,"type":"pprim"},"1":{"0":{"0":"rest","1":6138,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6130,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6130,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6130,"type":"pcon"},"type":"quot/pat"},"1":6127,"type":"equot"}, $env);
    const mod_2 = test(in_2);
    const out_2 = $env.evaluate({"0":{"0":",","1":6142,"type":"evar"},"1":{"0":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":"v.type === \"cons\"","1":{"type":"nil"},"2":6145,"type":"estr"},"1":{"0":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":"v[0] === 1","1":{"type":"nil"},"2":6147,"type":"estr"},"1":{"0":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":"v[1].type === \"cons\"","1":{"type":"nil"},"2":6149,"type":"estr"},"1":{"0":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":"v[1][0].type === \"lol\"","1":{"type":"nil"},"2":6151,"type":"estr"},"1":{"0":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":"v[1][0][0] === \"hi\"","1":{"type":"nil"},"2":6153,"type":"estr"},"1":{"0":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":"v[1][1].type === \"cons\"","1":{"type":"nil"},"2":6155,"type":"estr"},"1":{"0":{"0":{"0":"cons","1":6144,"type":"evar"},"1":{"0":{"0":"v[1][1][0] === 23","1":{"type":"nil"},"2":6157,"type":"estr"},"1":{"0":{"0":"nil","1":6144,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6144,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"1":{"0":{"0":{"0":"cons","1":-1,"type":"evar"},"1":{"0":{"0":"let x = v[1][0][1];","1":{"type":"nil"},"2":6160,"type":"estr"},"1":{"0":{"0":{"0":"cons","1":6159,"type":"evar"},"1":{"0":{"0":"let rest = v[1][1][1];","1":{"type":"nil"},"2":6162,"type":"estr"},"1":{"0":{"0":"nil","1":6159,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6159,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":-1,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6142,"type":"eapp"}, $env);
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (6089) failing 2. Not equal.`);
    }
    
}
{
    const test = $env.evaluate({"0":{"0":{"0":"pat","1":6172,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"compile-pat","1":6174,"type":"evar"},"1":{"0":{"0":"pat","1":6175,"type":"evar"},"1":{"0":{"0":"v","1":{"type":"nil"},"2":6176,"type":"estr"},"1":{"0":{"0":"// evaluation continues","1":{"type":"nil"},"2":6178,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":6173,"type":"eapp"},"2":6167,"type":"elambda"}, $env);
    
    const in_0 = $env.evaluate({"0":{"0":{"0":6185,"type":"pany"},"type":"quot/pat"},"1":6183,"type":"equot"}, $env);
    const mod_0 = test(in_0);
    const out_0 = $env.evaluate({"0":"// evaluation continues","1":{"type":"nil"},"2":6186,"type":"estr"}, $env);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (6164) failing 0. Not equal.`);
    }
    

    const in_1 = $env.evaluate({"0":{"0":{"0":"name","1":6194,"type":"pvar"},"type":"quot/pat"},"1":6190,"type":"equot"}, $env);
    const mod_1 = test(in_1);
    const out_1 = $env.evaluate({"0":"{\nlet name = v;\n// evaluation continues\n}","1":{"type":"nil"},"2":6199,"type":"estr"}, $env);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (6164) failing 1. Not equal.`);
    }
    

    const in_2 = $env.evaluate({"0":{"0":{"0":"cons","1":6202,"2":{"0":{"0":{"0":2,"1":6203,"type":"pint"},"1":6203,"type":"pprim"},"1":{"0":{"0":"cons","1":6202,"2":{"0":{"0":{"0":3,"1":6204,"type":"pint"},"1":6204,"type":"pprim"},"1":{"0":{"0":"cons","1":6202,"2":{"0":{"0":"x","1":6205,"type":"pvar"},"1":{"0":{"0":"cons","1":6202,"2":{"0":{"0":"lol","1":6207,"2":{"0":{"0":{"0":2,"1":6208,"type":"pint"},"1":6208,"type":"pprim"},"1":{"0":{"0":"y","1":6209,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6206,"type":"pcon"},"1":{"0":{"0":"nil","1":6202,"2":{"type":"nil"},"3":6202,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6202,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6202,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6202,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6202,"type":"pcon"},"type":"quot/pat"},"1":6197,"type":"equot"}, $env);
    const mod_2 = test(in_2);
    const out_2 = $env.evaluate({"0":"if (v.type === \"cons\" &&\nv[0] === 2 &&\nv[1].type === \"cons\" &&\nv[1][0] === 3 &&\nv[1][1].type === \"cons\" &&\nv[1][1][1].type === \"cons\" &&\nv[1][1][1][0].type === \"lol\" &&\nv[1][1][1][0][0] === 2 &&\nv[1][1][1][1].type === \"nil\") {\n{\nlet x = v[1][1][0];\nlet y = v[1][1][1][0][1];\n// evaluation continues\n}\n}","1":{"type":"nil"},"2":6210,"type":"estr"}, $env);
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (6164) failing 2. Not equal.`);
    }
    
}
const fix_slashes = $env.evaluateStmt({"0":"fix-slashes","1":6292,"2":{"0":{"0":{"0":"str","1":6294,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"escape-string","1":6296,"type":"evar"},"1":{"0":{"0":{"0":"unescapeString","1":6298,"type":"evar"},"1":{"0":{"0":"str","1":6299,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":6297,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"2":6295,"type":"eapp"},"2":6289,"type":"elambda"},"3":6289,"type":"tdef"}, $env)
const pat_as_arg = $env.evaluateStmt({"0":"pat-as-arg","1":6314,"2":{"0":{"0":{"0":"pat","1":6316,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":"pat-as-arg-inner","1":6319,"type":"evar"},"1":{"0":{"0":"pat","1":6329,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":6328,"type":"eapp"},"1":{"0":{"0":{"0":"none","1":6321,"2":{"type":"nil"},"3":6320,"type":"pcon"},"1":{"0":"_","1":{"type":"nil"},"2":6322,"type":"estr"},"type":","},"1":{"0":{"0":{"0":"some","1":6325,"2":{"0":{"0":"arg","1":6326,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"3":6324,"type":"pcon"},"1":{"0":"arg","1":6327,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6317,"type":"ematch"},"2":6311,"type":"elambda"},"3":6311,"type":"tdef"}, $env)
{
    const test = $env.evaluate({"0":"fix-slashes","1":6382,"type":"evar"}, $env);
    
    const in_0 = $env.evaluate({"0":"\\n","1":{"type":"nil"},"2":6386,"type":"estr"}, $env);
    const mod_0 = test(in_0);
    const out_0 = $env.evaluate({"0":"\\\\n","1":{"type":"nil"},"2":6389,"type":"estr"}, $env);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (6379) failing 0. Not equal.`);
    }
    

    const in_1 = $env.evaluate({"0":"\\\\n","1":{"type":"nil"},"2":6393,"type":"estr"}, $env);
    const mod_1 = test(in_1);
    const out_1 = $env.evaluate({"0":"\\\\n","1":{"type":"nil"},"2":6394,"type":"estr"}, $env);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (6379) failing 1. Not equal.`);
    }
    

    const in_2 = $env.evaluate({"0":"\\\\\\n","1":{"type":"nil"},"2":6399,"type":"estr"}, $env);
    const mod_2 = test(in_2);
    const out_2 = $env.evaluate({"0":"\\\\\\\\\\\\n","1":{"type":"nil"},"2":6400,"type":"estr"}, $env);
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (6379) failing 2. Not equal.`);
    }
    

    const in_3 = $env.evaluate({"0":"\\\"","1":{"type":"nil"},"2":6405,"type":"estr"}, $env);
    const mod_3 = test(in_3);
    const out_3 = $env.evaluate({"0":"\\\\\\\"","1":{"type":"nil"},"2":6406,"type":"estr"}, $env);
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (6379) failing 3. Not equal.`);
    }
    
}
{
    const test = $env.evaluate({"0":{"0":{"0":"x","1":6448,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"x","1":6449,"type":"evar"},"2":6445,"type":"elambda"}, $env);
    
    const in_0 = $env.evaluate({"0":{"0":{"0":"a","1":6438,"2":{"0":{"0":"b","1":6439,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"c","1":{"0":6441,"1":{"0":{"0":{"0":"b","1":6442,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":6440,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":6433,"type":"tdeftype"},"type":"quot/top"},"1":6428,"type":"equot"}, $env);
    const mod_0 = test(in_0);
    const out_0 = $env.evaluate({"0":{"0":"tdeftype","1":6490,"type":"evar"},"1":{"0":{"0":"a","1":{"type":"nil"},"2":6491,"type":"estr"},"1":{"0":{"0":{"0":6438,"1":6493,"type":"pint"},"1":6493,"type":"eprim"},"1":{"0":{"0":{"0":"cons","1":6494,"type":"evar"},"1":{"0":{"0":{"0":",","1":6495,"type":"evar"},"1":{"0":{"0":"b","1":{"type":"nil"},"2":6497,"type":"estr"},"1":{"0":{"0":{"0":6439,"1":6499,"type":"pint"},"1":6499,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6495,"type":"eapp"},"1":{"0":{"0":"nil","1":6494,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6494,"type":"eapp"},"1":{"0":{"0":{"0":"cons","1":6500,"type":"evar"},"1":{"0":{"0":{"0":",","1":6501,"type":"evar"},"1":{"0":{"0":"c","1":{"type":"nil"},"2":6503,"type":"estr"},"1":{"0":{"0":{"0":",","1":6501,"type":"evar"},"1":{"0":{"0":{"0":6441,"1":6505,"type":"pint"},"1":6505,"type":"eprim"},"1":{"0":{"0":{"0":",","1":6501,"type":"evar"},"1":{"0":{"0":{"0":"cons","1":6506,"type":"evar"},"1":{"0":{"0":{"0":"tcon","1":6508,"type":"evar"},"1":{"0":{"0":"b","1":{"type":"nil"},"2":6509,"type":"estr"},"1":{"0":{"0":{"0":6442,"1":6511,"type":"pint"},"1":6511,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6507,"type":"eapp"},"1":{"0":{"0":"nil","1":6506,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6506,"type":"eapp"},"1":{"0":{"0":{"0":6440,"1":6512,"type":"pint"},"1":6512,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6501,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6501,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6501,"type":"eapp"},"1":{"0":{"0":"nil","1":6500,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6500,"type":"eapp"},"1":{"0":{"0":{"0":6433,"1":6513,"type":"pint"},"1":6513,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"2":6489,"type":"eapp"}, $env);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (6443) failing 0. Not equal.`);
    }
    

    const in_1 = $env.evaluate({"0":{"0":{"0":"x","1":6483,"type":"evar"},"type":"quot/expr"},"1":6480,"type":"equot"}, $env);
    const mod_1 = test(in_1);
    const out_1 = $env.evaluate({"0":{"0":"evar","1":6485,"type":"evar"},"1":{"0":{"0":"x","1":{"type":"nil"},"2":6486,"type":"estr"},"1":{"0":{"0":{"0":6483,"1":6488,"type":"pint"},"1":6488,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6484,"type":"eapp"}, $env);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (6443) failing 1. Not equal.`);
    }
    
}
const compile = $env.evaluateStmt({"0":"compile","1":1743,"2":{"0":{"0":{"0":"expr","1":1745,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"expr","1":1748,"type":"evar"},"1":{"0":{"0":{"0":"estr","1":4379,"2":{"0":{"0":"first","1":4381,"type":"pvar"},"1":{"0":{"0":"tpls","1":4382,"type":"pvar"},"1":{"0":{"0":4915,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"3":4378,"type":"pcon"},"1":{"0":{"0":"tpls","1":4450,"type":"evar"},"1":{"0":{"0":{"0":"nil","1":4451,"2":{"type":"nil"},"3":4451,"type":"pcon"},"1":{"0":"\\\"","1":{"0":{"0":{"0":{"0":"fix-slashes","1":4456,"type":"evar"},"1":{"0":{"0":"first","1":6300,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":4454,"type":"eapp"},"1":{"0":"\\\"","1":4455,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"2":4452,"type":"estr"},"type":","},"1":{"0":{"0":{"0":4460,"type":"pany"},"1":{"0":{"0":{"0":{"0":"tpls","1":6304,"type":"pvar"},"1":{"0":{"0":"map","1":6261,"type":"evar"},"1":{"0":{"0":"tpls","1":6262,"type":"evar"},"1":{"0":{"0":{"0":{"0":",","1":6525,"2":{"0":{"0":"expr","1":6526,"type":"pvar"},"1":{"0":{"0":",","1":6525,"2":{"0":{"0":"suffix","1":6527,"type":"pvar"},"1":{"0":{"0":6528,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6266,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6266,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"${","1":{"0":{"0":{"0":{"0":"compile","1":6283,"type":"evar"},"1":{"0":{"0":"expr","1":6284,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":6281,"type":"eapp"},"1":{"0":"}","1":6282,"type":","},"type":","},"1":{"0":{"0":{"0":{"0":"fix-slashes","1":6287,"type":"evar"},"1":{"0":{"0":"suffix","1":6288,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":6285,"type":"eapp"},"1":{"0":"","1":6286,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6276,"type":"estr"},"2":6263,"type":"elambda"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6260,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"`","1":{"0":{"0":{"0":{"0":"fix-slashes","1":6249,"type":"evar"},"1":{"0":{"0":"first","1":6252,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":6238,"type":"eapp"},"1":{"0":"","1":6239,"type":","},"type":","},"1":{"0":{"0":{"0":{"0":"join","1":6253,"type":"evar"},"1":{"0":{"0":"","1":{"type":"nil"},"2":6258,"type":"estr"},"1":{"0":{"0":"tpls","1":6306,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6257,"type":"eapp"},"1":{"0":"`","1":6254,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6236,"type":"estr"},"2":6301,"type":"elet"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4446,"type":"ematch"},"type":","},"1":{"0":{"0":{"0":"eprim","1":1750,"2":{"0":{"0":"prim","1":1751,"type":"pvar"},"1":{"0":{"0":4916,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":1749,"type":"pcon"},"1":{"0":{"0":"compile-prim","1":5386,"type":"evar"},"1":{"0":{"0":"prim","1":5388,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5387,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"evar","1":1789,"2":{"0":{"0":"name","1":1790,"type":"pvar"},"1":{"0":{"0":4917,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":1788,"type":"pcon"},"1":{"0":{"0":"sanitize","1":1792,"type":"evar"},"1":{"0":{"0":"name","1":1793,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":1791,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"equot","1":2826,"2":{"0":{"0":"inner","1":2828,"type":"pvar"},"1":{"0":{"0":4918,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":2824,"type":"pcon"},"1":{"0":{"0":"compile-quot","1":5345,"type":"evar"},"1":{"0":{"0":"inner","1":5346,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":2830,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"elambda","1":1795,"2":{"0":{"0":"pats","1":1796,"type":"pvar"},"1":{"0":{"0":"body","1":1797,"type":"pvar"},"1":{"0":{"0":4919,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"3":1794,"type":"pcon"},"1":{"0":{"0":"foldr","1":5243,"type":"evar"},"1":{"0":{"0":{"0":"compile","1":5245,"type":"evar"},"1":{"0":{"0":"body","1":5246,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5244,"type":"eapp"},"1":{"0":{"0":"pats","1":5247,"type":"evar"},"1":{"0":{"0":{"0":{"0":"body","1":5251,"type":"pvar"},"1":{"0":{"0":"pat","1":5252,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":"(","1":{"0":{"0":{"0":{"0":"pat-as-arg","1":1804,"type":"evar"},"1":{"0":{"0":"pat","1":1805,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5229,"type":"eapp"},"1":{"0":") => ","1":6308,"type":","},"type":","},"1":{"0":{"0":{"0":"body","1":6309,"type":"evar"},"1":{"0":"","1":6310,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":1801,"type":"estr"},"2":5248,"type":"elambda"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":5242,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"elet","1":1812,"2":{"0":{"0":"bindings","1":1813,"type":"pvar"},"1":{"0":{"0":"body","1":1815,"type":"pvar"},"1":{"0":{"0":4920,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"3":1811,"type":"pcon"},"1":{"0":{"0":"foldr","1":5199,"type":"evar"},"1":{"0":{"0":{"0":"compile","1":5201,"type":"evar"},"1":{"0":{"0":"body","1":5202,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5200,"type":"eapp"},"1":{"0":{"0":"bindings","1":5203,"type":"evar"},"1":{"0":{"0":{"0":{"0":"body","1":5207,"type":"pvar"},"1":{"0":{"0":",","1":5209,"2":{"0":{"0":"pat","1":5212,"type":"pvar"},"1":{"0":{"0":"init","1":5213,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5208,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":"((","1":{"0":{"0":{"0":{"0":"pat-as-arg","1":5216,"type":"evar"},"1":{"0":{"0":"pat","1":5220,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5219,"type":"eapp"},"1":{"0":") => ","1":5217,"type":","},"type":","},"1":{"0":{"0":{"0":"body","1":5221,"type":"evar"},"1":{"0":")(","1":5222,"type":","},"type":","},"1":{"0":{"0":{"0":{"0":"compile","1":5225,"type":"evar"},"1":{"0":{"0":"init","1":5226,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5223,"type":"eapp"},"1":{"0":")","1":5224,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":5214,"type":"estr"},"2":5204,"type":"elambda"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":5198,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"eapp","1":1837,"2":{"0":{"0":"f","1":1838,"type":"pvar"},"1":{"0":{"0":"args","1":1839,"type":"pvar"},"1":{"0":{"0":4921,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"3":1836,"type":"pcon"},"1":{"0":{"0":"foldl","1":5182,"type":"evar"},"1":{"0":{"0":{"0":"with-parens","1":5171,"type":"evar"},"1":{"0":{"0":"f","1":5172,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5170,"type":"eapp"},"1":{"0":{"0":"args","1":5183,"type":"evar"},"1":{"0":{"0":{"0":{"0":"target","1":5187,"type":"pvar"},"1":{"0":{"0":"arg","1":5188,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":"","1":{"0":{"0":{"0":"target","1":5191,"type":"evar"},"1":{"0":"(","1":5192,"type":","},"type":","},"1":{"0":{"0":{"0":{"0":"compile","1":5195,"type":"evar"},"1":{"0":{"0":"arg","1":5196,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5193,"type":"eapp"},"1":{"0":")","1":5194,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5189,"type":"estr"},"2":5184,"type":"elambda"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":5181,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"ematch","1":1876,"2":{"0":{"0":"target","1":1877,"type":"pvar"},"1":{"0":{"0":"cases","1":1878,"type":"pvar"},"1":{"0":{"0":4922,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"3":1875,"type":"pcon"},"1":{"0":{"0":{"0":{"0":"cases","1":6033,"type":"pvar"},"1":{"0":{"0":"map","1":4325,"type":"evar"},"1":{"0":{"0":"cases","1":4326,"type":"evar"},"1":{"0":{"0":{"0":{"0":"case","1":4338,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":",","1":4345,"2":{"0":{"0":"pat","1":4346,"type":"pvar"},"1":{"0":{"0":"body","1":4347,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":4344,"type":"pcon"},"1":{"0":"case","1":4349,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"compile-pat","1":4352,"type":"evar"},"1":{"0":{"0":"pat","1":4353,"type":"evar"},"1":{"0":{"0":"$target","1":{"type":"nil"},"2":4354,"type":"estr"},"1":{"0":{"0":"return ","1":{"0":{"0":{"0":{"0":"compile","1":4360,"type":"evar"},"1":{"0":{"0":"body","1":4361,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":4358,"type":"eapp"},"1":{"0":"","1":4359,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"2":4356,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":4348,"type":"eapp"},"2":4340,"type":"elet"},"2":4334,"type":"elambda"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4323,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"(($target) => {\\n","1":{"0":{"0":{"0":{"0":"join","1":4363,"type":"evar"},"1":{"0":{"0":"\\n","1":{"type":"nil"},"2":4376,"type":"estr"},"1":{"0":{"0":"cases","1":6035,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4362,"type":"eapp"},"1":{"0":"\\nthrow new Error('Failed to match. ' + valueToString($target));\\n})(","1":4324,"type":","},"type":","},"1":{"0":{"0":{"0":{"0":"compile","1":4321,"type":"evar"},"1":{"0":{"0":"target","1":4322,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":4318,"type":"eapp"},"1":{"0":")","1":4319,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4314,"type":"estr"},"2":6030,"type":"elet"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"2":1746,"type":"ematch"},"2":828,"type":"elambda"},"3":828,"type":"tdef"}, $env)

const with_parens = $env.evaluateStmt({"0":"with-parens","1":5159,"2":{"0":{"0":{"0":"expr","1":5161,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"maybe-parens","1":5164,"type":"evar"},"1":{"0":{"0":{"0":"compile","1":5176,"type":"evar"},"1":{"0":{"0":"expr","1":5177,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5165,"type":"eapp"},"1":{"0":{"0":{"0":"needs-parens","1":5167,"type":"evar"},"1":{"0":{"0":"expr","1":5168,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5166,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5163,"type":"eapp"},"2":5155,"type":"elambda"},"3":5155,"type":"tdef"}, $env)
const compile_top = $env.evaluateStmt({"0":"compile-top","1":726,"2":{"0":{"0":{"0":"top","1":728,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"top","1":731,"type":"evar"},"1":{"0":{"0":{"0":"texpr","1":733,"2":{"0":{"0":"expr","1":734,"type":"pvar"},"1":{"0":{"0":5066,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":732,"type":"pcon"},"1":{"0":{"0":"compile","1":736,"type":"evar"},"1":{"0":{"0":"expr","1":737,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":735,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"tdef","1":739,"2":{"0":{"0":"name","1":740,"type":"pvar"},"1":{"0":{"0":6415,"type":"pany"},"1":{"0":{"0":"body","1":741,"type":"pvar"},"1":{"0":{"0":5068,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":738,"type":"pcon"},"1":{"0":"const ","1":{"0":{"0":{"0":{"0":"sanitize","1":5436,"type":"evar"},"1":{"0":{"0":"name","1":5437,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5434,"type":"eapp"},"1":{"0":" = ","1":5435,"type":","},"type":","},"1":{"0":{"0":{"0":{"0":"compile","1":5440,"type":"evar"},"1":{"0":{"0":"body","1":5442,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5438,"type":"eapp"},"1":{"0":";\\n","1":5439,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":745,"type":"estr"},"type":","},"1":{"0":{"0":{"0":"tdeftype","1":758,"2":{"0":{"0":"name","1":759,"type":"pvar"},"1":{"0":{"0":6427,"type":"pany"},"1":{"0":{"0":6417,"type":"pany"},"1":{"0":{"0":"cases","1":760,"type":"pvar"},"1":{"0":{"0":5069,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":757,"type":"pcon"},"1":{"0":{"0":"join","1":2190,"type":"evar"},"1":{"0":{"0":"\\n","1":{"type":"nil"},"2":2192,"type":"estr"},"1":{"0":{"0":{"0":"map","1":2198,"type":"evar"},"1":{"0":{"0":"cases","1":2200,"type":"evar"},"1":{"0":{"0":{"0":{"0":"case","1":2214,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":",","1":2224,"2":{"0":{"0":"name","1":2226,"type":"pvar"},"1":{"0":{"0":",","1":2224,"2":{"0":{"0":6514,"type":"pany"},"1":{"0":{"0":",","1":2224,"2":{"0":{"0":"args","1":2228,"type":"pvar"},"1":{"0":{"0":4719,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":2222,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":2222,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":2222,"type":"pcon"},"1":{"0":"case","1":2310,"type":"evar"},"type":","},"1":{"0":{"0":{"0":"arrows","1":5524,"type":"pvar"},"1":{"0":{"0":"join","1":5527,"type":"evar"},"1":{"0":{"0":"","1":{"type":"nil"},"2":5528,"type":"estr"},"1":{"0":{"0":{"0":"map","1":5531,"type":"evar"},"1":{"0":{"0":{"0":"indices","1":5533,"type":"evar"},"1":{"0":{"0":"args","1":5534,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5532,"type":"eapp"},"1":{"0":{"0":{"0":{"0":"i","1":5538,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"(v","1":{"0":{"0":{"0":{"0":"int-to-string","1":5542,"type":"evar"},"1":{"0":{"0":"i","1":5543,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5541,"type":"eapp"},"1":{"0":") => ","1":5544,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"2":5539,"type":"estr"},"2":5535,"type":"elambda"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5530,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5526,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"body","1":5546,"type":"pvar"},"1":{"0":{"0":"constructor-fn","1":5549,"type":"evar"},"1":{"0":{"0":"name","1":5550,"type":"evar"},"1":{"0":{"0":{"0":"map","1":5552,"type":"evar"},"1":{"0":{"0":{"0":"indices","1":5553,"type":"evar"},"1":{"0":{"0":"args","1":5567,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5566,"type":"eapp"},"1":{"0":{"0":{"0":{"0":"i","1":5558,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"v","1":{"0":{"0":{"0":{"0":"int-to-string","1":5563,"type":"evar"},"1":{"0":{"0":"i","1":5564,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5562,"type":"eapp"},"1":{"0":"","1":5565,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"2":5560,"type":"estr"},"2":5555,"type":"elambda"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5551,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5548,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":{"0":"const ","1":{"0":{"0":{"0":{"0":"sanitize","1":5448,"type":"evar"},"1":{"0":{"0":"name","1":5449,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":5446,"type":"eapp"},"1":{"0":" = ","1":5447,"type":","},"type":","},"1":{"0":{"0":{"0":"arrows","1":5450,"type":"evar"},"1":{"0":"","1":5451,"type":","},"type":","},"1":{"0":{"0":{"0":"body","1":5470,"type":"evar"},"1":{"0":"","1":5471,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":5444,"type":"estr"},"2":2216,"type":"elet"},"2":2202,"type":"elambda"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2196,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":763,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"ttypealias","1":6519,"2":{"type":"nil"},"3":6518,"type":"pcon"},"1":{"0":"/* type alias */","1":{"type":"nil"},"2":6520,"type":"estr"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"2":729,"type":"ematch"},"2":638,"type":"elambda"},"3":638,"type":"tdef"}, $env)
return $env.evaluateStmt({"0":{"0":{"0":"eval","1":4715,"type":"evar"},"1":{"0":{"0":"compile => compile_top => builtins => ({type:'fns',  compile: a => _ => compile(a), compile_stmt: a => _ => compile_top(a), builtins})","1":{"type":"nil"},"2":4077,"type":"estr"},"1":{"0":{"0":"compile","1":4716,"type":"evar"},"1":{"0":{"0":"compile-top","1":4717,"type":"evar"},"1":{"0":{"0":"builtins","1":6610,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"2":4714,"type":"eapp"},"1":4714,"type":"texpr"}, $env)