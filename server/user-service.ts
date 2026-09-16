'use server';

export async function getUserByEmail(username: string, password: string) {
    const baseUrl = process.env.NEXT_PUBLIC_PREADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const url = `${baseUrl}/configuration/login?username=${username}&password=${password}`;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            return {
                success: false,
                message: `Server Error: ${response.statusText}`,
                data: null
            };
        }

        return await response.json();
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Network error',
            data: null
        };
    }
}
