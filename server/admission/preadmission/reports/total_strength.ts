'use server';

import { api } from '@/lib/apiService';


export async function getTotalStrengthInitialDetails() {
    const url = '/TotalStrengthReport/getdetails';
    return await api.get<any>('admission', url);
}


export async function getTotalStrengthElectives(asmay_id: number) {
    const url = `/TotalStrength/getelectives/${asmay_id}`;
    return await api.get<any>('admission', url);
}


export async function getTotalStrengthClasses(asmay_id: number, amc_id: number) {
    const url = `/TotalStrength/getclasses?ASMAY_Id=${asmay_id}&AMC_Id=${amc_id}`;
    return await api.post<any>('admission', url);
}

export async function getTotalStrengthSections(asmay_id: number, asmcl_id: number, amc_id: number) {
    const url = `/TotalStrength/getsections?ASMAY_Id=${asmay_id}&ASMCL_Id=${asmcl_id}&AMC_Id=${amc_id}`;
    return await api.post<any>('admission', url);
}


export async function getTotalStrengthReportDetails(data: any) {
    const url = '/TotalStrength/GetTotalStrengthReport';
    return await api.post<any>('admission', url, data);
}

export async function exportTotalStrengthReportToExcel(data: any) {
    const url = '/TotalStrength/ExportTotalStrengthReportToExcel';
    try {
        const responseData = await api.postBinary('admission', url, data);

        return Array.from(new Uint8Array(responseData));
    } catch (error) {
        console.error('Total Strength Excel export error:', error);
        throw error;
    }
}