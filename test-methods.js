const axios = require('axios');
axios.get('https://localhost:5001/swagger/v1/swagger.json')
  .then(res => {
      const paths = res.data.paths;
      ['/api/MasterComplexityFacade', '/api/MasterQuestionFacade/loaddata', '/api/MasterQuestionFacade'].forEach(p => {
          if (paths[p]) {
              console.log("PATH:", p);
              Object.keys(paths[p]).forEach(method => {
                  console.log("  METHOD:", method);
              });
          }
      });
  })
  .catch(err => console.error("ERROR:", err.message));
