const axios = require('axios');
axios.get('https://localhost:5001/swagger/v1/swagger.json')
  .then(res => {
      const paths = res.data.paths;
      ['/api/MasterComplexityFacade', '/api/MasterComplexityFacade/toggle/{id}', '/api/MasterComplexityFacade/delete/{id}', '/api/MasterQuestionFacade/loaddata', '/api/MasterQuestionFacade', '/api/MasterQuestionFacade/{id}', '/api/MasterQuestionFacade/toggle/{id}', '/api/MasterQuestionFacade/class_mapping', '/api/MasterQuestionFacade/options', '/api/MasterQuestionFacade/delete/{id}'].forEach(p => {
          if (paths[p]) {
              console.log("PATH:", p);
              Object.keys(paths[p]).forEach(method => {
                  console.log("  METHOD:", method.toUpperCase());
              });
          }
      });
  })
  .catch(err => console.error("ERROR:", err.message));
