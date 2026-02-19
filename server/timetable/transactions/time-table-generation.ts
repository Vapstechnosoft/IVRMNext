'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { AcademicYear, Category, GenerationDetails } from '@/types/timetable/Transaction/time-table-generation';


export async function getGenerationMasters(): Promise<{ years: AcademicYear[]; categories: Category[] }> {
    try {
        const [yearsResponse, categoriesResponse] = await Promise.all([
            getAcademicYear({}),
            getCategory({})
        ]);

        return {
            years: yearsResponse.data ?? [],
            categories: categoriesResponse.data ?? []
        };
    } catch (error) {
        console.error('Error fetching manual period insertion masters:', error);
        return {
            years: [],
            categories: []
        };
    }
}


export async function getAcademicYear(data: any) {
    const url = '/TimeTableCommon/GetAcademicYearData';
    return await api.get<any>('timetable', url);
}

export async function getCategory(data: any) {
    const url = '/TimeTableCommon/GetCategoryDetails';
    return await api.get<any>('timetable', url);
}

export async function getTimeTableGenerationGridData(searchParams: any) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, '');
    const url = `/TimeTableGenerationFacade/GetTTGenerationGrid?${urlParams}`;
    // console.log('Fetching Grid Data URL:', url);
    return await api.get<any>('timetable', url);
}

export async function toggleTimeTableGeneration(ttfG_Id: number) {
    const url = `/TimeTableGenerationFacade/ActivateOrDeactivateTT/${ttfG_Id}`;
    return await api.get<any>('timetable', url);
}

export async function getGenerationDetails(asmaY_Id: number, ttmC_Id: number): Promise<GenerationDetails> {
    const url = `/TimeTableGenerationFacade/GetGenerationDetails/${asmaY_Id}/${ttmC_Id}`;
    try {
        const response = await api.get<any>('timetable', url);
        const data = response.data || response;

        return {
            totalPeriods: Number(data?.asmcL_TotalNoOfPeriods || data?.totalPeriods || 0),
            allottedPeriods: Number(data?.asms_TotalNoOfPeriodsAllotted || data?.allottedPeriods || 0),
            notAllottedPeriods: Number(data?.totalNoOfperiodNotallotted || data?.notAllottedPeriods || 0),
            notConfirmedPeriods: Number(data?.notConfirmedPeriods || 0)
        };
    } catch (error) {
        console.error('Error fetching generation details:', error);
        return {
            totalPeriods: 0,
            allottedPeriods: 0,
            notAllottedPeriods: 0,
            notConfirmedPeriods: 0
        };
    }
}
