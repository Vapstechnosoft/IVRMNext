'use server';

import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export async function translateText(query: string) {
    if (!query) return { text: '' };

    try {
        const scriptPath = path.join(process.cwd(), 'server', 'translate_search.py');
        const { stdout } = await execPromise(`python "${scriptPath}" "${query}"`);

        try {
            const data = JSON.parse(stdout);
            console.log('[TRANSLATE-ACTION] input:', query, 'output:', data);
            return { success: true, ...data };
        } catch (e) {
            console.error('JSON Parse Error:', e);
            return { success: false, text: query };
        }
    } catch (error: any) {
        console.error('Translate Error:', error);
        return { success: false, text: query };
    }
}
