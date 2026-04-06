'use server';
import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

export async function getInteractionLoadData(data: any) {
    const url = 'IVRM_Interactions/get-interaction-loaddata';
    try {
        const session = await auth();
        // default to payload requirements if missing from session
        const amst_id = session?.user?.amst_id || 0;
        const hrm_id = 0; // Better to send 0 if not available
        const asmay_id = 0; // Better to send 0 if not available
        const role_type_id = session?.user?.roleId || 18;

        // Combine provided data with default payload structure
        const requestPayload = {
            amsT_Id: amst_id,
            hrmE_Id: hrm_id,
            asmaY_Id: asmay_id,
            role_type_id: role_type_id,
            ...data
        };

        const response = await api.post<any>('portal', url, requestPayload);
        if (response?.data) return response.data;
        throw new Error('Empty response');
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
            asmaY_Id: 0,
            ivrmrT_Id: role_type_id,
            hrmE_Id: 0,
            userflag: data.userflag || 'SubjectTeacher',
            amsT_Id: amst_id,
            userhrmE_Id: 0,
            asmS_Id: 0,
            asmsid: 0,
            asmclid: 0,
            rolename: role_name,
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
    const url = 'IVRM_Interactions/savedata';
    try {
        const response = await api.post<any>('portal', url, data);
        return response.data;
    } catch (e) {
        console.error('API Failed for saveInteraction:', e);
        return { returnval: false };
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
