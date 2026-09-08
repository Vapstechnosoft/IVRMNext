const fs = require('fs');

const data = fs.readFileSync('C:/Users/vapst/.gemini/antigravity-ide/brain/f665286f-9927-430e-bc08-8d648041e180/.system_generated/steps/82/content.md', 'utf8');
const jsonStr = data.substring(data.indexOf('{'));
const swagger = JSON.parse(jsonStr);

const schemas = swagger.components?.schemas || {};
const examSchemas = Object.keys(schemas).filter(s => s.toLowerCase().includes('lpm') || s.toLowerCase().includes('exam') || s.toLowerCase().includes('question'));
console.log('Exam Schemas in Swagger:', examSchemas);

// Let's print properties of LP_OnlineExamDTO
const dto = schemas['PreadmissionDTOs.NAAC.LP_OnlineExam.LP_OnlineExamDTO'];
if (dto) {
    console.log('\nLP_OnlineExamDTO properties:');
    console.log(Object.keys(dto.properties || {}));
}
