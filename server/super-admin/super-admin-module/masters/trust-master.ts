'use server';

import { api } from '@/lib/apiService';
import type { ITrustMaster } from '@/types/super-admin/super-admin-module/trust-masters';
import type { CountryDropdown } from './institution-facade';

export async function getCountryList() {
    const url = `/OrganisationFacade`;
    try {
        const response = await api.get<CountryDropdown[]>('sadmin', url);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getStateList() {
    const url = `/OrganisationFacade/state`;
    try {
        const response = await api.get<any[]>('sadmin', url);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function saveTrustMaster(data: any) {
    const url = `/OrganisationFacade/add_or_update_master_organization`;
    try {
        const response = await api.post<any>('sadmin', url, data);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function activateDeactivateTrustMaster(id: number) {
    const url = `/OrganisationFacade/activate_deactivate_master_organization/${id}`;
    try {
        const response = await api.put<any>('sadmin', url, {});
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getTrustMasterData(mo_id: number, roleId: number) {
    const url = `/OrganisationFacade/get_on_load_details/${mo_id}/${roleId}`;
    try {
        // Assuming 'admission' is the correct base URL key based on similar modules
        const response = await api.get<{ organisations: ITrustMaster[] }>(
            'sadmin',
            url
        );
        return response;
    } catch (error) {
        throw error;
    }
}


