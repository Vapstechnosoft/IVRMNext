'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterParticulars } from '@/types/pettycash/masters';

export async function RequistionReport(data: any) {
    const url = '/PC_Master_ParticularsFacade/RequistionReport';
    return await api.post<any>('pettycashandassettracking', url, data);
}


export async function getRequisitionReportOrganization(data: any) {
    const url = '/PC_Master_ParticularsFacade/getRequisitionReportOrganization';
    return await api.post<any>('pettycashandassettracking', url, data);
}
