'use server';
import { api } from '@/lib/apiService';
import { revalidatePath } from 'next/cache';

/**
 * Notice Board API Actions
 * Controllers: NoticeBoard
 */

export async function fetchNoticeBoardInitialData() {
    return await api.post<any>('portal', '/notice_board/Getdetails', {});
}

export async function getNoticeBoardSections(payload: any) {
    return await api.post<any>('portal', '/notice_board/getsection', payload);
}

export async function getNoticeBoardStudents(payload: any) {
    return await api.post<any>('portal', '/notice_board/getstudent', payload);
}

export async function getNoticeBoardDesignations(payload: any) {
    return await api.post<any>('portal', '/notice_board/Desgselectiondetails', payload);
}

export async function getNoticeBoardDepartments(payload: any) {
    return await api.post<any>('portal', '/notice_board/Deptselectiondetails', payload);
}

export async function getNoticeBoardEmployees(payload: any) {
    return await api.post<any>('portal', '/notice_board/get_employee', payload);
}

export async function saveNoticeBoardDetail(payload: any) {
    const result = await api.post<any>('portal', '/notice_board/savedetail', payload);
    if (result) {
        revalidatePath('/upload/transactions/notice-board');
    }
    return result;
}

export async function editNoticeBoardRecord(payload: { intB_Id: number }) {
    return await api.post<any>('portal', `/notice_board/editdetails?INTB_Id=${payload.intB_Id}`, {});
}

export async function toggleNoticeBoardStatus(payload: { intB_Id: number }) {
    const result = await api.post<any>('portal', `/notice_board/deactivate?INTB_Id=${payload.intB_Id}`, {});
    if (result) {
        revalidatePath('/upload/transactions/notice-board');
    }
    return result;
}

export async function viewNoticeBoardRecords(payload: any) {
    const { intB_Id, intB_Title, flag, flag1, intB_ToStaffFlg, intB_ToStudentFlg } = payload;
    let url = `/notice_board/viewrecords?INTB_Id=${intB_Id}&INTB_Title=${encodeURIComponent(intB_Title)}`;

    if (flag) {
        url += `&flag=${flag}&INTB_ToStaffFlg=${intB_ToStaffFlg}`;
    }
    if (flag1) {
        url += `&flag1=${flag1}&INTB_ToStudentFlg=${intB_ToStudentFlg}`;
    }

    return await api.post<any>('portal', url, {});
}

// Additional Helpers for Fee Defaulters
export async function getBusRoutingForNoticeBoard() {
    return await api.get<any[]>('fees', '/StudentFeeGroupMappingFacade/getBusRoutes');
}

export async function getFeeGroupsForNoticeBoard() {
    return await api.get<any[]>('fees', '/FeesCommon/fee-group-details');
}

export async function getFeeTermsForNoticeBoard() {
    return await api.get<any[]>('fees', '/FeesCommon/fee-term-details');
}
