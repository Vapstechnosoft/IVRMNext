'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { ApiSearchparams } from '@/types';
import type { IAlumniDetailsResponse, IAlumniInteractionLoadResponse } from '@/types/alumni/alumni-interactions';

export async function getAlumniInteractionLoadData(searchParams?: ApiSearchparams) {
    const session = await auth();
    const roleFlag = (searchParams as any)?.Role_flag || (session as any)?.role || 'Alumni';
    const ivrmrtId = (searchParams as any)?.IVRMRT_Id || (session as any)?.ivrmrT_Id || 30;
    const almstId = (session as any)?.almsT_Id || 0;
    const hrmeId = (session as any)?.hrmE_Id || 0;
    const asmayId = (session as any)?.asmaY_Id || 0;

    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'ALSMINT_Subject');
    const url = `/Alumni_Interactions/get_loaddata?IVRMRT_Id=${ivrmrtId}&ALMST_Id=${almstId}&ASMAY_Id=${asmayId}&HRME_Id=${hrmeId}&Role_flag=${roleFlag}&${urlParams}`;
    return await api.get<IAlumniInteractionLoadResponse>('alumni', url);
}

export async function getAlumniDetails(data: { userflag: string }) {
    const session = await auth();
    const ivrmrtId = (session as any)?.ivrmrT_Id || 0;
    const almstId = (session as any)?.almsT_Id || 0;
    const roleFlag = (session as any)?.role || 'Alumni';

    const url = `/Alumni_Interactions/get_details?IVRMRT_Id=${ivrmrtId}&ALMST_Id=${almstId}&userflag=${data.userflag}&Role_flag=${roleFlag}`;
    return await api.get<IAlumniDetailsResponse>('alumni', url);
}

export async function saveAlumniInteraction(data: any) {
    const url = '/Alumni_Interactions/save_details';
    return await api.post('alumni', url, data);
}

export async function getInteractionThread(data: {
    ALSMINT_Id: number;
    ASMAY_Id?: number;
    IVRMRT_Id?: number;
    ALMST_Id?: number;
}) {
    const url = '/Alumni_Interactions/reply';
    const payload = {
        ALSMINT_Id: data.ALSMINT_Id,
        ASMAY_Id: data.ASMAY_Id || 0,
        IVRMRT_Id: data.IVRMRT_Id || 0,
        ALMST_Id: data.ALMST_Id || 0
    };
    return await api.post<{ viewmessage: any[] }>('alumni', url, payload);
}

export async function saveInteractionReply(data: any) {
    const url = '/Alumni_Interactions/save_reply';
    return await api.post('alumni', url, data);
}

export async function deleteInteractionMessage(istint_Id: number) {
    const url = '/Alumni_Interactions/deletemsg';
    return await api.post('alumni', url, { ISTINT_Id: istint_Id });
}

export async function deleteInboxMessage(alsminT_Id: number) {
    const url = '/Alumni_Interactions/deleteinboxmsg';
    return await api.post('alumni', url, { ALSMINT_Id: alsminT_Id });
}
