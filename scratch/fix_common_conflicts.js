const fs = require('fs');

const filePath = 'c:/Users/vapst/OneDrive/Desktop/Vino/AIVRM/AIVRM_Frontend/IVRMNext/server/common.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace standard conflict blocks where one side is selected or markers are cleaned
// 1. Line 342-350
content = content.replace(/<<<<<<< HEAD\r?\n\s*}\r?\n=======\r?\n<<<<<<< HEAD\r?\n\s*},\r?\n=======\r?\n\s*}\r?\n>>>>>>> [a-f0-9]+\r?\n>>>>>>> [a-f0-9]+/g, '                                        }');

// 2. Lines 741-1678
content = content.replace(/<<<<<<< HEAD\r?\n=======\r?\n<<<<<<< HEAD\r?\n/g, '');
content = content.replace(/=======\r?\n>>>>>>> [a-f0-9]+/g, '');
content = content.replace(/>>>>>>> [a-f0-9]+/g, '');
content = content.replace(/<<<<<<< HEAD/g, '');
content = content.replace(/=======/g, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed conflict markers in server/common.ts');
