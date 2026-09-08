const axios = require('axios');
const url = 'https://localhost:5001/api/LP_OnlineExamFacade/getloaddata';
axios.post(url, { MI_Id: 30 }).then(res => {
    console.log(JSON.stringify(res.data, null, 2).substring(0, 1000));
}).catch(err => {
    console.error("ERROR:", err.message);
    if(err.response) console.error("RESPONSE DATA:", err.response.data);
});
