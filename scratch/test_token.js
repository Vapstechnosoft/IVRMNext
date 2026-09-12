const axios = require('axios');

async function testWithToken() {
    console.log('Testing WITH Bearer dummy token:');
    try {
        const res = await axios.post('http://localhost:50006/api/LP_OnlineExamFacade/getloaddata', { MI_Id: 30 }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer dummy-token'
            }
        });
        console.log('Status with dummy token:', res.status);
    } catch (e) {
        console.log('Error with dummy token:', e.response?.status || e.message);
    }
}

testWithToken();
