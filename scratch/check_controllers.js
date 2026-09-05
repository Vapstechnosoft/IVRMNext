const fs = require('fs');

const data = fs.readFileSync(
    'C:/Users/vapst/.gemini/antigravity-ide/brain/f665286f-9927-430e-bc08-8d648041e180/.system_generated/steps/82/content.md',
    'utf8'
);
const jsonStr = data.substring(data.indexOf('{'));
const swagger = JSON.parse(jsonStr);

const paths = Object.keys(swagger.paths || {});

console.log('=== LP_OnlineExamFacade paths ===');
const examFacadePaths = paths.filter((p) => p.includes('LP_OnlineExamFacade') || p.startsWith('/api/LP_OnlineExam/'));
examFacadePaths.forEach((p) => {
    const methods = Object.keys(swagger.paths[p]);
    console.log(methods.join(',').toUpperCase(), p);
});

console.log('\n=== LP_OnlineStudentExamFacade paths ===');
const studentExamPaths = paths.filter((p) => p.toLowerCase().includes('studentexam') || p.toLowerCase().includes('onlinestudent'));
studentExamPaths.forEach((p) => {
    const methods = Object.keys(swagger.paths[p]);
    console.log(methods.join(',').toUpperCase(), p);
});
