type Const = { type: 'Int'; value: number };
type Expr =
    | { type: 'Var'; id: string }
    | { type: 'Const'; value: Const }
    | { type: 'Lambda'; arg: string; body: Expr }
    | { type: 'Apply'; fn: Expr; param: Expr } // lol gotta alphabetical
    | { type: 'Pair'; left: Expr; right: Expr } // how do I turn this into records? 🤔
    | { type: 'Tag'; name: string; arg: Expr }
    | { type: 'Match'; target: Expr; cases: { pat: Pattern; body: Expr }[] };

type Pattern =
    | { type: 'Any' }
    | { type: 'Var'; id: string }
    | { type: 'Const'; value: Const }
    | { type: 'Tag'; name: string; arg: Pattern }
    | { type: 'Pair'; left: Pattern; right: Pattern }
    | { type: 'And' | 'Or'; left: Pattern; right: Pattern };

type Type =
    | { type: 'Var'; id: string }
    | { type: 'Basic'; name: string }
    | { type: 'Const'; value: Const }
    | { type: 'Arrow'; arg: Type; body: Type }
    | { type: 'Prod' | 'Or'; left: Type; right: Type }
    | { type: 'Tag'; name: string; arg: Type }
    | { type: 'Not'; target: Type }
    | { type: 'Never' };

const and = (left: Type, right: Type): Type => ({
    type: 'Not',
    target: {
        type: 'Or',
        left: { type: 'Not', target: left },
        right: { type: 'Not', target: right },
    },
});

const minus = (left: Type, right: Type): Type =>
    and(left, { type: 'Not', target: right });
const any: Type = { type: 'Not', target: { type: 'Never' } };

type TypeEnv = 0;

type Constraint =
    | { type: 'TLeq'; left: Type; right: Type }
    | { type: 'XLeq'; id: string; right: Type }
    | { type: 'Def'; env: TypeEnv; target: Constraint[] }
    | {
          type: 'Let';
          outer: Constraint[];
          bodies: { env: TypeEnv; target: Constraint[] }[];
      };
