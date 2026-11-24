'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

// Notice Board Data - Fetches list of notices for the student
export async function getStudentDashboardNoticeBoard(data: any) {
    const session = await auth();
    const payload = {
        MI_Id: data?.MI_Id ?? data?.mI_Id ?? (session as any)?.mi_id,
        AMST_Id: data?.AMST_Id ?? data?.amsT_Id ?? data?.amst_id ?? (session as any)?.amst_id ?? (session as any)?.amstid,
        ASMAY_Id: data?.ASMAY_Id ?? data?.asmaY_Id ?? data?.asmay_id ?? (session as any)?.asmay_id ?? (session as any)?.asmayid,
        flag: data?.flag ?? 'O',
        OnClickOrOnChange: data?.OnClickOrOnChange ?? 'OnClick',
        Type: 'Student'
    };
    const url = '/StudentDashboardFacade/onclick_notice';

    // Note: In PortalHub backend, onclick_notice has [Route(onclick_notice)] without [HttpPost],
    // so ASP.NET Core accepts GET (with JSON body) and returns 405 on POST.
    // We send GET first, with fallback to POST.
    try {
        const getRes = await api.request<any>('portal', 'GET', url, undefined, payload);
        if (getRes) return getRes;
    } catch {
        // Fallback to POST if server route was updated to POST
    }
    return await api.post<any>('portal', url, payload);
}

// Notice Attachment Data - Fetches attachments for a selected notice
export async function getStudentDashboardNoticeAttachment(data: any) {
    const session = await auth();
    const payload = {
        INTB_Id: data?.INTB_Id ?? data?.intB_Id,
        MI_Id: data?.MI_Id ?? data?.mI_Id ?? (session as any)?.mi_id,
        AMST_Id: data?.AMST_Id ?? data?.amsT_Id ?? (session as any)?.amst_id ?? (session as any)?.amstid
    };
    const url = '/StudentDashboardFacade/viewnotice';
    try {
        const getRes = await api.request<any>('portal', 'GET', url, undefined, payload);
        if (getRes) return getRes;
    } catch {
        // Fallback to POST
    }
    return await api.post<any>('portal', url, payload);
}

// Classwork Data
export async function getStudentDashboardClasswork(data: any) {
    const session = await auth();
    const payload = {
        MI_Id: data?.MI_Id ?? data?.mI_Id ?? (session as any)?.mi_id,
        AMST_Id: data?.AMST_Id ?? data?.amsT_Id ?? data?.amst_id ?? (session as any)?.amst_id ?? (session as any)?.amstid,
        ASMAY_Id: data?.ASMAY_Id ?? data?.asmaY_Id ?? data?.asmay_id ?? (session as any)?.asmay_id ?? (session as any)?.asmayid,
        flag: data?.flag ?? 'O',
        OnClickOrOnChange: data?.OnClickOrOnChange ?? 'OnClick'
    };
    const url = '/StudentDashboardFacade/onclick_Classwork';
    try {
        const getRes = await api.request<any>('portal', 'GET', url, undefined, payload);
        if (getRes) return getRes;
    } catch {
        // Fallback to POST
    }
    return await api.post<any>('portal', url, payload);
}
