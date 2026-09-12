const fs = require('fs');

const implPath = 'C:\\Users\\vapst\\OneDrive\\Desktop\\Vino\\AIVRM\\AIVRM_Backend\\NaacServiceHub\\LP_OnlineExam\\Services\\LP_OnlineExamImpl.cs';
let content = fs.readFileSync(implPath, 'utf8');

const target = `var result = _context.LP_Master_OE_QuestionsDMO.Single(t => t.LPMOEQ_Id == data.LPMOEQ_Id && t.MI_Id == data.MI_Id);
                    result.LPMOEQ_Question = data.LPMOEQ_Question;`;

const replacement = `var result = _context.LP_Master_OE_QuestionsDMO.Single(t => t.LPMOEQ_Id == data.LPMOEQ_Id && t.MI_Id == data.MI_Id);
                    if (data.classlist != null && data.classlist.Length > 0 && data.classlist[0].ASMCL_Id > 0)
                    {
                        result.ASMCL_Id = data.classlist[0].ASMCL_Id;
                    }
                    else if (data.ASMCL_Id > 0)
                    {
                        result.ASMCL_Id = data.ASMCL_Id;
                    }
                    result.LPMOEQ_Question = data.LPMOEQ_Question;`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(implPath, content, 'utf8');
    console.log('Successfully patched ASMCL_Id update in LP_OnlineExamImpl.cs!');
} else {
    console.log('Target block not found, trying with CRLF');
    const targetCRLF = target.replace(/\n/g, '\r\n');
    const replacementCRLF = replacement.replace(/\n/g, '\r\n');
    if (content.includes(targetCRLF)) {
        content = content.replace(targetCRLF, replacementCRLF);
        fs.writeFileSync(implPath, content, 'utf8');
        console.log('Successfully patched ASMCL_Id update with CRLF!');
    } else {
        console.log('Target block not found in LP_OnlineExamImpl.cs');
    }
}
