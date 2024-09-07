// ok
/**
(defn c-> [n f]
    (provide (f)
        (k <-c ()) (c-> (+ n 1) (fn (k n)))))

; does not work
(c-> 0 (fn (, (c-> 100 (fn (, <-c <-c))) <-c)))

; does work
(c-> 0 (fn (, (c-> 100 (fn <-c)) <-c)))


ign : '{g, C} (Nat, Nat) ->{g} (Nat, (Nat, Nat))
ign f = {13} {7}handle {8}!f with cases
    { pure } -> {12}(10, {11}pure)
    { cC _ -> k } -> (100, (100, 100))

> {16}({1}12, {2}handle {10}({3}2, {4}!cC) with cases
    { pure } -> (1, (3, pure))
    { cC _ -> k } -> {15}({5}2, {14} {6}ign '{9}(k 51)))

-> (12, (2, (10, (5, 51))))

*/

const ign = ($ef, f, $kont) => {
    // the pure case
    let done = (ef, v) => $kont(ef, [10, v]);
    let handlers = {
        cC: (_, $kef, $k) => {
            let $mef = $ef.filter((m) => m !== handlers);
            const rest = $kef.slice($ef.length + 1);
            const k = ($ef, v) => {
                done = $kont;
                $k($mef.concat(rest), v);
            };

            $kont($mef, [100, [100, 100]]);
        },
    };
    f([...$ef, handlers], null, (ef, v) =>
        done(
            ef.filter((m) => m !== handlers),
            v,
        ),
    );
};

const $kont = ($ef, v) => {
    console.log('done', $ef, v);
};

let $ef = [];
let done = ($ef, v) =>
    $kont(
        $ef.filter((m) => m !== handlers),
        h1,
        [3, v],
    );
let handlers = {
    cC: (_, $kef, $k) => {
        const $mef = $ef.filter((m) => m !== handlers);
        const rest = $kef.slice($ef.length + 1);
        const k = ($ef, v, $kont) => {
            done = $kont;
            $k($ef.filter((m) => m !== handlers).concat(rest), v);
        };

        ign(
            $mef,
            ($ef, _, d) => k($ef, 5, d),
            ($ef, v) => $kont($ef, [2, v]),
        );
    },
};
let $mef = [...$ef, handlers];
$mef.findLast((m) => m['cC'])['cC'](null, $mef, ($ef, v) => done($ef, v));

const $unit = null;

const $find = (ef, name) => {
    for (let i = ef.length - 1; i >= 0; i--) {
        if (ef[i][name]) {
            return ef[i][name];
        }
    }
    console.log(ef);
    throw new Error(`cant find ef ${name}`);
};

const c_ = ($effects, n, f, $kont) => {
    let odone = $kont;
    const $provided = {
        'c->': ($effects, _any, $k) => {
            $effects = $effects.filter((m) => m !== $provided);
            c_($effects, n + 1, ($ef, _, $do) => $k($ef, n, $do), $kont);
        },
    };
    f([...$effects, $provided], $unit, $kont);
};

const final = ($ef, value, $maybe) => {
    if ($maybe !== final) {
        console.warn('Final not final?');
        return $maybe($ef, value, final);
    } else {
        console.log('got final', value);
    }
};

c_(
    [],
    0,
    ($ef, _, $done) => {
        $find($ef, 'c->')($ef, null, $done);
    },
    final,
);

c_(
    [],
    0,
    ($ef, _, $done0) => {
        $find($ef, 'c->')($ef, null, ($ef, v, $done1) =>
            $find($ef, 'c->')($ef, v, ($ef, v2, $done2) =>
                $done2($ef, [v, v2], $done1),
            ),
        );
    },
    final,
);

const c2 = (ef, n, inner, done) =>
    c_(
        ef,
        n,
        ($ef, _, $done) => {
            $find($ef, 'c->')($ef, null, ($ef, v, $done) =>
                $find($ef, 'c->')($ef, v, ($ef, v2, $done) =>
                    inner($ef, [v, v2], $done),
                ),
            );
        },
        done,
    );

c2(
    [],
    0,
    ($ef, v, $done) => {
        c2($ef, 100, ($ef, v2, $done2) => $done2($ef, [v, v2], $done), $done);
    },
    final,
);

// c_(
//   [],
//   0,
//   ($ef, _, $d) => c_(
//     $ef,
//     100,
//     ($ef, _, $d) => ,
//     $d,
//   ),
//   ($ef, value, $d) => {
//     console.log(value, 'final done, and the done fn is', $d)
//   })
