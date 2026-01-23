'use server';

import { api } from '@/lib/apiService';

export interface CountryDropdown {
    ivrmmC_Id: number;
    ivrmmC_CountryName: string;
    ivrmmC_CountryCode: string;
    ivrmmC_CountryCode2: string;
    ivrmmC_MobileNo: number;
}

export async function getCountryDropdown() {
    const url = 'InstitutionFacade/get_drop_down_country';
    return await api.get<CountryDropdown[]>('exam', url);
}
