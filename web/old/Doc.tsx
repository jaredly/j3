import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { applyAndResolve } from '../../src/get-type/matchesType';
import { Ctx } from '../../src/to-ast/Ctx';
// import { makeRCtx, nodeForExpr } from '../src/to-cst/nodeForExpr';
import { nodeForType } from '../../src/to-cst/nodeForType';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { errorToString } from '../../src/to-cst/show-errors';
import { NodeList, Type } from '../../src/types/ast';
import { fromMCST, MNode } from '../../src/types/mcst';
import { Events, Node } from './Nodes';
import { EvalCtx, Path, Store } from '../store';
import { KeyMonitor } from './KeyMonitor';

const topPath: Path[] = [];
const emptyEvents: Events = {
    onLeft() {},
    onRight() {},
};

export type SetHover = (hover: { idx: number; box: any | null }) => void;

export const Doc = ({ store, ctx }: { store: Store; ctx: EvalCtx }) => {
    const { setHover, hover } = useHover(ctx);
    const menuPortal = React.useRef(null as null | Root);

    const top = React.useMemo(
        () => ({
            menuPortal,
            setHover,
            store,
            ctx,
        }),
        [],
    );

    return (
        <div style={{ margin: 24 }}>
            <div
                style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                }}
                onClick={() => {
                    const root = fromMCST(store.root, store.map) as NodeList;
                    navigator.clipboard.writeText(
                        root.values
                            .map((node) => nodeToString(node))
                            .join('\n\n'),
                    );
                }}
            >
                Copy
            </div>
            <div style={{ marginBottom: 500 }}>
                <Node
                    idx={store.root}
                    path={topPath}
                    events={emptyEvents}
                    top={top}
                />
                <KeyMonitor />
            </div>
            {hover && (
                <ShowHover
                    hover={hover}
                    ctx={ctx}
                    node={store.map[hover.idx]}
                />
            )}
            <div
                ref={(node) => {
                    if (node && !menuPortal.current) {
                        menuPortal.current = createRoot(node);
                    }
                }}
            />
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

const ShowResult = ({ result }: { result: EvalCtx['results'][0] }) => {
    if (result.status === 'failure') {
        return <>{'Eval failed\n'}</>;
    }
    if (result.status === 'errors') {
        return <>{'Errors in typing and such\n'}</>;
    }
    if (result.expr.type === 'def') {
        return <>{`${result.expr.name} : ${result.expr.hash}\n`}</>;
    }
    return <>{`Eval result: ${JSON.stringify(result.value)}\n`}</>;
};

function ShowHover({
    hover,
    ctx,
    node,
}: {
    hover: { idx: number; box: any };
    ctx: EvalCtx;
    node: MNode;
}) {
    const types = ctx.report.types[hover.idx];
    const errors = ctx.report.errors[hover.idx];
    const result = ctx.results[hover.idx];

    return (
        <>
            <div
                style={{
                    position: 'fixed',

                    left: hover.box.left,
                    top: hover.box.bottom,
                    pointerEvents: 'none',
                    zIndex: 100,
                    maxWidth: 400,
                    backgroundColor: 'black',
                    fontSize: '80%',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: 8,
                    whiteSpace: 'pre-wrap',
                }}
            >
                {result !== undefined ? <ShowResult result={result} /> : ''}
                {node.type === 'identifier' && node.hash
                    ? 'Hash: ' + node.hash + '\n'
                    : ''}
                {types ? 'Type: ' + showType(types, ctx.ctx) + '\n' : ''}
                {errors
                    ?.map((error) => errorToString(error, ctx.ctx))
                    .join('\n')}
            </div>
            <div
                style={{
                    position: 'fixed',

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
    let text = nodeToString(nodeForType(type, ctx));
    if (type.type === 'global') {
        const res = applyAndResolve(type, ctx, []);
        if (res.type !== 'error' && res.type !== 'local-bound') {
            return text + ' = ' + nodeToString(nodeForType(res, ctx));
        }
    }
    return text;
};
