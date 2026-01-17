'use server';

import { api } from '@/lib/apiService';
import type { IAlumniDetailsResponse, IAlumniInteractionLoadResponse } from '@/types/alumni/alumni-interactions';

export async function getAlumniInteractionLoadData(data: any = {}) {
    const url = '/Alumni_Interactions/getloaddata';
    const payload = {
        mI_Id: data.mI_Id || 0,
        almsT_Id: data.almsT_Id || 0,
        hrmE_Id: data.hrmE_Id || 0,
        roleflg: data.roleflg || '',
        asmaY_Id: data.asmaY_Id || 0,
        ivrmrT_Id: data.ivrmrT_Id || 0
    };
    return await api.post<IAlumniInteractionLoadResponse>('alumni', url, payload);
}

export async function getAlumniDetails(data: { mI_Id?: number; ivrmrT_Id?: number; userflag: string; asmaY_Id?: number }) {
    const url = '/Alumni_Interactions/getdetails';
    const payload = {
        mI_Id: data.mI_Id || 0,
        ivrmrT_Id: data.ivrmrT_Id || 0,
        userflag: data.userflag,
        asmaY_Id: data.asmaY_Id || 0
    };
    return await api.post<IAlumniDetailsResponse>('alumni', url, payload);
}

export async function saveAlumniInteraction(data: any) {
    const url = '/Alumni_Interactions/save_details';
    return await api.post('alumni', url, data);
}

export async function getInteractionThread(data: {
    alsminT_Id: number;
    mI_Id?: number;
    hrmE_Id?: number;
    almsT_Id?: number;
    ivrmrT_Id?: number;
    alsminT_ComposedById?: number;
    asmaY_Id?: number;
}) {
    const url = '/Alumni_Interactions/reply';
    const payload = {
        alsminT_Id: data.alsminT_Id,
        mI_Id: data.mI_Id || 0,
        hrmE_Id: data.hrmE_Id || 0,
        almsT_Id: data.almsT_Id || 0,
        ivrmrT_Id: data.ivrmrT_Id || 0,
        alsminT_ComposedById: data.alsminT_ComposedById || 0,
        asmaY_Id: data.asmaY_Id || 0
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
