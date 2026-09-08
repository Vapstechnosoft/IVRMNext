const fs = require('fs');

const programPath = 'C:\\Users\\vapst\\OneDrive\\Desktop\\Vino\\AIVRM\\AIVRM_Backend\\NaacServiceHub\\Program.cs';
let content = fs.readFileSync(programPath, 'utf8');

if (!content.includes('EnableLegacyTimestampBehavior')) {
    content = content.replace('public static void Main(string[] args)', 'public static void Main(string[] args)\n        {\n            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);');
    // Remove the extra opening brace if already present
    content = content.replace('public static void Main(string[] args)\n        {\n            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);\n        {', 'public static void Main(string[] args)\n        {\n            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);');
    fs.writeFileSync(programPath, content, 'utf8');
    console.log('Updated NaacServiceHub/Program.cs with EnableLegacyTimestampBehavior switch!');
} else {
    console.log('Switch already present in NaacServiceHub/Program.cs');
}
