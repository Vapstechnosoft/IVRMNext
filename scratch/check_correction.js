const fs = require('fs');

const data = fs.readFileSync('C:/Users/vapst/.gemini/antigravity-ide/brain/f665286f-9927-430e-bc08-8d648041e180/.system_generated/steps/82/content.md', 'utf8');
const jsonStr = data.substring(data.indexOf('{'));
const swagger = JSON.parse(jsonStr);

const paths = Object.keys(swagger.paths || {});
const answerCorrectionPaths = paths.filter(p => p.toLowerCase().includes('answerpapercorrection') || p.toLowerCase().includes('correction'));
console.log('Correction Paths in Swagger:', answerCorrectionPaths);
