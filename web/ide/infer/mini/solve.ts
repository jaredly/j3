import {
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
import { find, fresh } from './union_find';

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
    let m = Mark_frash();
    let setp = (desc: MultiEquation_descriptor) => desc.mark === m;
    let set = (desc: MultiEquation_descriptor, v: MultiEquation_variable) => {
        desc.mark = m;
        desc.var = v;
    };
    let get = (desc: MultiEquation_descriptor) => desc.var!;

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
    v_;
};

const _solve = (env: _env, pool: pool, c: tconstraint) => {
    let final_env = { current: env };
    let solve = (env: _env, pool: pool, c: tconstraint) => {
        let pos = c.pos;
        // try/catch Inconsistncy?
        solve_constraint(env, pool, c);
    };
    let solve_constraint = (env: _env, pool: pool, c: tconstraint) => {
        switch (c.type) {
            case 'True':
                return;
            case 'Dump':
                final_env.current = env;
                return;
            case 'Equation': {
                unify_terms(c.pos, pool, chop(pool, c.t1), chop(pool, c.t2));
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
                    c.schemes[0].flexible.forEach((f) => introduce(pool, f));
                    return solve(env, pool, c.schemes[0].constraint);
                }
                let env_ = c.schemes.reduce(
                    (env_, scheme) =>
                        concat(env_, solve_scheme(env, pool, scheme)),
                    env,
                );
                return solve(env_, pool, c.constraint);
            }
            case 'Instance': {
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

export const solve = (c: tconstraint) => {
    const env: _env = { type: 'Empty' };
    const pool: pool = { number: 0, inhabitants: [] };
    _solve(env, pool, c);
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
    let m = Mark_frash();
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
