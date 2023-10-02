type position = number;
type name = string;

type kind =
    | { type: 'KStar' }
    | { type: 'KTimes'; one: kind; two: kind }
    | { type: 'KArrow'; one: kind; two: kind }
    | { type: 'KEmptyRow' };

type typ =
    | { type: 'TypVar'; pos: position; name: string }
    | { type: 'TypApp'; pos: position; fn: typ; args: typ[] }
    | {
          type: 'TypRowCons';
          pos: position;
          rows: { name: string; value: typ }[];
          typ: typ;
      }
    | { type: 'TypRowUniform'; pos: position; typ: typ };

type type_definition = {
    type: 'DAlgebraic';
    items: { pos: position; name: string; names: string[]; typ: typ }[];
};

type type_declaration = {
    pos: position;
    kind: kind;
    name: string;
    defn: type_definition;
};

/** A value definition consists of a list of explicit universal
    quantifiers, a pattern, and an expression. */
export type value_definition = {
    pos: position;
    universal_quantifiers?: string[];
    pat: pattern;
    expr: expression;
};

/** A [binding] is
    {ul {- a set of value definition ({!MiniAst.value_definition}):
           {[ let v1 = exp1 and v2 = exp2 and ... and vn = expn v ]}}
        {- a set of mutually recursive definitions:
           {[ let rec v1 = exp1 and v2 = exp2 and ... and vn = expn v ]}}
        {- a type definition ({!MiniAst.type_definition}).}}
*/
export type binding =
    | { type: 'BindValue'; pos: position; defs: value_definition[] }
    | { type: 'BindRecValue'; pos: position; defs: value_definition[] }
    | { type: 'TypeDec'; pos: position; decls: type_declaration[] };

export type pattern =
    | { type: 'PVar'; pos: position; name: name }
    | { type: 'PWildcard'; pos: position }
    | { type: 'PPrimitive'; pos: position; prim: primitive };
// | { type: 'PAlias'; pos: position; name: string; pat: pattern }
// | { type: 'PTypeConstraint'; pos: position; pat: pattern; typ: typ }
// | { type: 'PData'; pos: position; name: string; pat: pattern[] }
// | { type: 'PAnd'; pos: position; pats: pattern[] }
// | { type: 'POr'; pos: position; pats: pattern[] };

export type primitive =
    | { type: 'PIntegerConstant'; value: number }
    | { type: 'PCharConstant'; value: string }
    | { type: 'PBoolean'; value: boolean }
    | { type: 'PUnit' };

export type expression =
    | { type: 'Var'; pos: position; name: string }
    | { type: 'Lambda'; pos: position; pat: pattern; expr: expression }
    | { type: 'PrimApp'; pos: position; prim: primitive; expr: expression[] }
    | { type: 'App'; pos: position; fn: expression; arg: expression }
    | { type: 'Variant'; pos: position; label: string; arg: expression | null }
    | { type: 'RecordEmpty'; pos: position }
    | {
          type: 'RecordExtend';
          pos: position;
          rows: record_binding[];
          expr: expression;
      }
    | { type: 'RecordAccess'; pos: position; expr: expression; name: string }
    // TODO: I probably ditch this once we have `match`?
    | {
          type: 'If';
          pos: position;
          cond: expression;
          yes: expression;
          no: expression;
      }
    | { type: 'Binding'; pos: position; binding: binding; expr: expression };
// | { type: 'Forall'; pos: position; names: string[]; expr: expression }
// | { type: 'Exists'; pos: position; names: string[]; expr: expression }
// | { type: 'TypeConstraint'; pos: position; expr: expression; typ: typ }
// | { type: 'DCon'; pos: position; name: string; expr: expression[] }
// | { type: 'Match'; pos: position; expr: expression; clauses: clause[] }
// | {
//       type: 'RecordUpdate';
//       pos: position;
//       record: expression;
//       name: string;
//       value: expression;
//   }
// | { type: 'AssertFalse'; pos: position }

type clause = { pos: position; pat: pattern; expr: expression };
type record_binding = { name: string; expr: expression };
