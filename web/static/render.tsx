import './poly';
import path from 'path';
import fs, { readFileSync } from 'fs';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { findTops } from '../ide/ground-up/findTops';
import { NUIState } from '../custom/UIState';
import { fromMCST } from '../../src/types/mcst';
import { RenderStatic } from '../custom/RenderStatic';
import '../fonts/prism';

const state: NUIState = JSON.parse(
    // readFileSync('../../data/tmp/intro.json', 'utf-8'),
    readFileSync('../../data/tmp/structured-editor.json', 'utf-8'),
);
const tops = findTops(state);

const rtops = tops.map((top) => {
    const node = fromMCST(top.top, state.map);
    return <RenderStatic node={node} />;
});

fs.writeFileSync(
    './ok.html',
    ReactDOMServer.renderToString(
        <html>
            <head>
                <link rel="stylesheet" href="../fonts/prism.css" />
                <style
                    dangerouslySetInnerHTML={{
                        __html: `@font-face {
                font-family: 'Jet Brains';
                src: url('../fonts/JetBrainsMono[wght].ttf');
                font-weight: 100 900;
                font-style: normal;
            }

            @font-face {
                font-family: 'Jet Brains Italic';
                src: url('../fonts/JetBrainsMono-Italic[wght].ttf');
                font-weight: 100 900;
                font-style: normal;
            }

            @font-face {
                font-family: 'Merriweather';
                src: url('../fonts/Merriweather-Regular.ttf');
                font-weight: normal;
                font-style: normal;
            }

            @font-face {
                font-family: 'Merriweather';
                src: url('../fonts/Merriweather-Italic.ttf');
                font-weight: normal;
                font-style: italic;
            }

            @font-face {
                font-family: 'Merriweather';
                src: url('../fonts/Merriweather-Bold.ttf');
                font-weight: bold;
                font-style: normal;
            }

            @font-face {
                font-family: 'Merriweather';
                src: url('../fonts/Merriweather-BoldItalic.ttf');
                font-weight: bold;
                font-style: italic;
            }

            @font-face {
                font-family: 'Merriweather';
                src: url('../fonts/Merriweather-Light.ttf');
                font-weight: 200;
                font-style: normal;
            }

            @font-face {
                font-family: 'Merriweather';
                src: url('../fonts/Merriweather-LightItalic.ttf');
                font-weight: 200;
                font-style: italic;
            }

            html,
            body {
                padding: 0;
                margin: 0;
                background-color: #080811;
                font-family: 'Jet Brains' !important;
                font-variation-settings: 'wght' 100, 'wdth' 100;
                color: white;
            }

            .bn-container p, .bn-container h1 {
                margin: 0;
                padding: 0
            }
            `,
                    }}
                />
            </head>
            {rtops}
        </html>,
    ),
);
