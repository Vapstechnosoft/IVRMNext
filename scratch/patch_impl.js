const fs = require('fs');

const implPath = 'C:\\Users\\vapst\\OneDrive\\Desktop\\Vino\\AIVRM\\AIVRM_Backend\\NaacServiceHub\\LP_OnlineExam\\Services\\LP_OnlineExamImpl.cs';
let content = fs.readFileSync(implPath, 'utf8');

// In SaveMasterQuestionDetails, ensure CreatedDate has Utc kind when entity is tracked
content = content.replace(
    'result.UpdatedDate = indiantime0;\n\n                    _context.Update(result);',
    'result.UpdatedDate = indiantime0;\n                    if (result.CreatedDate.HasValue && result.CreatedDate.Value.Kind == DateTimeKind.Unspecified) { result.CreatedDate = DateTime.SpecifyKind(result.CreatedDate.Value, DateTimeKind.Utc); }\n                    _context.Update(result);'
);

content = content.replace(
    'result.UpdatedDate = indiantime0;\r\n\r\n                    _context.Update(result);',
    'result.UpdatedDate = indiantime0;\r\n                    if (result.CreatedDate.HasValue && result.CreatedDate.Value.Kind == DateTimeKind.Unspecified) { result.CreatedDate = DateTime.SpecifyKind(result.CreatedDate.Value, DateTimeKind.Utc); }\r\n                    _context.Update(result);'
);

fs.writeFileSync(implPath, content, 'utf8');
console.log('Updated LP_OnlineExamImpl.cs with Utc specification for CreatedDate!');
