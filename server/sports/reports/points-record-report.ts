'use server';

import { api } from '@/lib/apiService';
import {
    IPointsRecordReportLoadData,
    IPointsRecordReportRequest,
    IPointsRecordReportData
} from '@/types/sports/reports/points-record-report';

// Using ITopperListClassData/SectionData types or defining locally if not exported?
// Since ITopperListReport uses specific types for its responses, and we are using its endpoints, 
// we should ideally use compatible types.
// I defined generic interfaces in my types file (IClass, ISection etc).
// Let's use simple any or define compatible wrapper types if structure matches.
// The response structure from `get_class` is { classList: [], houseList: [], eventList: [] }
// My types are compatible.

export async function getPointsRecordReportLoadData(): Promise<IPointsRecordReportLoadData> {
    try {
        const response = await api.post<any>('sports', 'SportPointsAndRecordReport/Getdetails', {});
        const data = response?.data || {};
        return {
            academicYear: data.academicYear || data.yearlist || [],
            yearlist: data.yearlist || [],
            venueList: data.venueList || [],
            eventList: data.eventList || [],
            sportslist: data.sportslist || [],
            categoryList: data.categoryList || [],
            houseList: data.houseList || [],
            events: data.events || [], // Check if API returns 'events' or something else for Program Master
            divisionList: data.divisionList || []
        };
    } catch (error) {
        console.error("Error in getPointsRecordReportLoadData:", error);
        return {
            academicYear: [],
            yearlist: [],
            venueList: [],
            eventList: [],
            sportslist: [],
            categoryList: [],
            houseList: [],
            events: [],
            divisionList: []
        };
    }
}

export async function getClassesHousesEvents(asmaY_Id: number) {
    try {
        const response = await api.post<any>('sports', 'SportTopperListReport/get_class', { asmaY_Id });
        return response?.data || { classList: [], houseList: [], eventList: [] };
    } catch (error) {
        console.error("Error in getClassesHousesEvents:", error);
        return { classList: [], houseList: [], eventList: [] };
    }
}

export async function getSections(asmaY_Id: number, asmcL_Id: number) {
    try {
        const response = await api.post<any>('sports', 'SportTopperListReport/get_section', { asmaY_Id, asmcL_Id });
        return response?.data || { sectionList: [] };
    } catch (error) {
        console.error("Error in getSections:", error);
        return { sectionList: [] };
    }
}

export async function getPointsRecordReport(data: IPointsRecordReportRequest): Promise<IPointsRecordReportData[]> {
    try {
        const response = await api.post<any>('sports', 'SportPointsAndRecordReport/showdetails', data);

        // Handling varied response structures if any (legacy often returns valid data in 'viewlist' or direct array)
        if (Array.isArray(response?.data)) {
            return response.data;
        }
        // In case it's nested
        // The user payload example shows "return tables are given below for showdetails from two SP's"
        // and returns just "Response body: ... { ... }" - looks like it might be an array or wrapped.
        // Legacy code usually puts it in `viewlist` if not direct.
        // Let's check `SportPointsAndRecordReportImpl` snippet from user. 
        // `response.data = await _fn.SPCC_SportPointsAndRecordReport(token, dto);`
        // And the function returns `List<SPCC_SportPointsAndRecordReportView>`.
        // So response.data IS the list.

        return response?.data || [];
    } catch (error) {
        console.error("Error in getPointsRecordReport:", error);
        return [];
    }
}
