const fs = require('fs');

const filePath = 'c:/Users/vapst/OneDrive/Desktop/Vino/AIVRM/AIVRM_Frontend/IVRMNext/server/common.ts';
let content = fs.readFileSync(filePath, 'utf8');

console.log('File length before:', content.length);

// Regex to find conflict blocks
const lines = content.split('\n');
const conflictLines = [];
lines.forEach((line, idx) => {
    if (line.startsWith('<<<<<<<') || line.startsWith('=======') || line.startsWith('>>>>>>>')) {
        conflictLines.push({ lineNum: idx + 1, content: line });
    }
});

console.log('Total conflict lines found:', conflictLines.length);
console.log(conflictLines.slice(0, 30));
