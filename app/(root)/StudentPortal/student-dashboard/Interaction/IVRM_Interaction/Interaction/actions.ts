'use server';
import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

export async function getInteractionLoadData() {
    const url = 'IVRM_Interactions/get-interaction-loaddata';
    try {
        // No payload needed — API reads user context from session server-side
        const response = await api.post<any>('portal', url, {});

        // api.post() returns the full HTTP JSON body.
        // From terminal logs we know the body is: { success, message, data: {...}, total, page, page_size }
        // The actual data (getinboxmsg, academicList, roletype, etc.) is inside response.data
        const actualData = response?.data;

        console.log('getInteractionLoadData actualData keys:', actualData ? Object.keys(actualData) : 'null');

        if (actualData && typeof actualData === 'object') {
            return actualData;
        }

        // Fallback: maybe response itself is the data (flat structure)
        if (response && typeof response === 'object' && !('success' in response && 'data' in response)) {
            return response;
        }

        throw new Error('Empty or invalid response from get-interaction-loaddata');
    } catch (e) {
        console.error('API Failed for getInteractionLoadData:', e);
        throw new Error('Failed to load interaction data');
    }
}

export async function getInteractionDetails(data: any) {
    const url = 'IVRM_Interactions/get-details-of-interaction';
    try {
        const session = await auth();
        const role_type_id = session?.user?.roleId || 18;
        const amst_id = session?.user?.amst_id || 0;
        const role_name = session?.user?.role || 'Student';

        const payload = {
            ivrmrT_Id: role_type_id,
            userflag: data.userflag || 'SubjectTeacher',
            ...data
        };

        const response = await api.post<any>('portal', url, payload);
        if (response?.data) {
            return response.data;
        }
        return response;
    } catch (e) {
        console.error('API Failed for getInteractionDetails:', e);
        return { getdetails: [] };
    }
}

export async function getSection(data: any) {
    const url = 'EmployeeStudentAttendenceDetails/Getsection';
    try {
        const response = await api.post<any>('portal', url, data);
        return response.data;
    } catch (e) {
        console.error('API Failed for getSection:', e);
        return { sectionList: [] };
    }
}

export async function getStudent(data: any) {
    const url = 'IVRM_Interactions/get-student-details';
    try {
        const session = await auth();
        const amst_id = session?.user?.amst_id || 0;
        const role_name = session?.user?.role || 'student';

        const payload = {
            ASMAY_Id: 0,
            AMST_Id: amst_id,
            rolename: role_name,
            ASMCL_Id: 0,
            ASMS_Id: 0,
            ...data
        };

        const response = await api.post<any>('portal', url, payload);

        if (response?.data) {
            return response.data;
        }
        return response;
    } catch (e) {
        console.error('API Failed for getStudent:', e);
        return { studentList: [] };
    }
}

export async function saveInteraction(data: any) {
    const url = 'IVRM_Interactions/save-details';
    try {
        let asmayId = data.ASMAY_Id || 0;

        try {
            const loadRes = await api.post<any>('portal', 'IVRM_Interactions/get-interaction-loaddata', {});

            // We know from logs: api.post returns { success, message, data: {...}, total, page, page_size }
            // So the actual data is inside loadRes.data
            const actualData = loadRes?.data;
            console.log('=== saveInteraction actualData keys:', actualData ? Object.keys(actualData) : 'null/undefined');

            // Try all possible academic list key variants inside actualData
            const acadList =
                actualData?.academicList ||
                actualData?.AcademicList ||
                actualData?.academic_list ||
                actualData?.yearList ||
                actualData?.YearList ||
                actualData?.acaList ||
                [];

            console.log('=== saveInteraction acadList:', Array.isArray(acadList), 'length:', acadList?.length);

            if (Array.isArray(acadList) && acadList.length > 0) {
                const currentYear =
                    acadList.find((y: any) => y.selected === true || y.Selected === true || y.isCurrent === true) || acadList[0];
                asmayId = currentYear?.asmaY_Id || currentYear?.ASMAY_Id || 0;
            }

            // Also try top-level asmaY_Id inside actualData
            if (!asmayId && actualData?.asmaY_Id) asmayId = actualData.asmaY_Id;
            if (!asmayId && actualData?.ASMAY_Id) asmayId = actualData.ASMAY_Id;

            console.log('=== saveInteraction final ASMAY_Id to send:', asmayId);
        } catch (err) {
            console.warn('saveInteraction: could not resolve ASMAY_Id:', err);
        }

        const finalPayload = { ...data, ASMAY_Id: asmayId };

        const response = await api.post<any>('portal', url, finalPayload);
        console.log('=== save-details response wrapper:', JSON.stringify({ success: response?.success, message: response?.message }));
        console.log('=== save-details response.data:', JSON.stringify(response?.data));

        const nestedData = response?.data;

        const isSuccess =
            response?.success === true ||
            nestedData?.returnval === true ||
            nestedData?.ReturnVal === true ||
            nestedData?.success === true ||
            nestedData?.returnval === 1 ||
            nestedData?.ReturnVal === 1;

        const message = nestedData?.message || nestedData?.Message || nestedData?.returnMessage || response?.message || '';

        return {
            ...(nestedData || {}),
            returnval: isSuccess,
            message
        };
    } catch (e) {
        console.error('API Failed for saveInteraction:', e);
        return { returnval: false, message: 'Network error. Please try again.' };
    }
}

export async function deleteInteraction(data: any) {
    const url = 'IVRM_Interactions/deletemsg';
    try {
        const response = await api.post<any>('portal', url, data);
        return response.data;
    } catch (e) {
        console.error('API Failed for deleteInteraction:', e);
        return { returnval: false };
    }
}

export async function replyInteraction(data: any) {
    const url = 'IVRM_Interactions/reply';
    try {
        const response = await api.post<any>('portal', url, data);
        return response.data;
    } catch (e) {
        console.error('API Failed for replyInteraction:', e);
        return { returnval: false };
    }
}
