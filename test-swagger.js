const axios = require('axios');
axios.get('https://localhost:5001/swagger/v1/swagger.json')
  .then(res => {
      const paths = Object.keys(res.data.paths);
      const relevant = paths.filter(p => p.toLowerCase().includes('masterquestion') || p.toLowerCase().includes('onlineexam') || p.toLowerCase().includes('complexity'));
      console.log(relevant);
  })
  .catch(err => console.error("ERROR:", err.message));
