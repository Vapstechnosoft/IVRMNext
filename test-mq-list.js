const axios = require('axios');
axios.get('https://localhost:5001/api/MasterQuestionFacade?MI_Id=30')
  .then(res => {
      console.log("Keys in question list response:", Object.keys(res.data));
      if (res.data.data) {
          console.log("Data keys:", Object.keys(res.data.data));
          console.log("Values count:", res.data.data['$values'] ? res.data.data['$values'].length : 'no values');
      }
  })
  .catch(err => console.error("ERR:", err.message));
