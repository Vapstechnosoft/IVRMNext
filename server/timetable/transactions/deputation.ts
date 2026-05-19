'use server';

import { api } from '@/lib/apiService';
import { revalidatePath } from 'next/cache';

export async function getDeputationMasters() {
    const url = '/DeputationNewFacade/GetDeputationMasters';
    console.info('DeputationNewFacade', url);
    return await api.get<any>('timetable', url);
}

export async function saveDeputation(data: any) {
    const url = '/DeputationNewFacade/SaveDeputation';
    console.info('DeputationNewFacade', url);
    const response = await api.post<any>('timetable', url, data);
    revalidatePath('/timetable/transactions/deputation');
    return response;
}

export async function getAbsentStaffList(payload: any) {
    const { asmaY_Id, ttmD_Date, absent_Staff_Flag } = payload;
    const formattedDate = ttmD_Date ? new Date(ttmD_Date).toISOString().split('T')[0] : '';
    const url = `/DeputationNewFacade/getabsentstaff/${asmaY_Id}/${formattedDate}/${absent_Staff_Flag}`;
    console.info('DeputationNewFacade', url);
    return await api.get<any>('timetable', url);
}
