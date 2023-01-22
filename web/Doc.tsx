import * as React from 'react';
import { applyAndResolve } from '../src/get-type/matchesType';
import { Ctx } from '../src/to-ast/to-ast';
import { makeRCtx } from '../src/to-cst/nodeForExpr';
import { nodeForType } from '../src/to-cst/nodeForType';
import { nodeToString } from '../src/to-cst/nodeToString';
import { errorToString } from '../src/to-cst/show-errors';
import { Type } from '../src/types/ast';
import { Events, Node } from './Nodes';
import { EvalCtx, Path, Store } from './store';

const topPath: Path[] = [];
const emptyEvents: Events = {
    onLeft() {},
    onRight() {},
};

export type SetHover = (hover: { idx: number; box: any | null }) => void;

export const Doc = ({ store, ctx }: { store: Store; ctx: EvalCtx }) => {
    const { setHover, hover } = useHover(ctx);

    return (
        <div style={{ margin: 24 }}>
            <div>
                <Node
                    idx={store.root}
                    store={store}
                    ctx={ctx}
                    path={topPath}
                    setHover={setHover}
                    events={emptyEvents}
                />
            </div>
            {hover && <ShowHover hover={hover} ctx={ctx} />}
        </div>
    );
};

function useHover(ctx: EvalCtx) {
    const altDown = useAltDown();
    const [hoverList, setHoverInner] = React.useState(
        [] as { idx: number; box: any }[],
    );

    const hover = React.useMemo(() => {
        for (let i = hoverList.length - 1; i >= 0; i--) {
            if (
                (altDown && ctx.report.types[hoverList[i].idx]) ||
                ctx.report.errors[hoverList[i].idx]
            ) {
                return hoverList[i];
            }
        }
        return null;
    }, [hoverList, altDown]);

    const setHover = React.useCallback<SetHover>((hover) => {
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

    return { setHover, hover };
}

function ShowHover({
    hover,
    ctx,
}: {
    hover: { idx: number; box: any };
    ctx: EvalCtx;
}) {
    const types = ctx.report.types[hover.idx];
    const errors = ctx.report.errors[hover.idx];

    return (
        <>
            <div
                style={{
                    position: 'absolute',

                    left: hover.box.left,
                    top: hover.box.bottom,
                    pointerEvents: 'none',
                    zIndex: 100,
                    backgroundColor: 'black',
                    fontSize: '80%',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: 8,
                    whiteSpace: 'pre',
                }}
            >
                {types ? 'Type: ' + showType(types, ctx.ctx) + '\n' : ''}
                {errors
                    ?.map((error) => errorToString(error, ctx.ctx))
                    .join('\n')}
            </div>
            <div
                style={{
                    position: 'absolute',

                    left: hover.box.left,
                    top: hover.box.top,
                    height: hover.box.height,
                    width: hover.box.width,
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
