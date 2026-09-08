const axios = require('axios');

async function testComplexity() {
    try {
        const res = await axios.post('http://localhost:50006/api/LP_OnlineExamFacade/getmastercompliexities', { MI_Id: 30 });
        console.log('Complexity Status:', res.status);
        console.log('Complexity Data:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.log('Error testing complexity:', e.message, e.response?.data);
    }
}

testComplexity();
