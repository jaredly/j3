// hmm
import { getKeyUpdate } from '../../web/mods/getKeyUpdate';
import { Path, Selection } from '../../web/store';
import { nidx } from '../grammar';
import { Map, MNode } from '../types/mcst';

export const idText = (node: MNode) => {
    switch (node.type) {
        case 'identifier':
        case 'comment':
            return node.text;
        case 'number':
        case 'unparsed':
            return node.raw;
        case 'accessText':
        case 'stringText':
            return node.text;
        case 'blank':
            return '';
        case 'tag':
            return "'" + node.text;
    }
};

export const parseByCharacter = (
    text: string,
): { map: Map; selection: Selection } => {
    const top = nidx();
    const map: Map = {
        [-1]: {
            type: 'list',
            values: [top],
            loc: { idx: -1, start: 0, end: 0 },
        },
        [top]: {
            type: 'blank',
            loc: { idx: 0, start: 0, end: 0 },
        },
    };
    let selection: Selection = { idx: top, loc: 0 };
    let path: Path[] = [{ idx: -1, child: { type: 'child', at: 0 } }];
    for (let i = 0; i < text.length; i++) {
        let key = text[i];
        if (key === '^') {
            key = {
                l: 'ArrowLeft',
                r: 'ArrowRight',
                b: 'Backspace',
            }[text[i + 1]]!;
            if (!key) {
                throw new Error(`Unexpected ^${text[i + 1]}`);
            }
            i++;
        }

        const curText = idText(map[selection.idx]) ?? '';

        // const current = map[selection.idx];
        const pos =
            selection.loc === 'start' ||
            selection.loc === 'inside' ||
            selection.loc === 'change' ||
            !selection.loc
                ? 0
                : selection.loc === 'end'
                ? curText.length
                : selection.loc;

        const update = getKeyUpdate(
            key,
            pos,
            curText,
            selection.idx,
            path,
            map,
        );
        // console.log(char, path);
        // console.log(JSON.stringify(update));

        // OOOOOOH um so
        // how do I go about updating the `path`?
        // I've been relying on ... circumstantial whatsits.
        // Should I have my `getKeyUpdate` be responsible for
        // calculating the path?
        // hmmm I guess it shouldn't be too laboreous

        if (update?.type === 'select') {
            selection = update.selection;
            path = update.path;
        } else if (update?.type === 'update' && update?.update) {
            Object.assign(map, update.update.map);
            selection = update.update.selection;
            path = update.update.path;

            // We're not doing any ast stuff here yet
            // if (update.auto) {
            //     // maybeCommitAutoComplete(idx, ectx, store);
            // }
        } else {
            // console.log('ahhh', char);
        }
    }
    return { map, selection };
};
