const axios = require('axios');

async function testAxios() {
    // 1. With leading slash on relative path when baseURL has /api
    const client1 = axios.create({ baseURL: 'http://localhost:50006/api' });
    try {
        console.log('Testing url: "/LP_OnlineExamFacade/getloaddata"...');
        const r1 = await client1.post('/LP_OnlineExamFacade/getloaddata', { MI_Id: 30 });
        console.log('r1 status:', r1.status);
    } catch (e) {
        console.log('r1 error status:', e.response?.status, 'requested URL:', e.config?.url, 'baseURL:', e.config?.baseURL);
    }

    // 2. With relative path WITHOUT leading slash (or with /api in url, or baseURL without /api)
    const client2 = axios.create({ baseURL: 'http://localhost:50006/api/' });
    try {
        console.log('\nTesting baseURL: "http://localhost:50006/api/" with "LP_OnlineExamFacade/getloaddata"...');
        const r2 = await client2.post('LP_OnlineExamFacade/getloaddata', { MI_Id: 30 });
        console.log('r2 status:', r2.status);
    } catch (e) {
        console.log('r2 error status:', e.response?.status, 'requested URL:', e.config?.url);
    }

    // 3. With baseURL: "http://localhost:50006" and url: "/api/LP_OnlineExamFacade/getloaddata"
    const client3 = axios.create({ baseURL: 'http://localhost:50006' });
    try {
        console.log('\nTesting baseURL: "http://localhost:50006" with "/api/LP_OnlineExamFacade/getloaddata"...');
        const r3 = await client3.post('/api/LP_OnlineExamFacade/getloaddata', { MI_Id: 30 });
        console.log('r3 status:', r3.status);
    } catch (e) {
        console.log('r3 error status:', e.response?.status);
    }
}

testAxios();
