'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import { ISportVenueWiseParticipationReportData, ISportVenueWiseParticipationReportPayload } from '@/types/sports/reports/venue-wise-participation-report';

export async function getInitialData(): Promise<ApiResponse<ISportVenueWiseParticipationReportData>> {
    return await api.post<ISportVenueWiseParticipationReportData>('sports', '/SportVenuewiseParticipationReport/Getdetails', {});
}

export async function getDetails(payload: { asmaY_Id: number }): Promise<ApiResponse<ISportVenueWiseParticipationReportData>> {
    return await api.post<ISportVenueWiseParticipationReportData>('sports', '/SportVenuewiseParticipationReport/get_class', payload);
}

export async function getSections(payload: { asmaY_Id: number; asmcL_Id: number }): Promise<ApiResponse<ISportVenueWiseParticipationReportData>> {
    return await api.post<ISportVenueWiseParticipationReportData>('sports', '/SportVenuewiseParticipationReport/get_section', payload);
}

export async function getStudentData(payload: { asmaY_Id: number; asmcL_Id: number; asmS_Id: number }): Promise<ApiResponse<ISportVenueWiseParticipationReportData>> {
    return await api.post<ISportVenueWiseParticipationReportData>('sports', '/SportVenuewiseParticipationReport/get_student', payload);
}

export async function getReportData(payload: ISportVenueWiseParticipationReportPayload): Promise<ApiResponse<any>> {
    return await api.post<any>('sports', '/SportVenuewiseParticipationReport/showdetails', payload);
}

