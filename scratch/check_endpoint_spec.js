const fs = require('fs');

const data = fs.readFileSync('C:/Users/vapst/.gemini/antigravity-ide/brain/f665286f-9927-430e-bc08-8d648041e180/.system_generated/steps/82/content.md', 'utf8');
const jsonStr = data.substring(data.indexOf('{'));
const swagger = JSON.parse(jsonStr);

const pathObj = swagger.paths['/api/LP_OnlineExamFacade/getloaddata'];
console.log('getloaddata endpoint spec:', JSON.stringify(pathObj, null, 2));

const saveObj = swagger.paths['/api/LP_OnlineExamFacade/savedetails'];
console.log('savedetails endpoint spec:', JSON.stringify(saveObj, null, 2));
