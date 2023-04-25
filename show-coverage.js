const data = require('./coverage/coverage-final.json');

const tpl = `
<html>
<meta charset="utf8">
<body>
<div style="display:flex;flex-wrap:wrap">
${Object.keys(data)
    .map(
        (fname) =>
            `
            <div style="padding:3px">
        <span style="font-size:50%">${fname.split('/').slice(-1)[0]}</span>
        <div style="display:flex;flex-wrap:wrap">
            ${Object.keys(data[fname].statementMap)
                .map(
                    (id) =>
                        `
                <div style="width:3px;height:20px;background:${
                    data[fname].s[id] ? 'green' : 'red'
                }">
                </div>
                `,
                )
                .join('\n')}
        </div>
        </div>
        `,
    )
    .join('\n')}
</div>
`;

require('fs').writeFileSync('./show-coverage.html', tpl);
