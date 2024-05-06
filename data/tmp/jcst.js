const cons = (a, b) => ({type: 'cons', 0: a, 1: b})
const nil = {type: 'nil'}
const list = (values) => {
  let v = nil
  for (let i=values.length-1;i>=0;i--) {
    v = cons(values[i], v)
  }
  return v
}

const unwrapList = value => value.type === 'nil' ? [] : [value[0], ...unwrapList(value[1])]

const pair = (a, b) => ({type: ',', 0: a, 1: b})

const makePairs = array => {
  const res = [];
  for (let i=0; i<array.length; i+=2) {
    res.push([array[i], array[i + 1]]);
  }
  return res
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
        node.templates.map(item => pair(
          fromNode(item.expr) ?? {type: 'cst/string', 0: '', 1: nil},
          pair(item.suffix.text, item.suffix.loc)
        ))
      ), 2: node.loc}
  }
}

return ({fromNode, toNode})