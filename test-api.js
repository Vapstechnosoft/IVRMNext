const axios = require('axios');
const url = 'https://aivrmuat1.vapssmartecampus.com:21233/api/LP_OnlineExamFacade/getloaddata';
axios.post(url, { MI_Id: 30 }).then(res => {
    console.log(JSON.stringify(res.data, null, 2).substring(0, 500));
}).catch(err => console.error(err.message));
