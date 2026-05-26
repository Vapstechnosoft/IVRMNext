'use server';

import { api } from '@/lib/apiService';
import type {
    IVenueWiseReportData,
    IVenueWiseReportDropdowns,
    VenueWiseParticipationReportFormSchema
} from '@/types/sports/reports/venue-wise-participation-report';

export async function getVenueWiseParticipationDropdowns(): Promise<IVenueWiseReportDropdowns> {
    const response = await api.post<IVenueWiseReportDropdowns>('sports', '/SportVenuewiseParticipationReport/Getdetails', {});
    return response.data!;
}

export async function getClass(asmaY_Id: number): Promise<Pick<IVenueWiseReportDropdowns, 'classList' | 'houseList' | 'venueList'>> {
    const response = await api.post<Pick<IVenueWiseReportDropdowns, 'classList' | 'houseList' | 'venueList'>>(
        'sports',
        '/SportVenuewiseParticipationReport/get_class',
        { asmaY_Id }
    );
    return {
        classList: response.data?.classList || [],
        houseList: response.data?.houseList || [],
        venueList: response.data?.venueList || []
    };
}

export async function getSection(asmaY_Id: number, asmcL_Id: number): Promise<IVenueWiseReportDropdowns['sectionList']> {
    const response = await api.post<{ sectionList: IVenueWiseReportDropdowns['sectionList'] }>(
        'sports',
        '/SportVenuewiseParticipationReport/get_section',
        { asmaY_Id, asmcL_Id }
    );
    return response.data?.sectionList || [];
}

export async function getVenueWiseParticipationReport(data: VenueWiseParticipationReportFormSchema): Promise<IVenueWiseReportData[]> {
    const response = await api.post<{ viewlist: IVenueWiseReportData[] }>('sports', '/SportVenuewiseParticipationReport/showdetails', data);
    return response.data?.viewlist || [];
}
