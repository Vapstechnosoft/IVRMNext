const axios = require('axios');
axios.get('https://localhost:5001/api/MasterComplexityFacade?MI_Id=30')
  .then(res => console.log("COMPLEXITY:", JSON.stringify(res.data).substring(0, 300)))
  .catch(err => console.error("ERR COMPLEXITY:", err.message));

axios.get('https://localhost:5001/api/MasterQuestionFacade/loaddata?MI_Id=30')
  .then(res => console.log("QUESTION LOADDATA:", JSON.stringify(res.data).substring(0, 300)))
  .catch(err => console.error("ERR QUESTION:", err.message));
