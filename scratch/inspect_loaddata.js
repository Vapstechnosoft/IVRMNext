const axios = require('axios');

async function inspectLoadData() {
    try {
        const res = await axios.post('http://localhost:50006/api/LP_OnlineExamFacade/getloaddata', { MI_Id: 30 });
        const data = res.data?.data || res.data || {};
        console.log('Keys in getloaddata:', Object.keys(data));
        console.log('\ngetMasterQuestiondetails:');
        console.log(JSON.stringify(data.getMasterQuestiondetails || data.questionList || [], null, 2).substring(0, 1500));
        console.log('\ngetsubjectlist count:', (data.getsubjectlist || []).length);
        console.log('getclasslist count:', (data.getclasslist || []).length);
        console.log('getarratcomplexities count:', (data.getarratcomplexities || []).length);
    } catch (e) {
        console.log('Error:', e.response?.status, e.message);
    }
}

inspectLoadData();
