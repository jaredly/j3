const cons = (a, b) => ({type: 'cons', 0: a, 1: b})
const nil = {type: 'nil'}
const list = (values) => {
  let v = nil
  for (let i=values.length-1;i>=0;i--) {
    v = cons(values[i], v)
  }
  return v
}
const unwrapList = value => {
  const res = [];
  for (; value.type === 'cons'; value = value[1]) {
    res.push(value[0]);
  }
  return res;
}
const pair = (a, b) => ({type: ',', 0: a, 1: b})


const fromNode = node => {
  switch (node.type) {
    case 'comment':
    case 'comment-node':
    case 'rich-text':
      return
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
        node.templates.map(item => pair(
          fromNode(item.expr) ?? {type: 'cst/string', 0: '', 1: nil},
          pair(item.suffix.text, item.suffix.loc)
        ))
      ), 2: node.loc}
    case 'raw-code':
      return {type: 'cst/string', 0: node.raw, 1: nil, 2: node.loc}
  }
}

// This is a little helper to make our tests easier to read
const cstToString = (cst) => {
    switch (cst.type) {
      case 'cst/id': return `${cst[0]}:${cst[1]}`
      case 'cst/list': return `(${unwrapList(cst[0]).map(cstToString).join(' ')}):${cst[1]}`
      case 'cst/array': return `[${unwrapList(cst[0]).map(cstToString).join(' ')}]:${cst[1]}`
      case 'cst/record': return `{${unwrapList(cst[0]).map(cstToString).join(' ')}}:${cst[1]}`
      case 'cst/spread': return `..${cstToString(cst[0])}:${cst[1]}`
      case 'cst/string':
        return `"${cst[0]}${
          unwrapList(cst[1]).map(t => `\${${cstToString(t[0])}}${t[1][0]}:${t[1][1]}`)
        }":${cst[2]}`
    }
};


const toNode = node => {
  switch (node.type) {
    case 'cst/id':
      return {type: 'identifier', text: node[0], loc: node[1]}
    case 'cst/spread':
      return {type: 'spread', contents: toNode(node[0]), loc: node[1]}
    case 'cst/empty-spread':
      return {type: 'spread', contents: {type: 'blank', loc: node[0]}, loc: node[0]}
    case 'cst/array':
    case 'cst/list':
    case 'cst/record':
      return {type: node.type.slice(4), values: unwrapList(node[0]).map(toNode), loc: node[1]}
    case 'cst/string':
      return {type: 'string', first: {type: 'stringText', text: node[0], loc: node[2]},
        templates: unwrapList(node[1]).map(({0: expr, 1: text, 2: loc}) => ({
          expr: toNode(expr),
          suffix: {text, loc},
          loc,
        })),
        loc: node[2]
      }
  }
}

return ({type: 'fns', fromNode, toNode})