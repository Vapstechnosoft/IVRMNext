'use server';

import { api } from '@/lib/apiService';
import type { IAlumniFriendRequestLoadResponse, IAlumniProfileResponse } from '@/types/alumni/alumni-friend-request';

export async function getAlumniFriendRequestData(data: { almsT_Id?: number; mI_Id?: number; user_id?: number } = {}) {
    const url = '/Alumni_Student_FriendRequest/getdata';
    const payload = {
        almsT_Id: data.almsT_Id || 0,
        mI_Id: data.mI_Id || 0,
        user_id: data.user_id || 0
    };
    return await api.post<IAlumniFriendRequestLoadResponse>('alumni', url, payload);
}

export async function searchAlumniFriendRequest(data: any) {
    const url = '/Alumni_Student_FriendRequest/getsearch_data';
    const payload = {
        ...data,
        almsT_Id: data.almsT_Id || 0,
        mI_Id: data.mI_Id || 0,
        user_id: data.user_id || 0
    };
    return await api.post<IAlumniFriendRequestLoadResponse>('alumni', url, payload);
}

export async function viewAlumniProfile(data: { almsT_Id: number; mI_Id?: number }) {
    const url = '/Alumni_Student_FriendRequest/viewprofile';
    const payload = {
        almsT_Id: data.almsT_Id,
        mI_Id: data.mI_Id || 0
    };
    return await api.post<IAlumniProfileResponse>('alumni', url, payload);
}

export async function sendFriendRequest(data: {
    requestalumni: { ALMST_Id: number }[];
    almsT_Id?: number;
    mI_Id?: number;
    user_id?: number;
}) {
    const url = '/Alumni_Student_FriendRequest/send_request';
    const payload = {
        requestalumni: data.requestalumni,
        almsT_Id: data.almsT_Id || 0,
        mI_Id: data.mI_Id || 0,
        user_id: data.user_id || 0
    };
    return await api.post('alumni', url, payload);
}

export async function getAlumniFriendRequestReceivedData(data: { mI_Id?: number; user_id?: number } = {}) {
    const url = '/Alumni_Student_FriendRequest/getdata_request';
    const payload = {
        mI_Id: data.mI_Id || 0,
        user_id: data.user_id || 0
    };
    return await api.post<IAlumniFriendRequestLoadResponse>('alumni', url, payload);
}

export async function acceptFriendRequest(data: {
    user_id?: number;
    requestalumniaccept: { almsT_Id: number; alsfrnD_RequestDate: string | Date }[];
}) {
    const url = '/Alumni_Student_FriendRequest/friend_request_accept';
    const payload = {
        user_id: data.user_id || 0,
        requestalumniaccept: data.requestalumniaccept
    };
    return await api.post('alumni', url, payload);
}
