const axios = require('axios');

async function inspectBackendResponse() {
    try {
        const res = await axios.post('http://localhost:50006/api/LP_OnlineExamFacade/getloaddata', { MI_Id: 30 }, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Status:', res.status);
        console.log('Response body top-level keys:', Object.keys(res.data || {}));
        console.log('Response preview (first 500 chars):', JSON.stringify(res.data).substring(0, 500));
    } catch (e) {
        console.log('Error:', e.response?.status, e.message);
    }
}

inspectBackendResponse();
