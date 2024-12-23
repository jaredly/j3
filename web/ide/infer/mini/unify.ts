//

import { vToString } from '.';
import {
    Mark_none,
    MultiEquation_descriptor,
    MultiEquation_variable,
    pos,
} from './infer';
import { equivalent, find, fresh, union } from './union_find';

/* [unify register v1 v2] equates the variables [v1] and [v2]. That
   is, it adds the equation [v1 = v2] to the constraint which it
   maintains, then rewrites it in a number of ways until an
   inconsistency is found or a solved form is reached. If the
   former, then [Inconsistency] is raised.

   Any variables which are freshly created during the process are
   passed to [register], so as to make the caller aware of their
   existence. */
type structure = MultiEquation_descriptor['structure'];

export const unify = (
    pos: pos,
    register: (v: MultiEquation_variable) => unknown,
    t1: MultiEquation_variable,
    t2: MultiEquation_variable,
) => {
    /* Define an auxiliary function which creates a fresh variable,
     found within a multi-equation of its own, with specified
     rank and structure. */

    let _unify = (
        pos: pos,
        v1: MultiEquation_variable,
        v2: MultiEquation_variable,
    ): void => {
        /* If the two variables already belong to the same multi-equation,
       there is nothing to do. This check is not just an optimization;
       it is essential in guaranteeing termination, since we are
       dealing with potentially cyclic structures. */

        if (equivalent(v1, v2)) {
            // console.log('equivalent, no need', v1);
            return;
        }
        // Before performing a recursive call, we will merge the
        // multi-equations associated with [v1] and [v2]. We can't
        // do this right here and now, however, because we need to
        // look at their structure to determine which descriptor it
        // is best (more economical) to keep.

        // Our first step is to compare the ranks of the two multi-equations,
        // so as to compute the minimum rank.

        // This enables us to give correct and efficient versions of a number
        // of auxiliary functions:

        // [fresh] specializes [fresh] (defined above) with the minimum rank.
        // [merge] merges the multi-equations, keeping an arbitrary structure.
        // [merge1] merges the multi-equations, keeping the former's structure.
        // [merge2] merges the multi-equations, keeping the latter's structure.
        const desc1 = find(v1);
        const desc2 = find(v2);

        const { fresh, merge, merge1, merge2 } = getit(register, v1, v2);
        const filter = (v: MultiEquation_variable, term: structure) =>
            _unify(pos, v, fresh(term));

        const s1 = desc1.structure;
        const s2 = desc2.structure;

        // Neither (or just one) multi-equation contains a term.
        // Merge them; we're done.
        if (is_flexible(v1) && is_flexible(v1) && !s1 && !s2) {
            return merge();
        }
        if (is_flexible(v1) && !s1) {
            return merge2();
        }
        if (is_flexible(v2) && !s2) {
            return merge1();
        }
        // Exactly one multi-equation contains a term; keep it. *)
        if (s1?.type === 'Var') {
            return _unify(pos, s1.value, v2);
        }
        if (s2?.type === 'Var') {
            return _unify(pos, s2.value, v1);
        }
        //   (* It is forbidden to unify rigid type variables with
        //  a structure. *)
        if (!s1) {
            if (desc1.kind === 'Constant') {
                if (desc1.name === 'abs') {
                    throw new Error(
                        `Label not present in record ${vToString(v2)}`,
                    );
                }
                throw new Error(
                    `cant unify builtin type ${desc1.name} with ${vToString(
                        v2,
                    )}`,
                );
            }
            console.log(desc1, s2);
            throw new Error(`cannot unify rigid`);
        }
        if (!s2) {
            if (desc2.kind === 'Constant') {
                if (desc2.name === 'abs') {
                    throw new Error(
                        `Label not present in record ${vToString(v1)}`,
                    );
                }
                throw new Error(
                    `cant unify builtin type ${desc2.name} with ${vToString(
                        v1,
                    )}`,
                );
            }
            throw new Error(`cannot unify rigid 2`);
        }

        //   (* Both multi-equations contain terms whose head symbol belong
        //      to the free algebra [A]. Merge the multi-equations
        //      (dropping one of the terms), then decompose the equation
        //      that arises between the two terms. Signal an error if the
        //      terms are incompatible, i.e. do not have the same head
        //      symbol. *)
        if (s1.type === 'App' && s2.type === 'App') {
            merge();
            _unify(pos, s1.fn, s2.fn);
            _unify(pos, s1.arg, s2.arg);
            return;
        }
        //   (* Both multi-equations contain a uniform row term. Merge the
        //      multi-equations (dropping one of the terms), then decompose
        //      the equation that arises between the two terms. *)
        if (s1.type === 'RowUniform' && s2.type === 'RowUniform') {
            merge();
            return _unify(pos, s1.value, s2.value);
        }

        //   (* Both multi-equations contain a ``row cons'' term. Compare
        //      their labels. *)
        if (s1.type === 'RowCons' && s2.type === 'RowCons') {
            if (s1.label === s2.label) {
                merge();
                _unify(pos, s1.head, s2.head);
                _unify(pos, s1.tail, s2.tail);
                return;
            } else {
                //   (* The labels do not coincide. We must choose which
                //      descriptor (i.e. which term) to keep. We choose to
                //      keep the one that exhibits the smallest label
                //      (according to an arbitrary, fixed total order on
                //      labels). This strategy favors a canonical
                //      representation of rows, where smaller labels come
                //      first. This should tend to make the cheap case above
                //      more frequent, thus allowing rows to be unified in
                //      quasi-linear time. *)
                if (s1.label < s2.label) {
                    merge1();
                } else {
                    merge2();
                }
                //   (* Decompose the equation that arises between the two
                //      terms. We must create an auxiliary row variable, as
                //      well as two auxiliary row terms. Because their value
                //      is logically determined by that of [v1] or [v2], it
                //      is appropriate to give them the same rank. *)
                let tl = fresh(undefined);
                filter(s1.tail, {
                    type: 'RowCons',
                    label: s2.label,
                    head: s2.head,
                    tail: tl,
                });
                filter(s2.tail, {
                    type: 'RowCons',
                    label: s1.label,
                    head: s1.head,
                    tail: tl,
                });
                return;
            }
        }

        //   (* The left-hand multi-equation contains a ``row cons'' term,
        //      while the right-hand one contains a ``free'' term; or the
        //      converse. *)
        const rowApp = (
            r: Extract<structure, { type: 'RowCons' }>,
            app: Extract<structure, { type: 'App' }>,
        ) => {
            let attach = (son: MultiEquation_variable): structure => {
                let hd = fresh(undefined);
                let tl = fresh(undefined);
                filter(son, {
                    type: 'RowCons',
                    label: r.label,
                    head: hd,
                    tail: tl,
                });
                return { type: 'App', fn: hd, arg: tl };
            };
            const one = attach(app.fn);
            const two = attach(app.arg);
            filter(r.head, one);
            filter(r.tail, two);
            return;
        };

        if (s1.type === 'RowCons' && s2.type === 'App') {
            return rowApp(s1, s2);
        }
        if (s2.type === 'RowCons' && s1.type === 'App') {
            return rowApp(s2, s1);
        }

        const uniApp = (
            r: Extract<structure, { type: 'RowUniform' }>,
            app: Extract<structure, { type: 'App' }>,
        ) => {
            let attach = (
                son: MultiEquation_variable,
            ): MultiEquation_variable => {
                let content = fresh(undefined);
                filter(son, { type: 'RowUniform', value: content });
                return content;
            };
            filter(r.value, {
                type: 'App',
                fn: attach(app.fn),
                arg: attach(app.arg),
            });
            return;
        };
        if (s1.type === 'RowUniform' && s2.type === 'App') {
            return uniApp(s1, s2);
        }
        if (s2.type === 'RowUniform' && s1.type === 'App') {
            return uniApp(s2, s1);
        }
        //   (* Keep the uniform representation, which is more compact. *)

        if (s1.type === 'RowCons' && s2.type === 'RowUniform') {
            merge2();

            //   (* Decompose the equation that arises between the two
            //  terms. To do so, equate [hd1] with [content2], then
            //  equate [tl1] with a fresh uniform row whose content is
            //  [content2].

            //  Note that, instead of creating the latter fresh, one
            //  may wish to re-use [v2], which is also a uniform row
            //  whose content is [content2]. However, these two terms
            //  do not have the same sort. Although this optimization
            //  would most likely be correct, its proof of correctness
            //  would be more involved, requiring a single variable to
            //  simultaneously possess several sorts. *)

            _unify(pos, s1.head, s2.value);
            filter(s1.tail, { type: 'RowUniform', value: s2.value });
            return;
        }
        if (s2.type === 'RowCons' && s1.type === 'RowUniform') {
            merge1();
            _unify(pos, s2.head, s1.value);
            filter(s2.tail, { type: 'RowUniform', value: s1.value });
            return;
        }
        console.warn('Got here somehow', s1, s2);
    };

    return _unify(pos, t1, t2);
};

const getit = (
    register: (v: MultiEquation_variable) => unknown,
    v1: MultiEquation_variable,
    v2: MultiEquation_variable,
) => {
    let fresh_ = (
        name: string | undefined,
        kind: MultiEquation_descriptor['kind'],
        rank: number,
        structure: structure,
    ) => {
        let v = fresh({
            structure: structure,
            rank: rank,
            mark: Mark_none,
            kind: kind,
            name: name,
        });
        register(v);
        return v;
    };

    const desc1 = find(v1);
    const desc2 = find(v2);

    let kind: MultiEquation_descriptor['kind'] = is_rigid(v1)
        ? desc1.kind
        : is_rigid(v2)
        ? desc2.kind
        : 'Flexible';

    let name: string | undefined;
    if (desc1.name && desc2.name) {
        if (desc1.name !== desc2.name) {
            if (is_rigid(v1)) {
                name = desc1.name;
            } else if (is_rigid(v2)) {
                name = desc2.name;
            }
        } else {
            name = desc1.name;
        }
    } else {
        name = desc1.name ?? desc2.name;
    }
    // console.log(` 😅 getit "${desc1.name}" "${desc2.name}" ->`, name);

    let rank1 = desc1.rank;
    let rank2 = desc2.rank;
    if (rank1 < rank2) {
        let merge1 = () => {
            union(v2, v1);
            desc1.kind = kind;
            desc1.name = name;
        };
        let merge2 = () => {
            union(v2, v1);
            desc1.kind = kind;
            desc1.name = name;
            desc1.structure = desc2.structure;
        };
        return {
            fresh: (m: structure | undefined) => fresh_(name, kind, rank1, m),
            merge: merge1,
            merge1,
            merge2,
        };
    } else {
        let merge1 = () => {
            union(v1, v2);
            desc2.structure = desc1.structure;
            desc2.kind = kind;
            desc2.name = name;
        };
        let merge2 = () => {
            union(v1, v2);
            desc2.kind = kind;
            desc2.name = name;
        };
        return {
            fresh: (m: structure | undefined) => fresh_(name, kind, rank2, m),
            merge: merge2,
            merge1,
            merge2,
        };
    }
};

export let is_rigid = (v: MultiEquation_variable) => {
    const kind = find(v).kind;
    return kind === 'Rigid' || kind === 'Constant';
};

export let is_flexible = (v: MultiEquation_variable) => {
    return find(v).kind === 'Flexible';
};
