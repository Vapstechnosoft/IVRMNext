const fs = require('fs');

const paths = [
    'C:\\Users\\vapst\\OneDrive\\Desktop\\Vino\\AIVRM\\AIVRM_Backend\\IVRMUX\\Program.cs',
    'C:\\Users\\vapst\\OneDrive\\Desktop\\Vino\\AIVRM\\AIVRM_Backend\\ExamServiceHub\\Program.cs'
];

for (const p of paths) {
    if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        if (!content.includes('EnableLegacyTimestampBehavior')) {
            content = content.replace('public static void Main(string[] args)\n        {', 'public static void Main(string[] args)\n        {\n            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);');
            content = content.replace('public static void Main(string[] args)\r\n        {', 'public static void Main(string[] args)\r\n        {\r\n            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);');
            fs.writeFileSync(p, content, 'utf8');
            console.log('Updated', p);
        }
    }
}
