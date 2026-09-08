const axios = require('axios');

async function testBackend() {
    try {
        const res = await axios.post('http://localhost:50006/api/LP_OnlineExamFacade/getloaddata', { MI_Id: 30 });
        console.log('Backend response status:', res.status);
        console.log('Backend response keys:', Object.keys(res.data?.data || res.data || {}));
    } catch (e) {
        console.log('Backend error:', e.code, e.message);
    }
}

testBackend();
