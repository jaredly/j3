//

export type point<t> = {
    link:
        | { type: 'Info'; weight: number; descriptor: t }
        | { type: 'Link'; point: point<t> };
};
/** [fresh desc] creates a fresh point and returns it. It forms an
    equivalence class of its own, whose descriptor is [desc]. */
export const fresh = <t>(desc: t): point<t> => ({
    link: { type: 'Info', weight: 1, descriptor: desc },
});
/** [repr point] returns the representative element of [point]'s
    equivalence class. It is found by starting at [point] and following
    the links. For efficiency, the function performs path compression
    at the same time. */
export const repr = <t>(point: point<t>): point<t> => {
    if (point.link.type === 'Info') {
        return point;
    }
    let p2 = repr(point.link.point);
    if (p2 !== point.link.point) {
        /* [point''] is [point']'s representative element. Because we
	   just invoked [repr point'], [point'.link] must be [Link
	   point'']. We write this value into [point.link], thus
	   performing path compression. Note that this function never
	   performs memory allocation. */
        point.link = point.link.point.link;
    }
    return p2;
};

/** [find point] returns the descriptor associated with [point]'s
    equivalence class. */
export const find = <t>(point: point<t>): t => {
    if (point.link.type === 'Info') {
        return point.link.descriptor;
    }
    if (point.link.point.link.type === 'Info') {
        return point.link.point.link.descriptor;
    }
    return find(repr(point));
};

export const change = <t>(point: point<t>, v: t): t => {
    if (point.link.type === 'Info') {
        point.link.descriptor = v;
        return v;
    }
    if (point.link.point.link.type === 'Info') {
        point.link.point.link.descriptor = v;
        return v;
    }
    return change(repr(point), v);
};

/** [union point1 point2] merges the equivalence classes associated
    with [point1] and [point2] (which must be distinct) into a single
    class whose descriptor is that originally associated with [point2].

    The fact that [point1] and [point2] do not originally belong to the
    same class guarantees that we do not create a cycle in the graph.

    The weights are used to determine whether [point1] should be made
    to point to [point2], or vice-versa. By making the representative
    of the smaller class point to that of the larger class, we
    guarantee that paths remain of logarithmic length (not accounting
    for path compression, which makes them yet smaller). */
export let union = <t>(point1: point<t>, point2: point<t>) => {
    point1 = repr(point1);
    point2 = repr(point2);

    if (point1 === point2) {
        throw new Error(`cant union something to itself`);
    }
    if (point1.link.type !== 'Info' || point2.link.type !== 'Info') {
        throw new Error('repr failed');
    }
    const info1 = point1.link;
    const info2 = point2.link;

    let weight1 = info1.weight;
    let weight2 = info2.weight;

    // console.log(
    //     'Union! Preserving ',
    //     JSON.stringify(point2),
    //     ' and overwriting',
    //     JSON.stringify(point1),
    // );

    if (weight1 >= weight2) {
        point2.link = { type: 'Link', point: point1 };
        info1.weight = weight1 + weight2;
        info1.descriptor = info2.descriptor;
    } else {
        point1.link = { type: 'Link', point: point2 };
        info2.weight = weight1 + weight2;
    }
};
/** [equivalent point1 point2] tells whether [point1] and [point2]
    belong to the same equivalence class. */
export const equivalent = <t>(point1: point<t>, point2: point<t>) => {
    return repr(point1) === repr(point2);
};

/** [redundant] maps all members of an equivalence class, but one, to
    [true]. */
export const redundant = <t>(point: point<t>) => point.link.type === 'Link';
