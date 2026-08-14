'use server';

import { api } from '@/lib/apiService';

const FACADE = 'CirculationParameter';

export const getCirculationParameterDetails = async (payload: { MI_Id: number; IVRMUL_Id: number }) => {
    // Using the new endpoint specified by the user for onload
    return await api.post<any>('library', `${FACADE}/circulationtransaction-getdetails`, payload);
};

export const getCirculationData = async (payload: any) => {
    return await api.post<any>('library', `${FACADE}/get-circulation-data`, payload);
};

export const getCirculationParameterTypeChange = async (payload: { LMB_BookTypeflag: string; LMC_CategoryName: string }) => {
    return await api.post<any>('library', `${FACADE}/gettype`, payload);
};

export const saveCirculationParameter = async (payload: any) => {
    return await api.post<{ returnval: boolean; duplicate: boolean }>('library', `${FACADE}/Savedata`, payload);
};

export const toggleCirculationParameterStatus = async (payload: { LMC_Id: number }) => {
    return await api.post<{ returnval: boolean }>('library', `${FACADE}/deactiveY`, payload);
};
