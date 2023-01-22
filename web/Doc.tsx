import * as React from 'react';
import { parse } from '../src/grammar';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { addDef, Ctx, newCtx, noForm } from '../src/to-ast/to-ast';
import { Events, Node } from './Nodes';
import { EvalCtx, initialStore, newEvalCtx, Path, Store } from './store';
import { compile } from './compile';
import { nodeToString } from '../src/to-cst/nodeToString';
import { makeRCtx } from '../src/to-cst/nodeForExpr';
import { nodeForType } from '../src/to-cst/nodeForType';
import { Node as NodeT } from '../src/types/cst';
import { errorToString } from '../src/to-cst/show-errors';
import localforage from 'localforage';
import { Type } from '../src/types/ast';
import { applyAndResolve } from '../src/get-type/matchesType';

const topPath: Path[] = [];
const emptyEvents: Events = {
    onLeft() {},
    onRight() {},
};

export type SetHover = (hover: { idx: number; box: any | null }) => void;

export const Doc = ({ store, ctx }: { store: Store; ctx: EvalCtx }) => {
    const altDown = useAltDown();

    const [hover, setHoverInner] = React.useState(
        [] as { idx: number; box: any }[],
    );

    const best = React.useMemo(() => {
        for (let i = hover.length - 1; i >= 0; i--) {
            if (
                (altDown && ctx.report.types[hover[i].idx]) ||
                ctx.report.errors[hover[i].idx]
            ) {
                return hover[i];
            }
        }
        return null;
    }, [hover, altDown]);

    const setHover2 = React.useCallback<SetHover>((hover) => {
        setHoverInner((h) => {
            if (hover.box) {
                return [...h, hover];
            } else {
                for (let i = h.length - 1; i >= 0; i--) {
                    if (h[i].idx === hover.idx) {
                        const res = [...h];
                        res.splice(i, 1);
                        return res;
                    }
                }
                return h;
            }
        });
    }, []);

    return (
        <div style={{ margin: 24 }}>
            <div>
                <Node
                    idx={store.root}
                    store={store}
                    ctx={ctx}
                    path={topPath}
                    setHover={setHover2}
                    events={emptyEvents}
                />
            </div>
            {best && <ShowHover best={best} ctx={ctx} />}
        </div>
    );
};

function ShowHover({
    best,
    ctx,
}: {
    best: { idx: number; box: any };
    ctx: EvalCtx;
}) {
    return (
        <>
            <div
                style={{
                    position: 'absolute',

                    left: best.box.left,
                    top: best.box.bottom,
                    pointerEvents: 'none',
                    zIndex: 100,
                    backgroundColor: 'black',
                    fontSize: '80%',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: 8,
                    whiteSpace: 'pre',
                }}
            >
                {ctx.report.types[best.idx]
                    ? 'Type: ' +
                      showType(ctx.report.types[best.idx], ctx.ctx) +
                      '\n'
                    : ''}
                {ctx.report.errors[best.idx] &&
                    ctx.report.errors[best.idx]
                        .map((error) => errorToString(error, ctx.ctx))
                        .join('\n')}
            </div>
            <div
                style={{
                    position: 'absolute',

                    left: best.box.left,
                    top: best.box.top,
                    height: best.box.height,
                    width: best.box.width,
                    pointerEvents: 'none',
                    zIndex: 50,
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                }}
            ></div>
        </>
    );
}

function useAltDown() {
    const [altDown, setAltDown] = React.useState(false);

    React.useEffect(() => {
        const fn = (evt: KeyboardEvent) => {
            if (evt.key === 'Alt') {
                setAltDown(true);
            }
        };
        const up = (evt: KeyboardEvent) => {
            if (evt.key === 'Alt') {
                setAltDown(false);
            }
        };
        document.addEventListener('keydown', fn);
        document.addEventListener('keyup', up);
        return () => {
            document.removeEventListener('keydown', fn);
            document.removeEventListener('keyup', up);
        };
    }, []);
    return altDown;
}

export const showType = (type: Type, ctx: Ctx): string => {
    let text = nodeToString(nodeForType(type, makeRCtx(ctx)));
    if (type.type === 'global') {
        const res = applyAndResolve(type, ctx, []);
        if (res.type !== 'error' && res.type !== 'local-bound') {
            return text + ' = ' + nodeToString(nodeForType(res, makeRCtx(ctx)));
        }
    }
    return text;
};
