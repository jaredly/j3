
(type Read [(`Read () string)])
(type Write [(`Write string ())])

(defn print [x :string]
	(`Write x (fn [()] (`Return ()))))

(def read (`Read () (fn [v :string] (`Return v))))

(def alwaysRead (<> [Inner :task R]
	(fn [readResponse :string task :(@Task [Read Inner] R)] :(@Task [Inner] R)
		(switch task
		(`Return result) (`Return result)
		(`Read _ k) ((>< alwaysRead Inner R) readResponse (k readResponse))
		otherwise ((>< withHandler [Inner] R [Read] R) otherwise (fn [task] ((>< alwaysRead Inner R) readResponse task))))
)))

(def collect (<> [Inner :task] (fn [task :(@Task [Write Inner] ())] :(@Task Inner string)
	(switch task
		(`Return ()) (`Return "end")
		(`Write v k) (
			(>< andThen Inner [] string string)
			((>< collect Inner) (k ()))
			(fn [res] (`Return "${v}\n${res}"))
		)
		otherwise ((>< withHandler Inner () Write string) otherwise (>< collect Inner))
	)
)))

; so can we say
(collect <[]> something)
; is the same as
((>< collect []) something)
; ?
; (answer) NO that's too much magic
; ok but really though, maybe I do want something like that?
(collect (<> []) something)
; andddd but how do we distinquish it ... from the other kind?
; like
(<> collect []) ; needs to be a way to type-apply *without* applying it.
; maybe
(collect (:<> []) something)
; ... I mean I guess....
; yeah I guess that wouldn't conflict with current syntax.
; it's a little bit of a divergence from strict lispyness
;
; but I do want the ability to type-apply /after/ specifying the dealio.

"
ok
so

adding new kinds of lists is dicey.

alrighty, back to the generics question.

[] are arrays
() are linked lists, sure idk

anything can have decorators, which are identified by name.

{} are maps, which have to have two of each thing... I'm pretty sure.

! is our cps macro madness.

um can I stick type application in a decorator?
I don't super love it

ok I'll just do the normal thing. It's fine.

"


(let [(`Return v)
	((>< collect [])
		(fn [()]
			(! print "Hello")
			(! print "World")
		)
	)]
	(== v "Hello\nWorld\nend")
)

(let [
	(`Return v)
	((>< collect [])
		((>< alwaysRead [Write] ())
			"hi"
			((fn []
				(print "${! read} and ${! read}")
			))
		)
	)
] (== v "hi and hi\nend"))

(*
let reverse: (t: Task<Write, ()>) => Task<Write, ()> = (task: Task<Write, ()>) => switch task {
    `Return(v) => `Return(v);
    `Write(v, k) => (() => {
        reverse(k(()))!;
        print(v)!;
    })();
}
let expect = <T: eq>(`Return(m): Task<[], T>, e: T) => m == e
expect<string>(
    collect<[]>(reverse((() => {
        print("A")!;
        print("B")!;
        print("C")!;
    })())),
    "C\nB\nA\nend",
)
type Decide = [`Decide((), bool)]
let decide: Task<Decide, bool> = `Decide((), (b: bool) => `Return(b))
let choose = <T>(x: T, y: T) => {
    if decide! {
        x;
    } else {
        y;
    };
}
let pickTrue: <T>(Task<Decide, T>) => T = <T>(task: Task<Decide, T>): T => switch task {
    `Return(v) => v;
    `Decide(_, k) => pickTrue<T>(k(true));
}
let chooseDiff = () => {
    let x1 = choose<int>(15, 30)!;
    let x2 = choose<int>(5, 10)!;
    x1 - x2;
}
pickTrue<int>(chooseDiff()) == 10
let pickMax: (Task<Decide, int>) => int = (task: Task<Decide, int>): int => {
    switch task {
        `Return(v) => v;
        `Decide(_, k) => {
            let one = pickMax(k(true));
            let two = pickMax(k(false));
            if one > two {
                one;
            } else {
                two;
            };
        };
    };
}
pickMax(chooseDiff()) == 25
type Fail = [`Fail((), [])]
let fail = `Fail((), ())
let chooseInt: (int, int) => Task<[Decide | Fail], int> = (m: int, n: int): Task<[Decide | Fail], int> => {
    if m > n {
        fail!;
    } else {
        if decide! {
            m;
        } else {
            chooseInt(m + 1, n)!;
        };
    };
}
let pythagorean = (m: int, n: int) => {
    let a = chooseInt(m, n - 1)!;
    let b = chooseInt(a + 1, n)!;
    let a2 = a * a;
    let b2 = b * b;
    if isSquare(a2 + b2) {
        (a, b);
    } else {
        fail!;
    };
}
let backtrack: <T>(Task<[Decide | Fail], T>, () => T) => T = <T>(
    task: Task<[Decide | Fail], T>,
    orElse: () => T,
): T => {
    switch task {
        `Decide(_, k) => {
            backtrack<T>(k(true), () => backtrack<T>(k(false), orElse));
        };
        `Fail(_, _) => {
            orElse();
        };
        `Return(x) => x;
    };
}
let backtrackPythag = (m: int, n: int) => backtrack<(int, int)>(pythagorean(m, n), () => (0, 0))
backtrackPythag(4, 15) == (5, 12)
backtrackPythag(7, 10) == (0, 0)
*)