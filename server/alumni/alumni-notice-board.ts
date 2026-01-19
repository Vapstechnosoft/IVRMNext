'use server';

import { api } from '@/lib/apiService';
import type { IAlumniNoticeBoard } from '@/types/alumni/alumni-notice-board';

export async function getAlumniNoticeBoardData(mi_Id: number) {
    const url = `/Alumni_NoticeBoard/load_data?MI_Id=${mi_Id}`;
    return await api.get<{ alumninoticeboardlist: IAlumniNoticeBoard[] }>('alumni', url);
}

export async function saveAlumniNoticeBoard(data: IAlumniNoticeBoard) {
    const url = '/Alumni_NoticeBoard/savedetail';
    return await api.post('alumni', url, data);
}

export async function deactivateAlumniNoticeBoard(data: IAlumniNoticeBoard) {
    const url = `/Alumni_NoticeBoard/toggle_alumni_notice?alntb_Id=${data.alntB_Id}`;
    return await api.post('alumni', url, data);
}

export async function editAlumniNoticeBoard(id: number) {
    const url = `/Alumni_NoticeBoard/alumni_notice_editdetails/${id}`;
    return await api.get<{ editdetails: IAlumniNoticeBoard[]; editdetailsfiles: any[] }>('alumni', url);
}

export async function viewAlumniNoticeBoard(data: { alntB_Id: number; mI_Id: number }) {
    const url = '/Alumni_NoticeBoard/viewData';
    return await api.post<{ attachementlist: any[] }>('alumni', url, data);
}
