const axios = require('axios');

async function testExamMasterLoad() {
    try {
        const res = await axios.post('http://localhost:50006/api/LP_OnlineExamFacade/getexammasterload', { MI_Id: 30 });
        console.log('Exam Master Load Status:', res.status);
        console.log('Keys in data:', Object.keys(res.data?.data || res.data || {}));
        const d = res.data?.data || res.data || {};
        console.log('Years count:', (d.getyearlist?.$values || d.getyearlist || []).length);
        console.log('Classes count:', (d.getclasslist?.$values || d.getclasslist || []).length);
        console.log('Saved Exams count:', (d.getMasterExamdetails?.$values || d.getMasterExamdetails || []).length);
        console.log('Saved Exams sample:', (d.getMasterExamdetails?.$values || d.getMasterExamdetails || []).slice(0, 2));
    } catch (e) {
        console.log('Error testing exam master load:', e.message, e.response?.data);
    }
}

testExamMasterLoad();
