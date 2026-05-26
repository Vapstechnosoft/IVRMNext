'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getMasterInstitutionData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/Institution/get_onload_grid_master_trust?${urlParams}`;
    const response = await api.get<any>('sadmin', url);
    return response;
}

export async function getCountryDropdown() {
    const url = '/Institution/get_country_dropdown';
    const response = await api.get<any>('sadmin', url);
    return response;
}

export async function getStateDropdown(ivrmmC_Id: number) {
    const url = `/Institution/get_state_dropdown_onchnageof_country/${ivrmmC_Id}`;
    const response = await api.get<any>('sadmin', url);
    return response;
}

export async function getInstitutionDropdown() {
    const url = '/MasterInstitutionRoleandModuleMappingFacade/get_institution_drop_down';
    const response = await api.get<any>('sadmin', url);
    return response;
}
