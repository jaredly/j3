const { execSync } = require('child_process');
const fs = require('fs');

execSync(`peggy --format es src/grammar.pegjs -o src/grammar-raw.ts`);
const data = fs.readFileSync('src/grammar-raw.ts', 'utf8');
fs.writeFileSync('src/grammar-raw.ts', `// @ts-nocheck\n` + data);
