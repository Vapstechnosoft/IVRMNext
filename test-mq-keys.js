const axios = require('axios');
axios.get('https://localhost:5001/api/MasterQuestionFacade/loaddata?MI_Id=30')
  .then(res => {
      const data = res.data.data;
      console.log("Keys in data:", Object.keys(data));
      if (data.masterQuestionList || data.questionList || data.getMasterQuestiondetails || data.getQuestiondetails) {
          console.log("Found question list key!");
      } else {
          console.log("Did not find known question list key. Here is a sample:", JSON.stringify(data).substring(0, 500));
      }
  })
  .catch(err => console.error("ERR:", err.message));
