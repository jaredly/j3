
{
	let idx = 0
	const wrap = (contents, loc) => ({contents, decorators: [], loc: {
		start: location().start.offset,
		end: location().end.offset,
		idx: idx++,
	}});
}

Form = inner:FormInner decorators:(@Decorator _)* {
	decorators.forEach(dec => {
		inner.decorators[dec.name] = dec
	})
	return inner
}
FormInner = tag / number / list / array / comment / spread / string / identifier / macro

Decorator = "@" "(" _ name:$idtext args:(_ @Form)* _ ")" { return {name, args} }

macro = "@" name:$idtext { return wrap({type: 'macro', name})}

tag = "`" text:$idtext { return wrap({type: 'tag', text })}

number = [0-9]+ ("." [0-9]*)? {return wrap({type: 'number', raw: text()})}

list = "(" _ values:(@Form _)+ ")"  {return wrap({type: 'list', values})}

array = "[" _ values:(@Form _)+ "]"  {return wrap({type: 'list', values})}

comment = text:$commenttext {return wrap({type: 'comment', text})}

spread = "..." contents:Form {return wrap({type: 'spread', contents})}

string = "\"" first:$tplStringChars templates:TemplatePair* "\"" {return wrap({type: 'string', first, templates})}

identifier = text:$idtext {return wrap({type: 'identifier', text})}

TemplatePair = expr:TemplateWrap suffix:$tplStringChars {return {expr, suffix}}
TemplateWrap = "\${" _ forms:(@Form _)+ _ "}" {return forms.length > 0 ? wrap({type: 'list', values: forms}) : forms[0]}
tplStringChars = $(!"\${" stringChar)*
stringChar = $( escapedChar / [^"\\])
escapedChar = "\\" .

idtext = [a-zA-Z0-9_]+

// _ = $([ \t\n\r]*)

newline = "\n"
_nonnewline = [ \t\r]* (comment [ \t\r]*)*
__nonnewline = [ \t\r]+ (comment [ \t\r]*)*
_ "whitespace"
  = [ \t\n\r]*
__ "whitespace"
  = [ \t\n\r]+
commenttext = multiLineComment / lineComment
multiLineComment = $("(*" (!"*)" .)* "*)")
lineComment = $(";" (!"\n" .)* &"\n")
finalLineComment = $(";" (!"\n" .)*)