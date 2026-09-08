const fs = require('fs');

const data = fs.readFileSync('C:/Users/vapst/.gemini/antigravity-ide/brain/f665286f-9927-430e-bc08-8d648041e180/.system_generated/steps/82/content.md', 'utf8');
const jsonStr = data.substring(data.indexOf('{'));
const swagger = JSON.parse(jsonStr);

const pathObj = swagger.paths['/api/LP_OnlineExamFacade/getloaddata'];
console.log('Path /api/LP_OnlineExamFacade/getloaddata:', JSON.stringify(pathObj, null, 2));

const allOnlineExamPaths = Object.keys(swagger.paths).filter(p => p.toLowerCase().includes('lpm') || p.toLowerCase().includes('onlineexam') || p.toLowerCase().includes('masterquestion'));
console.log('\nAll related paths in Swagger:', allOnlineExamPaths);
