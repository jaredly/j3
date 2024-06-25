// ok
/**
(defn c-> [n f]
    (provide (f)
        (k <-c ()) (c-> (+ n 1) (fn (k n)))))

; does not work
(c-> 0 (fn (, (c-> 100 (fn (, <-c <-c))) <-c)))

; does work
(c-> 0 (fn (, (c-> 100 (fn <-c)) <-c)))
*/

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
    ($ef, _, $done) => {
        $find($ef, 'c->')($ef, null, ($ef, v, $done) =>
            $find($ef, 'c->')($ef, v, ($ef, v2, $done) =>
                $done($ef, [v, v2], $done),
            ),
        );
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
