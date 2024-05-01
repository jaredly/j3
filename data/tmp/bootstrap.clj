(** ## Bootstrap (js) parser + compiler **)

(** Parser consumes (Node)s and produces (stmt /  expr) **)

(** hello = (a) => a.type **)

(** cons = (a, b) => ({type: 'cons', 0: a, 1: b}) **)

(** nil = {type: 'nil'} **)

(** arr = (values) => {
  let v = nil
  for (let i=values.length-1;i>=0;i--) {
    v = cons(values[i], v)
  }
  return v
} **)

(** c = {
  id: (id, loc=-1) => ({type: 'cst/id', 0: id, 1: loc}),
  list: (items, loc=-1) => ({type: 'cst/list', 0: arr(items), 1: loc}),
  
} **)

(** parse = node => {
  switch (node.type) {
    case 'identifier': {
      const v = +node.text
      if (!isNaN(v)) {
        return {type: 'eprim', 0: {type: 'pint', 0: v, 1: node.loc}
    }
  }
}
       **)

(parse 1)

(** hello(nil) + 20 **)

(hello 2 3)

[1 2 3]





