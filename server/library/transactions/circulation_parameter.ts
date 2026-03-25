'use server';

import { api } from '@/lib/apiService';

const FACADE = 'CirculationParameter';

export const getCirculationParameterDetails = async (payload: { LMC_CategoryName: string }) => {
    return await api.post<any>('library', `${FACADE}/getdata`, payload);
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
