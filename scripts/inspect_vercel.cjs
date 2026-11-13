const fs = require('fs');
const path = 'C:/Users/reyhan/AppData/Roaming/npm/node_modules/vercel/dist/commands-bulk.js';
const src = fs.readFileSync(path, 'utf8');
const idx = src.indexOf('cookie');
const matches = src.match(/.{0,30}(?:_vercel|protection-bypass|bypass_cookie).{0,30}/gi);
console.log('Matches:', matches ? matches.slice(0, 15) : 'none');
