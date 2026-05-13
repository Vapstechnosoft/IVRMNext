'use server';

import { api } from '@/lib/apiService';

export async function getBirthdayInitialData() {
    const url = '/BirthDay/getdata';
    return await api.get<any>('alumni', url);
}

export async function getParticipantList(data: {
    rdbbutton: string;
    asmaY_Id?: number;
    asmcL_Id?: number;
    asmS_Id?: number;
    Logintype?: string;
    MO_Id?: number;
}) {
    const params = new URLSearchParams();
    params.append('rdbbutton', data.rdbbutton);
    if (data.asmaY_Id) params.append('asmaY_Id', data.asmaY_Id.toString());
    if (data.asmcL_Id) params.append('asmcL_Id', data.asmcL_Id.toString());
    if (data.asmS_Id) params.append('asmS_Id', data.asmS_Id.toString());
    if (data.Logintype) params.append('Logintype', data.Logintype);
    if (data.MO_Id) params.append('MO_Id', data.MO_Id.toString());

    return await api.get<any>('alumni', `/BirthDay/BindStaff?${params.toString()}`);
}

export async function sendBirthdayMessages(data: any) {
    return await api.post<any>('alumni', '/BirthDay/Sendmsg', data);
}

export async function getFeedbackQuestions(data: { Flag: string }) {
    return await api.post<any>('alumni', '/FeedbackTransaction/loadfeedbackquestion', data);
}

export async function saveFeedback(data: { savemodulefeedback: any[] }) {
    return await api.post<any>('alumni', '/FeedbackTransaction/Savefeedback', data);
}
