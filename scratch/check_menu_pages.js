const { Client } = require('pg');

async function checkMenu() {
    const client = new Client({
        connectionString: 'postgresql://postgres:Vaps%40123@192.168.0.18:5432/IVRM_NEW_ARCH_UAT1'
    });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT "IVRMMP_Id", "IVRMMP_PageName", "IVRMMP_PageURL", "IVRMMP_PageDesc"
            FROM "IVRM_Master_Page"
            WHERE "IVRMMP_PageURL" ILIKE '%OnlineExam%' OR "IVRMMP_PageURL" ILIKE '%LP_%' OR "IVRMMP_PageName" ILIKE '%Online Exam%'
            ORDER BY "IVRMMP_Id";
        `);
        console.log('Pages in database:');
        console.table(res.rows);
    } catch (e) {
        console.log('DB error:', e.message);
    } finally {
        await client.end();
    }
}

checkMenu();
