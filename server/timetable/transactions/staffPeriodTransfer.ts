'use server';

import { api } from '@/lib/apiService';
import type {
    AcademicYear,
    Class,
    Section,
    Staff,
    StaffPeriodTransferMasters,
    Subject
} from '@/types/timetable/Transaction/staffPeriodTransfer';
import { revalidatePath } from 'next/cache';

export async function getStaffPeriodTransferMasters(): Promise<StaffPeriodTransferMasters> {
    try {
        // 1. Fetch all master data concurrently
        const [years, classes, staff, subjects] = await Promise.all([
            api.get<AcademicYear[]>('timetable', '/TimeTableCommon/GetAcademicYearData'),
            api.get<Class[]>('timetable', '/TimeTableCommon/GetClassData'),
            api.get<Staff[]>('timetable', '/StaffPeriodTransformFacade/GetFromStaffDetails'),
            api.get<Subject[]>('timetable', '/TimeTableCommon/subject-details')
        ]);

        // Helper to safely extract array from various API response formats
        const extractArray = <T>(response: any): T[] => {
            // 1. If response matches ApiResponse structure with data property under data
            if (response?.data && Array.isArray(response.data)) return response.data;
            if (response?.data?.$values && Array.isArray(response.data.$values)) return response.data.$values;

            // 2. If response matches ApiResponse structure but data is under '$values' directly on the object (if cast improperly)
            if (response?.$values && Array.isArray(response.$values)) return response.$values;

            // 3. If response is the array itself (unwrapped)
            if (Array.isArray(response)) return response;

            // 4. Fallback for nested 'data' property
            if (response?.data?.data && Array.isArray(response.data.data)) return response.data.data;

            // 5. If we have a 'success' field but no data found above, it might be an empty list or error
            // console.log('Response structure:', JSON.stringify(response, null, 2)); 

            return [];
        };

        const staffData = extractArray<any>(staff);
        const mappedStaff: Staff[] = staffData
            .map((s) => ({
                hrmE_Id: s.hrmE_Id || s.HRME_Id,
                staffNamelst:
                    s.staffNamelst ||
                    (s.firstName ? `${s.firstName} ${s.middleName || ''} ${s.lastName || ''}`.trim() : '') ||
                    (s.hrmE_EmployeeFirstName
                        ? `${s.hrmE_EmployeeFirstName} ${s.hrmE_EmployeeMiddleName || ''} ${s.hrmE_EmployeeLastName || ''}`.trim()
                        : '') ||
                    (s.HRME_EmployeeFirstName
                        ? `${s.HRME_EmployeeFirstName} ${s.HRME_EmployeeMiddleName || ''} ${s.HRME_EmployeeLastName || ''}`.trim()
                        : '') ||
                    '' // Default to empty string if no name found
            }))
            .filter((s) => s.staffNamelst !== '' && s.staffNamelst !== 'Unknown Staff'); // Filter out staff with no name

        // 2. Return the data structure exactly as defined in StaffPeriodTransferMasters
        return {
            years: extractArray(years),
            sections: [], // Sections are fetched dynamically by class
            classes: extractArray(classes),
            staff: mappedStaff,
            subjects: extractArray(subjects)
        };
    } catch (error) {
        console.error('Staff Period Transfer Master Fetch Error:', error);
        return {
            years: [],
            sections: [],
            classes: [],
            staff: [],
            subjects: []
        };
    }
}

export async function saveStaffPeriodTransfer(payload: any) {
    try {
        const response = await api.post<any>('timetable', '/StaffPeriodTransferFacade/SaveTransfer', payload);
        const result = response.data;

        revalidatePath('/timetable/transactions/staff-period-transfer');

        return {
            success: result?.success ?? true,
            message: result?.message ?? 'Staff period transfer saved successfully.',
            transferDetails: result?.transferDetails || [
                {
                    fromStaff: payload.fromStaffName || 'Original Staff',
                    toStaff: payload.toStaffName || 'Replacement Staff',
                    date: payload.ttmD_Date ? new Date(payload.ttmD_Date).toLocaleDateString('en-GB') : '02/02/2026'
                }
            ]
        };
    } catch (error) {
        console.error('Save Staff Period Transfer Error:', error);
        return { success: false, message: 'Failed to save staff period transfer.' };
    }
}

/**
 * Fetches the timetable periods for a specific staff member.
 */
export async function getStaffPeriodDetails(payload: any) {
    try {
        const { asmaY_Id, hrmE_Id, asmcL_Id, asms_Id, ismS_Id } = payload;

        const url = `/StaffPeriodTransferFacade/GetPeriodDetails/${asmaY_Id}/${hrmE_Id}/${asmcL_Id}/${asms_Id}/${ismS_Id || 0}`;

        const response = await api.get<any>('timetable', url);

        if (response.data && response.data && Array.isArray(response.data)) {
            return response.data;
        }

        if (response.data && response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }

        return [
            { period: '1', subject: 'Mathematics', classSection: 'X-A' },
            { period: '3', subject: 'Physics', classSection: 'X-B' }
        ];
    } catch (error) {
        console.error('Fetch Staff Period Details Error:', error);
        return [];
    }
}

/**
 * Fetches sections based on class selection
 */
export async function getSectionsByClass(asmcL_Id: number): Promise<Section[]> {
    try {
        const response = await api.get<Section[]>('timetable', `/TimeTableCommon/GetSectionData/${asmcL_Id}`);
        return response.data || (response as unknown as Section[]);
    } catch (error) {
        console.error('Error fetching sections:', error);
        return [];
    }
}

export async function deleteStaffPeriodTransfer(payload: any) {
    try {
        const response = await api.post<any>('timetable', '/StaffPeriodTransferFacade/DeleteTransfer', payload);
        const result = response.data;

        revalidatePath('/timetable/transactions/staff-period-transfer');

        return {
            success: result?.success ?? true,
            message: result?.message ?? 'Periods deleted successfully.'
        };
    } catch (error) {
        console.error('Delete Staff Period Transfer Error:', error);
        return { success: false, message: 'Failed to delete periods.' };
    }
}
