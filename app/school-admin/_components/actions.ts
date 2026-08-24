'use server';

export async function fetchAdmissionAnalytics() {
    try {
        const response = await fetch('https://dashboard-backend-coral.vercel.app/dashboard?mi_id=30', {
            next: { revalidate: 0 },
            headers: {
                Accept: 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch analytics: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching admission analytics:', error);
        throw error;
    }
}
