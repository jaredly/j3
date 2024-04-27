// hm

export const fuzzyScore = (
    exactWeight: number,
    query: string,
    term: string,
): FuzzyScore => {
    if (query.length === 0) {
        return {
            loc: -1,
            score: 0,
            full: true,
            exact: false,
            breaks: 0,
            breakSize: 0,
            len: term.length,
        };
    }
    query = query.toLowerCase();
    term = term.toLowerCase();
    if (query === term) {
        return {
            loc: 0,
            score: exactWeight,
            full: true,
            exact: true,
            breaks: 0,
            breakSize: 0,
            len: term.length,
        };
    }
    const idx = term.indexOf(query);
    if (idx !== -1) {
        return {
            loc: idx,
            score: exactWeight,
            exact: false,
            full: true,
            breaks: 0,
            breakSize: 0,
            len: term.length,
        };
    }
    let qi = 0,
        ti = 0,
        score = 0,
        loc = -1,
        matchedLast = true,
        breaks = 0,
        breakSize = 0;
    for (; qi < query.length && ti < term.length; ) {
        if (query[qi] === term[ti]) {
            score = score + (matchedLast ? 3 : 1);
            loc = qi === 0 ? ti : loc;
            qi++;
            matchedLast = true;
        } else {
            if (matchedLast && loc !== -1) {
                breaks += 1;
            }
            if (loc !== -1) {
                breakSize += 1;
            }
            matchedLast = false;
        }
        ti++;
    }
    // console.log('end and', ti, term.length)
    return {
        loc,
        score,
        full: qi >= query.length,
        // full: ti >= term.length,
        exact: false,
        breaks,
        breakSize,
        len: term.length,
    };
};

export type FuzzyScore = {
    loc: number;
    score: number;
    full: boolean;
    exact: boolean;
    breaks: number;
    breakSize: number;
    len: number;
};

export const compareScores = (one: FuzzyScore, two: FuzzyScore): number => {
    if (one.exact && two.exact) {
        return one.score - two.score;
    }
    if (one.exact) {
        return -1;
    }
    if (two.exact) {
        return 1;
    }
    if (one.full && two.full) {
        if (one.score == two.score) {
            return one.loc - two.loc;
        }
        return one.score - two.score;
    }
    return one.full ? -1 : 1;
};

// const maxScore(_ one: FuzzyScore, _ two: FuzzyScore) -> FuzzyScore {
//     if compareScores(one, two) {
//         return one
//     }
//     return two
// }

// export const fuzzysearch = (needle: string, haystack: string) => {
//     if (needle.length > haystack.length) {
//         return false;
//     }
//     if (needle.length === haystack.length) {
//         return needle === haystack;
//     }
//     if (needle.length === 0) {
//         return true;
//     }
//     for (let i = 0, j = 0; i < needle.length && j < haystack.length; ) {
//         if (needle[i] === haystack[j]) {
//             i++;
//         }
//         j++;
//     }
//     return false;
// };
