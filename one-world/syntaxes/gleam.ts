import { ListKind, Loc, RecNode, TableKind } from '../shared/cnodes';

export const parseTop = (node: RecNode) => {
    // switch (node.type)
    // if (node.type === 'list' && node.kind === 'spaced' && node.children[0].type === 'id') {
    //     const name =node.children[0].text
    //     if (forms[name]) {
    //         return forms[name](node.children)
    //     }
    // }
};

// false is no match. anything else is success
type MatchRes = { data?: any; consume: number; error: [Loc, string][] };
type Matcher = (node: RecNode[], at: number) => MatchRes | null;
const one =
    (inner: (node: RecNode) => MatchRes | null): Matcher =>
    (nodes, at) => {
        if (at >= nodes.length) return null;
        return inner(nodes[at]);
    };

const kwd = (name: string) =>
    one((node) => (node.type === 'id' && node.text === name && node.ref?.type !== 'toplevel' ? { consume: 1, error: [], data: name } : null));
const id = one((node) => (node.type === 'id' && node.ref?.type !== 'toplevel' ? { data: node.text, consume: 1, error: [] } : null));
const string = one((node) => (node.type === 'text' ? { data: node.spans, consume: 1, error: [] } : null));

// Secondary
const named =
    (name: string, inner: Matcher): Matcher =>
    (node, at) => {
        const res = inner(node, at);
        return res ? { match: true, data: { [name]: res.data }, consume: res.consume, error: res.error } : null;
    };
const opt =
    (inner: Matcher): Matcher =>
    (nodes, at) => {
        const res = inner(nodes, at);
        return { match: true, data: res ? res.data ?? true : false, consume: res ? res.consume : 0, error: res?.error ?? [] };
    };
// TODO would be nice to cache the inner thunk, as it's only for circular referencing.
const defer =
    (inner: () => Matcher): Matcher =>
    (nodes, at) =>
        inner()(nodes, at);

const add =
    (name: string, value: any, inner: Matcher): Matcher =>
    (nodes, at) => {
        const res = inner(nodes, at);
        return res ? { ...res, data: { ...res.data, [name]: value } } : null;
    };

const matches =
    (items: Matcher[]): Matcher =>
    (nodes, at) => {
        const data = {};
        const error = [];
        const init = at;
        for (let i = 0; i < items.length; i++) {
            const res = items[i](nodes, at);
            if (!res) return null;
            at += res.consume;
            if (res.data && typeof res.data === 'object') {
                Object.assign(data, res.data);
            }
            error.push(...res.error);
        }
        return { match: true, data, consume: at - init, error };
    };

const multi =
    (item: Matcher): Matcher =>
    (nodes, at) => {
        const data = [];
        const error = [];
        const init = at;
        while (true) {
            const res = item(nodes, at);
            if (!res) break;
            at += res.consume;
            data.push(res.data);
            error.push(...res.error);
            at++;
        }
        return { match: true, data, consume: at - init, error };
    };

const space = (items: Matcher[]): Matcher =>
    one((node) => {
        if (node.type !== 'list' || node.kind !== 'spaced') return null;
        const res = matches(items)(node.children, 0);
        if (!res) return res;
        for (let i = res.consume; i < node.children.length; i++) {
            res.error.push([node.children[i].loc, `Extra trailing node`]);
        }
        if (res.consume < node.children.length) return null;
        return { data: res.data, consume: 1, error: res.error };
    });

const smoosh = (items: Matcher[]): Matcher =>
    one((node) => {
        if (node.type !== 'list' || node.kind !== 'smooshed') return null;
        const res = matches(items)(node.children, 0);
        if (!res) return res;
        for (let i = res.consume; i < node.children.length; i++) {
            res.error.push([node.children[i].loc, `Extra trailing node`]);
        }
        return { data: res.data, consume: 1, error: res.error };
    });

const opts =
    (inners: Matcher[]): Matcher =>
    (nodes, at) => {
        const res = matches(inners)(nodes, at);
        return { data: res ? res.data ?? true : false, consume: res ? res.consume : 0, error: res?.error ?? [] };
    };

const list = (kind: ListKind<any>, item: Matcher): Matcher =>
    one((node) => {
        if (node.type !== 'list' || node.kind !== kind) return null;
        const data: any[] = [];
        const error: [Loc, string][] = [];
        node.children.forEach((child, i) => {
            const res = item([child], 0); // yay you only get one
            if (!res) {
                error.push([child.loc, `failed to match idk`]);
                return;
            }
            if (!res.consume) throw new Error(`listy item must be consumptive`);
            data.push(res.data);
            error.push(...res.error);
        });
        return { match: true, data, consume: 1, error };
    });

// const list = (kind: ListKind<any>, item: Matcher): Matcher =>
//     one((node) => {
//         if (node.type !== 'list' || node.kind !== kind) return null;
//         const res = multi(item)(node.children, 0);
//         if (!res) return res;
//         for (let i = res.consume; i < node.children.length; i++) {
//             res.error.push([node.children[i].loc, `Extra trailing node`]);
//         }
//         return { data: res.data, consume: 1, error: res.error };
//     });

const table = (kind: TableKind, columns: Matcher[]): Matcher =>
    one((node) => {
        if (node.type !== 'table' || node.kind !== kind) return null;
        const rows = [];
        const error = [];
        for (let row of node.rows) {
            const res = matches(columns)(row, 0);
            if (!res) return res;
            for (let i = res.consume; i < row.length; i++) {
                res.error.push([row[i].loc, `Extra trailing node`]);
            }
            rows.push(res);
            error.push(...res.error);
        }
        return { data: rows, consume: 1, error };
    });

const round = (item: Matcher) => list('round', item);

const swch =
    (choices: Matcher[]): Matcher =>
    (nodes, at) => {
        for (let choice of choices) {
            const res = choice(nodes, at);
            if (res) return res;
        }
        return null;
    };

const nswch =
    (name: string, choices: Record<string, Matcher>): Matcher =>
    (nodes, at) => {
        for (let [key, choice] of Object.entries(choices)) {
            const res = choice(nodes, at);
            if (res) return { ...res, data: { ...res.data, [name]: key } };
        }
        return null;
    };

// simpleeee
const typ = id;

const block = list(
    'curly',
    defer(() => stmt),
);

// case bladibla { ...safe itsatable }
//
// PATTERN can eat multible things
// but it's fine because TABLES thanks
// btw in a pattern you can do | ... does that make more columns?
// honestly im not sureeee let's go wth nO
const precedences: string[][] = [
    ['case'],
    ['if', 'else'],
    ['<', '>', '<=', '>=', '!=', '=='],
    ['+', '-'],
    ['*', '/'],
    ['^', '%'],
    ['fn'], // I'm gonna pretend that fn is space separated from the args??... maybe
];

const binops = ['<', '>', '<=', '>=', '!=', '==', '+', '-', '*', '/', '^', '%'];

const expr_ = defer(() => expr);

const pat = id;

// Nowww I really want this parser generator to:
// - give reeeally good error messages
//   - means keeping track of 'the farthest we got' and what messed it up
//     hm also want a version of multi that is ~recovering, e.g. can put up with
//     invalid stuff. yes please. OK so this one is strictly "one for one".
//     if things consume more than one, that'd be trouble.
//   - gotta give reasons for non-matching, have them be fairly detailed ideally
//     I dont ~think we need to be 'generative'... alhtouuuugh might be interesting
//     to explore 'autocomplete w/ holes' coming ~automatically from this stuff
// - take care of positional autocomplete for me

const expr = nswch('kind', {
    id: named('value', id),
    string: named('value', string),
    array: named('value', list('square', expr_)),
    record: named('value', table('curly', [named('key', id), named('value', expr_)])),
    tuple: named('value', round(expr_)),
    // some sequence of:
    // atom, '.', '()', '[]', ... right? anything else? oh yeah unary operations. those are prefix-only
    smooshed: smoosh([
        named('prefixes', multi(swch([kwd('+'), kwd('-'), kwd('~'), kwd('!')]))),
        named('base', expr_),
        multi(
            nswch('kind', {
                attr: matches([kwd('.'), named('attr', id)]),
                index: list('square', expr_),
                call: round(expr_),
            }),
        ),
    ]),
    // Let's decide for a minute that you have to surround ifs and cases in parens
    // Could get fancier, but for what?
    // ifs: space([kwd('if'), ...bops, named('yes', block), opts([kwd('else'), named('no', block)])]),
    // cases: space([kwd('case'), ...bops, named('body', table('curly', [pat, expr_]))]),
    // bops: space(bops),
    bops: space([defer(() => binned)]),
});

// const bops = [named('left', expr_), multi(matches([named('op', swch(binops.map(kwd))), named('right', expr_)]))];

const fancy = nswch('kind', {
    ifs: matches([kwd('if'), defer(() => binned), named('yes', block), opts([kwd('else'), named('no', block)])]),
    cases: matches([kwd('case'), defer(() => binned), named('body', table('curly', [pat, expr_]))]),
    single: expr,
});

const binned = matches([fancy, multi(matches([named('op', swch(binops.map(kwd))), named('right', fancy)]))]);

// case 1 + fn { lol } + fn { ho } { yesplease }

// SOOO when we get some /spaces/
//

/*(

PROVLEM

(1) expr might be dropped in the middle of a spaces and need to eat them all.
(2) we need to do the whole precedence parsing nonsense

*/

// const expr = nswch('kind', {
//     id: named('id', id),
//     if_: space([
//         kwd('if'),
//         named('cond', defer(() => expr)),
//         named('yes', block),
//         opts([
//             kwd('else'),
//             named('no', block)
//         ])
//     ]),
//     case_: space([
//         kwd('case'),
//     ])
// })

const stmt = nswch('kind', {
    let: space([kwd('let'), named('name', id), kwd('='), named('value', expr)]),
    expr: named('expr', expr),
});

const topfn = space([
    named('pub', opt(kwd('pub'))),
    kwd('fn'),
    smoosh([named('name', id), named('args', round(swch([named('name', id), space([smoosh([named('name', id), kwd(':')]), named('type', typ)])])))]),
    opts([kwd('->'), named('type', typ)]),
    block,
]);

/*
ok hm am I going to make a combinator library nowwwww
*/

// const kwd = (node: RecNode, text :string) => node.type === 'id' && node.ref?.type !== 'toplevel' && node.text === text

const _ = `
import argv
import envoy
import gleam/io
import gleam/result

pub fn main() {
  case argv.load().arguments {
    ["get", name] -> get(name)
    _ -> io.println("Usage: vars get <name>")
  }
}

fn get(name: String) -> Nil {
  let value = envoy.get(name) |> result.unwrap("")
  io.println(format_pair(name, value))
}

fn format_pair(name: String, value: String) -> String {
  name <> "=" <> value
}
`;

// const forms :Record<string, (nodes:RecNode[]) => any> = {
//     pub: (items: RecNode[]) => {
//         if (items.length > 1 && kwd(items[1], 'fn')) {
//             return forms.fn(items.slice(1)) // todo pub it out
//         }
//     },
//     fn: (items: RecNode[]) => {
//         let at = 1
//         if (items.length < 2) fail()
//         // if (items.)
//     },
//     import: (items: RecNode[]) => {
//         if (items.length !== 2) fail();
//         return parseNamespaced(items[1]);
//     },
// };

// const fail = (msg?: string) => {
//     throw new Error(`not it folks` + (msg ? ': ' + msg : ''));
// };

// const smooshSplit = (nodes: RecNode[], sep: string) => {
//     const items: string[] = [];
//     for (let i = 0; i < nodes.length; i += 2) {
//         const node = nodes[i];
//         if (node.type === 'id') {
//             items.push(node.text);
//         } else {
//             fail();
//         }
//         if (i < nodes.length - 1) {
//             const next = nodes[i + 1];
//             if (next.type !== 'id' || next.text !== sep) fail();
//         }
//     }
//     return items;
// };

// const parseNamespaced = (item: RecNode) => {
//     if (item.type === 'id') return item.text;
//     if (item.type === 'list' && item.kind === 'smooshed') {
//         return smooshSplit(item.children, '/');
//     }
//     fail();
// };
