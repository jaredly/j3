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
                <div style="width:0px;height:20px;background:white;position:relative">
        <span style="font-size:50%;position:absolute;left:4px;top:2px;color:white;white-space:pre">${
            fname.split('/').slice(-1)[0]
        }</span></div>
            ${Object.keys(data[fname].statementMap)
                .map(
                    (id) =>
                        `
                <div style="width:3px;height:20px;margin-bottom:2px;background:${
                    data[fname].s[id] ? 'green' : 'red'
                }">
                </div>
                `,
                )
                .join('\n')}
                <div style="width:3px;height:20px;background:white"></div>
        `,
    )
    .join('\n')}
</div>
`;

require('fs').writeFileSync('./show-coverage.html', tpl);
