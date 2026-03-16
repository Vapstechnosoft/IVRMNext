const { exec } = require('child_process');
exec('python server/translate_search.py "ಶುಲ್ಕ report"', (err, stdout, stderr) => {
    console.log("OUT", stdout);
    console.log("ERR", stderr);
});
