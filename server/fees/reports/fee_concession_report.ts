'use server';
import { api } from '@/lib/apiService';

export async function getFeesconcessionOnLoadReport() {
    const url = '/FeeConcessionReportFacade/GroupTermCustomGrouDetails';
    return await api.get<any[]>('fees', url);
}
export async function getFeesconcessionOnChangeofCustomGroup(payload: any) {
    const url = '/FeeConcessionReportFacade/GetGroupsbasedoncustomGrp';
    return await api.post<any[]>('fees', url, payload);
}

export async function saveFeesconcessionReport(payload: any) {
    const url = '/FeeConcessionReportFacade/GroupTermCustomGrouDetails';
    return await api.post<any[]>('fees', url, payload);
}
