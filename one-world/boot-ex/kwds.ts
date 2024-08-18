// builtin forms, idk. autocomplete kind = kwd

import { RecNodeT } from '../shared/nodes';

type Auto = {
    text: string;
    toplevel?: boolean;
    // Sooo I kinda want there to be able to be multiple templates to choose from?
    // idk like (fn x) and (fn [a] x) right?
    // idk if it's too niche.
    // like macros can totally admit muiltiple forms.
    // ok I'll do it now.
    templates: { template: RecNodeT<boolean>[]; docs: string }[];
};

const place = (text: string, focus = false): RecNodeT<boolean> => ({
    type: 'id',
    loc: focus,
    text: '',
    ref: { type: 'placeholder', text },
});

export const kwds: Auto[] = [
    {
        text: 'let',
        templates: [
            {
                template: [
                    {
                        type: 'table',
                        loc: false,
                        rows: [[place('pattern', true), place('value')]],
                    },
                    place('body'),
                ],
                docs: 'Locally bind variables',
            },
        ],
    },
    {
        text: 'match',
        templates: [
            {
                template: [
                    place('value', true),
                    {
                        type: 'table',
                        loc: false,
                        rows: [[place('pattern', true), place('value')]],
                    },
                ],
                docs: 'Destructure ADTs',
            },
        ],
    },
    {
        text: 'if',
        templates: [
            { template: [place('cond'), place('yes'), place('no')], docs: '' },
        ],
    },
    {
        text: '->',
        templates: [
            {
                template: [place('target'), place('transform')],
                docs: 'first argument chain',
            },
        ],
    },
    {
        text: '->>',
        templates: [
            {
                template: [place('target'), place('transform')],
                docs: 'last argument chain',
            },
        ],
    },
    {
        text: 'fn',
        templates: [
            {
                template: [
                    { type: 'array', loc: false, items: [place('pattern')] },
                    place('body'),
                ],
                docs: 'lambda function',
            },
        ],
    },
    {
        text: 'test',
        templates: [
            {
                template: [
                    place('function'),
                    {
                        type: 'table',
                        loc: false,
                        rows: [[place('input'), place('output')]],
                    },
                ],
                docs: 'fixture tests',
            },
        ],
    },
    {
        text: 'def',
        toplevel: true,
        templates: [
            {
                template: [place('name', true), place('value')],
                docs: 'global definition',
            },
        ],
    },
    {
        text: 'defn',
        toplevel: true,
        templates: [
            {
                template: [
                    place('name', true),
                    { type: 'array', items: [place('pattern')], loc: false },
                    place('body'),
                ],
                docs: 'global function definition',
            },
        ],
    },
    {
        text: 'deftype',
        toplevel: true,
        templates: [
            {
                template: [
                    place('name', true),
                    {
                        type: 'list',
                        loc: false,
                        items: [place('constructor'), place('argtype')],
                    },
                ],
                docs: 'global enum type definition',
            },
        ],
    },
];
