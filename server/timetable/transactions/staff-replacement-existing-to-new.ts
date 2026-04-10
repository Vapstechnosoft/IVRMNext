'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    Category,
    Class,
    Section,
    Staff,
    StaffReplacementExistingToNewMasters,
    StaffReplacementGridData,
    Subject
} from '@/types/timetable/Transaction/staff-replacement-existing-to-new';

export async function getStaffReplacementExistingToNewMasters(): Promise<StaffReplacementExistingToNewMasters> {
    try {
        console.log('getStaffReplacementExistingToNewMasters');
        const [categories, classes, staff, subjects] = await Promise.all([
            api.get<Category[]>('timetable', '/TimeTableCommon/GetCategoryDetails'),
            api.get<Class[]>('timetable', '/TimeTableCommon/GetClassData'),
            api.get<Staff[]>('timetable', '/TimeTableCommon/GetStaffDetails'),
            api.get<Subject[]>('timetable', '/TimeTableCommon/subject-details')
        ]);

        return {
            categories: categories.data ?? (categories as unknown as Category[]),
            classes: classes.data ?? (classes as unknown as Class[]),
            staff: staff.data ?? (staff as unknown as Staff[]),
            subjects: subjects.data ?? (subjects as unknown as Subject[])
        };
    } catch (error) {
        console.error('Error fetching staff replacement masters:', error);
        return { categories: [], classes: [], staff: [], subjects: [] };
    }
}

export async function getSectionsByClass(asmcL_Id: number): Promise<Section[]> {
    try {
        const response = await api.get<Section[]>('timetable', `/TimeTableCommon/GetSectionData/${asmcL_Id}`);
        return response.data ?? (response as unknown as Section[]);
    } catch (error) {
        console.error('Error fetching sections:', error);
        return [];
    }
}

export async function getSectionDropdown() {
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    const url = `/TimeTableCommon/section-details`;
    return await api.get<any>('timetable', url);
}

export async function getStaffReplacementGridData(searchParams?: ApiSearchparams) {
    // console.log('searchParams', searchParams);
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'ttmC_Id,ttmD_DayName,ttmD_DayCode,ismS_SubjectName,asmcL_ClassName,asmC_SectionName,staffName,ttmP_PeriodName'
    );
    const url = `/StaffReplacementForClassSectionFacade/GetstaffreplacementfromexistingtonewGrid?${urlParams}`;
    return await api.get<StaffReplacementGridData[]>('timetable', url);
}

export async function getStaffReplacementInitialData() {
    const url = '/StaffReplacementFromExistingToNewFacade';
    return await api.get<any>('timetable', url);
}

export async function getStaffReplacementInitialDetails(id = 0) {
    console.log('id', id);
    const url = `/StaffReplacementFromExistingToNewFacade/getdetails/${id}`;
    return await api.get<any>('timetable', url);
}

export async function saveStaffReplacementExistingToNew(payload: any) {
    try {
        const url = '/StaffReplacementFromExistingToNewFacade/savedetail';
        const data = {
            ttmC_Id: Number(payload.ttmC_Id),
            asmcL_Id: Number(payload.asmcL_Id || 0),
            asmS_Id: Number(payload.asms_Id || 0),
            staf_from: Number(payload.hrmE_Id_From),
            staf_to: Number(payload.hrmE_Id_To),
            ismS_Id: Number(payload.ismS_Id || 0)
        };
        const response = await api.post<any>('timetable', url, data);
        return response.data ?? response;
    } catch (error) {
        console.error('Error saving staff replacement:', error);
        throw error;
    }
}
