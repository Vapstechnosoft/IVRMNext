'use server';

import { api } from '@/lib/apiService';
import type { ITrustMaster } from '@/types/super-admin/super-admin-module/trust-masters';

export async function getTrustMasterData(mo_id: number, roleId: number) {
    const url = `/OrganisationFacade/get_on_load_details/${mo_id}/${roleId}`;
    try {
        // Assuming 'admission' is the correct base URL key based on similar modules
        const response = await api.get<{ organisations: ITrustMaster[] }>(
            'admission',
            url
        );
        return response;
    } catch (error) {
        throw error;
    }
}


