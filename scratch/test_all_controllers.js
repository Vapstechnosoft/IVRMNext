const axios = require('axios');

async function testAllControllers() {
    const controllers = ['LP_OnlineExamFacade', 'LP_OnlineExam', 'MasterQuestion'];
    for (const ctrl of controllers) {
        try {
            const url = `http://localhost:50006/api/${ctrl}/getloaddata`;
            const res = await axios.post(url, { MI_Id: 30 }, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log(`${ctrl} -> Status: ${res.status}, success: ${res.data?.success}, data keys:`, Object.keys(res.data?.data || res.data || {}));
        } catch (e) {
            console.log(`${ctrl} -> Error:`, e.response?.status || e.message);
        }
    }
}

testAllControllers();
