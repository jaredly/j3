import { KeyAction } from '../../keyActionToUpdate';
import { lastChild, move, NodeSelection, parentLoc, Path, selStart, SelUpdate } from '../../utils';
import { CId, CList, CTree, Op } from './ctree';

export type CTop = {
    tree: CTree;
    ts: () => string;
};

type Up = Op | SelUpdate;

export const justOps = (ups: Up[]): Op[] => ups.filter((up) => !('type' in up)) as Op[];

export const ctreeUpdate = (top: CTop, action: KeyAction, sel: NodeSelection): Up[] | null => {
    switch (action.type) {
        case 'move':
            return [action.end ? move({ end: action.end, start: action.sel }) : move({ start: action.sel })];
        case 'sel-expand':
            return [move({ start: sel.start, end: action.sel })];
        case 'set-id-text':
            return setIdText(top, action.path, action.text, action.end, action.ccls);
    }
    console.warn(`no update ${action.type}`);
    return null;
};

export const setIdText = (top: CTop, path: Path, text: string, end: number, ccls?: number): Up[] => {
    if (text.length === 0) {
        const pnode = top.tree.node(parentLoc(path));
        if (pnode instanceof CList) {
            if (pnode.kind === 'smooshed') {
                // not handling the 'rm from smooshed' case right now
                throw new Error(`need to do a removeSelf`);
            }
        }
    }
    const node = top.tree.node(lastChild(path));
    if (!(node instanceof CId)) {
        return [];
    }
    return [node.setText(top.ts(), text, node.ccls ?? ccls), { type: 'move', to: { start: selStart(path, { type: 'id', end }) } }];
};
