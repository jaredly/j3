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

const seg = new Intl.Segmenter('en');

export const splitGraphemes = (text: string) => {
    return [...seg.segment(text)].map((seg) => seg.segment);
};

export const parseByCharacter = (
    rawText: string,
    debug = false,
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

    const text = splitGraphemes(rawText);
    console.log(text);

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
        if (key === '\n') {
            key = 'Enter';
        }

        const curText = idText(map[selection.idx]) ?? '';
        const pos = selPos(selection, curText);

        const update = getKeyUpdate(
            key,
            pos,
            curText,
            selection.idx,
            path,
            map,
        );
        if (debug) {
            console.log(key, path);
            console.log(JSON.stringify(update));
        }

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
            Object.keys(update.update.map).forEach((key) => {
                if (update.update!.map[+key] == null) {
                    delete map[+key];
                } else {
                    map[+key] = update.update!.map[+key]!;
                }
            });
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

export function selPos(selection: Selection, curText: string) {
    return selection.loc === 'start' ||
        selection.loc === 'inside' ||
        selection.loc === 'change' ||
        !selection.loc
        ? 0
        : selection.loc === 'end'
        ? splitGraphemes(curText).length
        : selection.loc;
}
