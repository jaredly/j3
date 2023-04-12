// Some things

const whatsits = `
1 : int
1u : uint
1. : float
true : bool
false : bool
'hi : ['hi 'ho]
('hi 10) : [('hi int)]
(lettype [vec2 {x float y float}] (array vec2 4)) : (array {x float y float})
('hi 10) : ((tfn [T] [('hi T)]) int)
`;

it('should work', () => {});
