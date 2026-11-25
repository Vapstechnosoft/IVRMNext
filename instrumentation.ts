export function register() {
    for (const [key, value] of Object.entries(process.env)) {
        if (key.toLowerCase().includes('groq') && typeof value === 'string' && value.trim().length > 0) {
            const trimmed = value.trim().replace(/^["']|["']$/g, '');
            if (!trimmed.startsWith('gsk_')) {
                process.env[key] = `gsk_${trimmed}`;
            }
        }
    }
}
