
{{
	let idx = 0;
	export const nidx = () => idx++;
	export const setIdx = (i) => idx = i;
}}

{
	const newLoc = () => ({
		start: location().start.offset,
		end: location().end.offset,
		idx: nidx()
	});
	const wrap = (contents) => ({...contents, loc: newLoc()});
}

File = _ contents:(@Form _)* _ { return contents}

Form = tag / number / list / array / comment / string / spread / recordAccess / fullRecordAccess / identifier / macro / record

record = "{" _ values:(@Form _)* "}" { return wrap({type: 'record', values})}

macro = "@" name:$idtext { return wrap({type: 'macro', name})}

tag = "'" text:$idtext? { return wrap({type: 'tag', text: text || '' })}

number = raw:$(dotStart / dotEnd) {return wrap({type: 'number', raw})}

dotStart = "." [0-9]+
dotEnd = "-"? [0-9]+ ("." [0-9]*)?

list = "(" _ values:(@Form _)* ")"  {return wrap({type: 'list', values})}

array = "[" _ values:(@Form _)* "]"  {return wrap({type: 'array', values})}

comment = text:$(commenttext / finalLineComment) {return wrap({type: 'comment', text})}

spread = "..." contents:Form {return wrap({type: 'spread', contents})}

// identWithRecord = jjjjjjjjjjjj

fullRecordAccess = target:identifier record:recordAccess {
    return {...record, target, loc: newLoc()}
}

recordAccess = items:dotPair+ {return wrap({type: 'recordAccess', target: wrap({type: 'blank'}), items})}
dotPair = "." text:$idtext {return wrap({type: 'accessText', text})}

string = "\"" first:stringText templates:TemplatePair* "\"" {return wrap({type: 'string', first, templates})}
stringText = text:$tplStringChars {return {type: 'stringText', text, loc: newLoc()}}

identifier = text:$idtext hash:$("#" idtext)? {return wrap({type: 'identifier', text, hash})}

TemplatePair = expr:TemplateWrap suffix:stringText {return {expr, suffix}}
TemplateWrap = "\${" _ forms:(@Form _)+ _ "}" {return forms.length > 1 ? wrap({type: 'list', values: forms}) : forms[0]}
tplStringChars = $(!"\${" stringChar)*
stringChar = $( escapedChar / [^"\\] / __)
escapedChar = "\\" .

idtext = [@:a-zA-Z0-9_<>!=$%*/+~&|,?-]+

// newline = "\n"
// _nonnewline = [ \t\r]* (comment [ \t\r]*)*
// __nonnewline = [ \t\r]+ (comment [ \t\r]*)*
_ "whitespace"
  = [ \t\n\r]*
__ "whitespace"
  = [ \t\n\r]+
commenttext = multiLineComment / lineComment
multiLineComment = $("(*" (!"*)" .)* "*)")
lineComment = $(";" (!"\n" .)* &"\n")
finalLineComment = $(";" (!"\n" .)*)