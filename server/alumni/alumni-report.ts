'use server';

import { type ApiResponse, api } from '@/lib/apiService';
import {
    IAlumniReportInitialData,
    IAlumniReportResponse,
    IAlumniReportSearchPayload,
    IState,
    IDistrict
} from '@/types/alumni/alumni-report';

export async function getInitialData() {
    return await api.get<IAlumniReportInitialData>('alumni', '/AlumniSearch/Getdetails');
}

export async function getStates(countryIds: { IVRMMC_Id: number }[]) {
    return await api.post<any>('alumni', '/AlumniSearch/getstate', {
        countrylistarray: countryIds
    });
}

export async function getDistricts(stateIds: { IVRMMS_Id: number }[]) {
    return await api.post<any>('alumni', '/AlumniSearch/getdistrict', {
        statelistarray: stateIds
    });
}

export async function getReportData(payload: IAlumniReportSearchPayload) {
    return await api.post<IAlumniReportResponse>('alumni', '/AlumniSearch/Getdetailsreport', payload);
}
