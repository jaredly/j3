/** A fragment denotes the typing information acquired in a match branch.
    [gamma] is the typing environment coming from the binding of pattern
    variables. [vars] are the fresh variables introduced to type the
    pattern. [tconstraint] is the constraint coming from the instantiation
    of the data constructor scheme. */
type fragment = {
    gamma: Record<string, { term: crterm; pos: number }>;
    vars: variable[];
    tconstraint: tconstraint;
};

/** The [empty_fragment] is used when nothing has been bound. */
let empty_fragment = {
    gamma: {},
    vars: [],
    tconstraint: CTrue(undefined_position),
};

let disjoint_union = <T>(one: Record<string, T>, two: Record<string, T>) => {
    for (let key of Object.keys(two)) {
        if (one[key]) {
            throw new Error(`NonLinearPattern: ${key}`);
        }
    }
    return { ...one, ...two };
};

let constraint_and = (one: tconstraint, two: tconstraint) => {
    throw new Error('impl');
};

/** Joining two fragments is straightforward except that the environments
    must be disjoint (a pattern cannot bound a variable several times). */
let join_fragment = (pos: position, f1: fragment, f2: fragment) => ({
    gamma: disjoint_union(f1.gamma, f2.gamma),
    vars: f1.vars.concat(f2.vars),
    tconstraint: constraint_and(f1.tconstraint, f2.tconstraint),
});
