const axios = require('axios');

async function testApiRouteSave() {
    try {
        const payload = {
            action: 'save',
            MI_Id: 30,
            Userid: 231,
            LPMOEQ_Id: 5,
            ISMS_Id: 1276,
            ASMCL_Id: 397,
            LPMT_Id: 16,
            LPMCOMP_Id: 1,
            LPMOEQ_Question: 'gffgdfg',
            LPMOEQ_QuestionDesc: 'gfgdf',
            LPMOEQ_Marks: 2,
            LPMOEQ_SubjectiveFlg: false,
            LPMOEQ_MatchTheFollowingFlg: false,
            LPMOEQ_StructuralFlg: '',
            LPMOEQ_Answer: '',
            LPMOEQ_NoOfOptions: 0,
            LPMOEQ_MFRowCount: 0,
            LPMOEQ_MFColumnCount: 0,
            classlist: [{ ASMCL_Id: 397 }],
            tempoptionsDTO: [],
            tempfilesDTO: []
        };

        const res = await axios.post('http://localhost:3000/api/exam/master-question', payload);
        console.log('API Route Save HTTP status:', res.status);
        console.log('API Route Save response:', res.data);
    } catch (e) {
        console.log('API Route Save error:', e.response?.status, e.message, e.response?.data);
    }
}

testApiRouteSave();
