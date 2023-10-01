import {
    CA_fold,
    CA_iter,
    CA_map,
    Header,
    Mark_none,
    MultiEquation_descriptor,
    MultiEquation_variable,
    crterm,
    env,
    pos,
    rank_none,
    scheme,
    tconstraint,
} from './infer';
import { unify } from './unify';
import { find, fresh, redundant } from './union_find';

// export const _solve =

type _env =
    | { type: 'Empty' }
    | {
          type: 'EnvFrame';
          env: _env;
          name: string;
          var: MultiEquation_variable;
      };

type pool = { number: number; inhabitants: MultiEquation_variable[] };

/** [chop pool term] adds appropriate fresh variables and
    multi-equations to the environment and returns a variable
    which, according to these multi-equations, is equal to the term
    [term]. In other words, it turns a term of arbitrary depth into
    a variable, together with a number of multi-equations of depth
    at most one. */
let chop = (pool: pool, t: crterm): MultiEquation_variable => {
    switch (t.type) {
        case 'Variable':
            return t.value;
        case 'Term': {
            let v: MultiEquation_variable = fresh<MultiEquation_descriptor>({
                structure: CA_map((t) => chop(pool, t), t.term),
                rank: pool.number,
                mark: Mark_none,
                kind: 'Flexible',
            });
            register(pool, v);
            return v;
        }
    }
};

export const instance = (pool: pool, v: MultiEquation_variable) => {
    let m = Symbol('inst');

    /* [get], [set], and [setp] implement a constant-time mapping from
        descriptors of rank [none] to variables. [mapped] allows determining
        whether a given descriptor belongs to the domain of the
        mapping. [associate] and [retrieve] respectively allow extending and
        looking up the mapping.

        In order to implement a constant-time mapping without wasting extra
        space, we re-use the descriptor's [rank] field, which is redundant at
        this point, since its value must be [none], and store a pointer in
        it. The field is to be viewed as containing a pointer if and only if
        the descriptor is marked with [m]. */

    /* If [v] has rank [none], then [copy v] returns a copy of the variable
        [v], and copies its descendants recursively. The copy is registered in
        the current pool and given the current rank. If [v] has nonnegative
        rank, then [copy v] returns [v]. Only one copy per variable is created,
        even if a variable is found twice during the traversal. */

    let copy = (v: MultiEquation_variable): MultiEquation_variable => {
        const desc = find(v);
        if (desc.mark === m) {
            return desc.var!;
        }
        if (desc.rank !== rank_none || desc.kind === 'Constant') {
            return v;
        }
        const desc_: MultiEquation_descriptor = {
            rank: pool.number,
            mark: Mark_none,
            kind: 'Flexible',
            name: desc.kind === 'Rigid' ? undefined : desc.name,
        };
        const v_ = fresh(desc_);
        register(pool, v_);
        desc.mark = m;
        desc.var = v_;
        if (desc.structure) {
            desc_.structure = CA_map(copy, desc.structure);
        }
        return v_;
    };

    /* If [v] was effectively copied by [copy], then [restore v] returns
     [v] to its original state (that is, restores its rank to [none])
     and restores its descendants recursively. If [v] was not copied,
     [restore v] has no effect. */

    let restore = (v: MultiEquation_variable) => {
        const desc = find(v);
        if (desc.mark === m) {
            desc.mark = Mark_none;
            desc.rank = rank_none;
            if (desc.structure) {
                CA_iter(restore, desc.structure);
            }
        }
    };

    /* We are now ready to take an instance of the type scheme whose
     entry point is [v]. It is simply a matter of copying [v] and
     its descendants, stopping at non-universally-quantified nodes.
     The copy process affects the type scheme, which must be restored
     afterwards. The whole process is linear in the size of the type
     scheme, that is, in the number of universally quantified nodes. */
    let v_ = copy(v);
    restore(v);
    return v_;
};

const _solve = (env: _env, pool: pool, c: tconstraint) => {
    let final_env = { current: env };
    let solve = (env: _env, pool: pool, c: tconstraint) => {
        let pos = c.pos;
        // try/catch Inconsistncy?
        solve_constraint(env, pool, c);
    };
    let solve_constraint = (env: _env, pool: pool, c: tconstraint) => {
        console.log('solve', env, c);
        switch (c.type) {
            case 'True':
                return;
            case 'Dump':
                final_env.current = env;
                return;
            case 'Equation': {
                unify_terms(c.pos, pool, chop(pool, c.t1), chop(pool, c.t2));
                console.log('eq', pool);
                return;
            }
            case 'Conjunction':
                c.items.forEach((cl) => solve(env, pool, cl));
                return;
            case 'Let': {
                if (
                    c.schemes.length === 1 &&
                    c.schemes[0].rigid.length === 0 &&
                    c.constraint.type === 'True'
                ) {
                    console.log('Ok fast path');
                    c.schemes[0].flexible.forEach((f) => introduce(pool, f));
                    return solve(env, pool, c.schemes[0].constraint);
                }
                console.log('complex let');
                let env_ = c.schemes.reduce(
                    (env_, scheme) =>
                        concat(env_, solve_scheme(env, pool, scheme)),
                    env,
                );
                return solve(env_, pool, c.constraint);
            }
            case 'Instance': {
                console.log('👨‍👩‍👦 instancel ookup', c.name);
                const t = lookup(c.pos, c.name, env);
                const i = instance(pool, t);
                const t_ = chop(pool, c.term);
                return unify_terms(c.pos, pool, i, t_);
            }
            case 'Disjunction':
                throw new Error('solve disjunction?');
        }
    };
    let solve_scheme = (
        env: _env,
        pool: pool,
        scheme: scheme,
    ): { [key: string]: MultiEquation_variable } => {
        if (scheme.rigid.length === 0 && scheme.flexible.length === 0) {
            solve(env, pool, scheme.constraint);
            return Object.fromEntries(
                Object.entries(scheme.header).map(([key, value]) => [
                    key,
                    chop(pool, value.term),
                ]),
            );
        }
        let vars = [...scheme.rigid, ...scheme.flexible];
        let pool_ = new_pool(pool);
        vars.forEach((v) => introduce(pool_, v));
        console.log('🤔introduced all', JSON.stringify(vars));
        let header = Object.fromEntries(
            Object.entries(scheme.header).map(([key, value]) => [
                key,
                chop(pool_, value.term),
            ]),
        );
        solve(env, pool_, scheme.constraint);
        // tracer Generalize number pool_ vars
        distinct_variables(scheme.pos, scheme.rigid);
        generalize(pool, pool_);
        generic_variables(scheme.pos, scheme.rigid);
        return header;
    };

    solve(env, pool, c);
    return final_env.current;
};

const concat = (env: _env, header: { [key: string]: MultiEquation_variable }) =>
    Object.keys(header).reduce(
        (res: _env, k): _env => ({
            type: 'EnvFrame',
            env: res,
            name: k,
            var: header[k],
        }),
        env,
    );

export const solve = (
    c: tconstraint,
    vbls: MultiEquation_variable[],
    env: _env,
) => {
    // const env: _env = { type: 'Empty' };
    const pool: pool = { number: 0, inhabitants: [] };
    vbls.forEach((v) => introduce(pool, v));
    return _solve(env, pool, c);
};

let new_pool = (pool: pool) => ({
    number: pool.number + 1,
    inhabitants: [],
});

/** [introduce pool v] adds [v] to the pool [pool]. [v]'s rank is set to the
    pool's number. It is assumed that it was previously uninitialized. */
let introduce = (pool: pool, v: MultiEquation_variable) => {
    let desc = find(v);
    desc.rank = pool.number;
    console.log(
        'introducing',
        JSON.stringify(v),
        pool.number,
        JSON.stringify(desc),
    );
    register(pool, v);
};

let register = (pool: pool, v: MultiEquation_variable) => {
    pool.inhabitants = [v, ...pool.inhabitants];
};

/* TEMPORARY time to perform the occur check on the variables which we
     just ranked [none]. On peut 'eventuellement integrer l'occur check
     a la derniere passe de realisation? *)

  (* Every variable that was initially a member of [young_pool] may now be
     viewed as the entry point of a type scheme. The body of the type scheme
     is the term obtained by traversing the structure below the entry
     point. The type scheme's universally quantified variables have rank
     [none], while its free variables have nonnegative ranks.

     Note that, when considering several such variables, the type schemes
     that they represent may share some of their structure. No copying is
     involved. */

/** [lookup name env] looks for a definition of [name] within
    the environment [env]. */
let lookup = (pos: number, name: string, env: _env) => {
    if (env.type === 'Empty') {
        throw new Error(`unbound ${name}`);
    }
    if (env.name === name) {
        return env.var;
    }
    return lookup(pos, name, env.env);
};

const Mark_frash = () => Symbol();

let distinct_variables = (pos: number, vl: MultiEquation_variable[]) => {
    let m = Symbol('distinct');
    // try {
    vl.forEach((v) => {
        let desc = find(v);
        if (desc.structure) {
            throw new Error(`Cannot generalize ${pos}`);
        }
        if (desc.mark === m) {
            throw new Error('Duplicate Mark');
        }
        desc.mark = m;
    });
    //   List.iter (fun v ->
    // 	   let desc = UnionFind.find v in
    // 	     match desc.structure with
    // 	       | Some _ ->
    // 		   raise (CannotGeneralize (pos, v))
    // 	       | _ ->
    // 		   if Mark.same desc.mark m then
    // 		     raise (DuplicatedMark m);
    // 		   desc.mark <- m
    // 	) vl
    // } catch (err) {
    // //   let vl' = List.filter (fun v -> Mark.same (UnionFind.find v).mark m)
    // // 	 vl
    // //   in
    // // raise (NonDistinctVariables (pos, vl'))
    // throw new Error('NonDistinctVariables')
    // }
    // with DuplicatedMark m ->
};

/** [generic_variables vl] checks that every variable in the list [vl]
    has rank [none]. */
let generic_variables = (pos: pos, vl: MultiEquation_variable[]) => {
    vl.forEach((v) => {
        const desc = find(v);
        if (desc.rank !== rank_none) {
            throw new Error(`Cannot generalize ${pos}`);
        }
    });
};

let generalize = (old_pool: pool, young_pool: pool) => {
    /* We examine the variables in the young pool and sort them by rank
     using a simple bucket sort mechanism. (Recall that every variable
     in the young pool must have rank less than or equal to the pool's
     number.)  These variables are also marked as ``young'', so as to
     be identifiable in constant time. */

    let young_number = young_pool.number;
    let sorted: MultiEquation_variable[][] = Array(young_pool.number + 1);
    for (let i = 0; i <= young_number; i++) {
        sorted[i] = [];
    }
    let young = Symbol('young');

    console.log('[generalizing]', sorted, young_pool.inhabitants);
    young_pool.inhabitants.forEach((v) => {
        const desc = find(v);
        desc.mark = young;
        let rank = desc.rank;
        sorted[rank] = [v, ...sorted[rank]];
    });
    /* Next, we update the ranks of the young variables. One goal is to ensure
     that if [v1] is dominated by [v2], then the rank of [v1] is less than or
     equal to the rank of [v2], or, in other words, that ranks are
     nonincreasing along any path down the structure of terms.  The second
     goal is to ensure that the rank of every young variable is exactly the
     maximum of the ranks of the variables that it dominates, if there are
     any.

     The process consists of several depth-first traversals of the forest
     whose entry points are the young variables. Traversals stop at old
     variables. Roughly speaking, the first goal is achieved on the way
     down, while the second goal is achieved on the way back up.

     During each traversal, every visited variable is marked as such, so as
     to avoid being visited again. To ensure that visiting every variable
     once is enough, traversals whose starting point have lower ranks must
     be performed first. In the absence of cycles, this enforces the
     following invariant: when performing a traversal whose starting point
     has rank [k], every variable marked as visited has rank [k] or less
     already. (In the presence of cycles, this algorithm is incomplete and
     may compute ranks that are slightly higher than necessary.) Conversely,
     every non-visited variable must have rank greater than or equal to
     [k]. This explains why [k] does not need to be updated while going
     down. */

    let visited = Symbol('visited');
    for (let k = 0; k <= young_pool.number; k++) {
        let traverse = (v: MultiEquation_variable): number => {
            let desc = find(v);
            /* If the variable is young and was not visited before, we immediately
	 mark it as visited (which is important, since terms may be cyclic).
	 If the variable has no structure, we set its rank to [k]. If it has
	 some structure, we first traverse its sons, then set its rank to the
	 maximum of their ranks. */
            if (desc.mark === young) {
                desc.mark = visited;
                desc.rank = desc.structure
                    ? CA_fold(
                          (son, accu) => Math.max(traverse(son), accu),
                          desc.structure,
                          rank_outermost,
                      )
                    : k;
            } else if (desc.mark !== visited) {
                desc.mark = visited;
                if (k < desc.rank) {
                    desc.rank = k;
                }
            }
            /* If the variable isn't marked ``young'' or ``visited'', then it must
	 be old. Then, we update its rank, but do not pursue the computation
	 any further. */
            return desc.rank;
        };

        sorted[k].forEach((m) => traverse(m));
    }

    /* The rank of every young variable has now been determined as precisely
     as possible.

     Every young variable that has become an alias for some other (old or
     young) variable is now dropped. We need only keep one representative
     of each equivalence class.

     Every young variable whose rank has become strictly less than the
     current pool's number may be safely turned into an old variable. We do
     so by moving it into the previous pool. In fact, it would be safe to
     move it directly to the pool that corresponds to its rank. However, in
     the current implementation, we do not have all pools at hand, but only
     the previous pool.

     Every young variable whose rank has remained equal to the current
     pool's number becomes universally quantified in the type scheme that is
     being created. We set its rank to [none]. */

    for (let k = 0; k < young_number; k++) {
        sorted[k].forEach((v) => {
            if (!redundant(v)) {
                register(old_pool, v);
            }
        });
    }

    sorted[young_number].forEach((v) => {
        if (!redundant(v)) {
            const desc = find(v);
            if (desc.rank < young_number) {
                register(old_pool, v);
            } else {
                desc.rank = rank_none;
                if (desc.kind === 'Flexible') {
                    desc.kind = 'Rigid';
                }
            }
        }
    });
};
/** [outermost] is the rank assigned to variables that are
    existentially bound at the outermost level. */
let rank_outermost = 0;

let unify_terms = (
    pos: pos,
    pool: pool,
    t1: MultiEquation_variable,
    t2: MultiEquation_variable,
) => {
    unify(pos, (v) => register(pool, v), t1, t2);
};
