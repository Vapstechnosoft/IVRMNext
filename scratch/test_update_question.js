const axios = require('axios');

async function testUpdate() {
    try {
        const payload = {
            MI_Id: 30,
            Userid: 231,
            LPMOEQ_Id: 5,
            ISMS_Id: 1276,
            ASMCL_Id: 397,
            LPMT_Id: 16,
            LPMCOMP_Id: 1,
            LPMOEQ_Question: "gffgdfg updated test",
            LPMOEQ_QuestionDesc: "gfgdf updated description",
            LPMOEQ_Marks: 2,
            LPMOEQ_SubjectiveFlg: false,
            LPMOEQ_MatchTheFollowingFlg: false,
            LPMOEQ_StructuralFlg: "",
            LPMOEQ_Answer: "",
            LPMOEQ_NoOfOptions: 0,
            LPMOEQ_MFRowCount: 0,
            LPMOEQ_MFColumnCount: 0,
            classlist: [{ ASMCL_Id: 397 }],
            tempoptionsDTO: [],
            tempfilesDTO: []
        };

        const res = await axios.post('http://localhost:50006/api/LP_OnlineExamFacade/SaveMasterQuestionDetails', payload);
        console.log('Update status:', res.status);
        console.log('Response returnval:', res.data?.returnval);
        console.log('Response message / data:', res.data);
    } catch (e) {
        console.log('Error updating:', e.response?.status, e.message, e.response?.data);
    }
}

testUpdate();
