const fs = require('fs');

const data = fs.readFileSync('C:/Users/vapst/.gemini/antigravity-ide/brain/f665286f-9927-430e-bc08-8d648041e180/.system_generated/steps/82/content.md', 'utf8');
const jsonStr = data.substring(data.indexOf('{'));
const swagger = JSON.parse(jsonStr);

const paths = Object.keys(swagger.paths || {});

console.log('Paths with MasterQuestion:', paths.filter(p => p.toLowerCase().includes('masterquestion')));
console.log('Paths with LP_OnlineExamFacade:', paths.filter(p => p.toLowerCase().includes('lp_onlineexamfacade')));
console.log('Paths with AnswerPaperCorrection:', paths.filter(p => p.toLowerCase().includes('answerpapercorrection')));
console.log('Paths with PublishToStudent:', paths.filter(p => p.toLowerCase().includes('publishtostudent')));
