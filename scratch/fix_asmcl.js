const fs = require('fs');

const implPath = 'C:\\Users\\vapst\\OneDrive\\Desktop\\Vino\\AIVRM\\AIVRM_Backend\\NaacServiceHub\\LP_OnlineExam\\Services\\LP_OnlineExamImpl.cs';
let content = fs.readFileSync(implPath, 'utf8');

// Replace the invalid classlist check with ASMCL_Id update
const wrongBlock = `var result = _context.LP_Master_OE_QuestionsDMO.Single(t => t.LPMOEQ_Id == data.LPMOEQ_Id && t.MI_Id == data.MI_Id);
                    if (data.classlist != null && data.classlist.Length > 0 && data.classlist[0].ASMCL_Id > 0)
                    {
                        result.ASMCL_Id = data.classlist[0].ASMCL_Id;
                    }
                    else if (data.ASMCL_Id > 0)
                    {
                        result.ASMCL_Id = data.ASMCL_Id;
                    }
                    result.LPMOEQ_Question = data.LPMOEQ_Question;`;

const correctBlock = `var result = _context.LP_Master_OE_QuestionsDMO.Single(t => t.LPMOEQ_Id == data.LPMOEQ_Id && t.MI_Id == data.MI_Id);
                    if (data.ASMCL_Id > 0)
                    {
                        result.ASMCL_Id = data.ASMCL_Id;
                    }
                    result.LPMOEQ_Question = data.LPMOEQ_Question;`;

if (content.includes(wrongBlock)) {
    content = content.replace(wrongBlock, correctBlock);
    fs.writeFileSync(implPath, content, 'utf8');
    console.log('Successfully fixed ASMCL_Id in LP_OnlineExamImpl.cs');
} else {
    const wrongCRLF = wrongBlock.replace(/\n/g, '\r\n');
    const correctCRLF = correctBlock.replace(/\n/g, '\r\n');
    if (content.includes(wrongCRLF)) {
        content = content.replace(wrongCRLF, correctCRLF);
        fs.writeFileSync(implPath, content, 'utf8');
        console.log('Successfully fixed ASMCL_Id in LP_OnlineExamImpl.cs with CRLF');
    } else {
        console.log('Block not found');
    }
}
