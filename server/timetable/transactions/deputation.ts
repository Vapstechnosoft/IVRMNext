'use server';

import { api } from '@/lib/apiService';
import { revalidatePath } from 'next/cache';
import type {
    IAbsentStaffPayload,
    IFreeStaffPayload,
    IPeriodAllotedPayload,
    ISaveDeputationPayload,
    IViewRecordsPopupPayload
} from '@/types/timetable/Transaction/deputation';

export async function getDeputationDetails() {
    const url = '/DeputationFacade/getdetails';
    console.info('DeputationFacade', url);
    return await api.get<any>('timetable', url);
}

export async function getAbsentStaff(payload: IAbsentStaffPayload) {
    const url = '/DeputationFacade/getabsentstaff';
    console.info('DeputationFacade', url, payload);
    return await api.post<any>('timetable', url, payload);
}

export async function getPeriodAlloted(payload: IPeriodAllotedPayload) {
    const url = '/DeputationFacade/get_period_alloted';
    console.info('DeputationFacade', url, payload);
    return await api.post<any>('timetable', url, payload);
}

export async function getFreeStaffDets(payload: IFreeStaffPayload) {
    const url = '/DeputationFacade/get_free_stfdets';
    console.info('DeputationFacade', url, payload);
    return await api.post<any>('timetable', url, payload);
}

export async function getViewRecordsPopup9(payload: IViewRecordsPopupPayload) {
    const url = '/DeputationFacade/viewrecordspopup9';
    console.info('DeputationFacade', url, payload);
    return await api.post<any>('timetable', url, payload);
}

export async function saveDeputationDetails(payload: ISaveDeputationPayload) {
    const url = '/DeputationFacade/savedetails';
    console.info('DeputationFacade', url, payload);
    const response = await api.post<any>('timetable', url, payload);
    revalidatePath('/timetable/transactions/deputation');
    return response;
}

