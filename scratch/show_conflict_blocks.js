const fs = require('fs');

const filePath = 'c:/Users/vapst/OneDrive/Desktop/Vino/AIVRM/AIVRM_Frontend/IVRMNext/server/common.ts';
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('<<<<<<<')) {
        console.log(`\n--- CONFLICT AT LINE ${i + 1} ---`);
        for (let j = Math.max(0, i - 3); j < Math.min(lines.length, i + 15); j++) {
            console.log(`${j + 1}: ${lines[j].trimEnd()}`);
            if (lines[j].startsWith('>>>>>>>')) break;
        }
    }
}
