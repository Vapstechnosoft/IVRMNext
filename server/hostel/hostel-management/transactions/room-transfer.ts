'use client';

import { api } from '@/lib/apiService';
import { revalidatePath } from 'next/cache';

export async function getRoomTransferLoadData(type: string) {
    try {
        const res = await api.post('/CLGHostelVacant/loaddata', { type });
        if (res.data) {
            return res.data;
        }
    } catch (error) {
        console.error('Error fetching room transfer load data:', error);
    }
    return null;
}

export async function getTransferPersonDetail(type: string, id: number) {
    try {
        let endpoint = '';
        const payload: any = {};
        if (type === 'stud') {
            endpoint = '/CLGHostelVacant/get_studentDetail';
            payload.AMCST_Id = id;
        } else if (type === 'staff') {
            endpoint = '/CLGHostelVacant/get_staffDetail';
            payload.HRME_Id = id;
        } else {
            endpoint = '/CLGHostelVacant/get_guestDetail';
            payload.HLHGSTALT_Id = id;
        }
        const res = await api.post(endpoint, payload);
        if (res.data) return res.data;
    } catch (error) {
        console.error('Error fetching transfer person detail:', error);
    }
    return null;
}

export async function getFloorsAndCategories(hostelId: number) {
    try {
        const res = await api.post('/HostelAllotForCLGStudent/floor', { HLMH_Id: hostelId });
        if (res.data) return res.data;
    } catch (error) {
        console.error('Error fetching floors and categories:', error);
    }
    return null;
}

export async function getRoomsForTransfer(floorId: number, categoryId: number, oldRoomId: number) {
    try {
        const res = await api.post('/HostelAllotForCLGStudent/roomForVacateReport', {
            HLMF_Id: floorId,
            HLMRCA_Id: categoryId,
            HRMRM_Id_Old: oldRoomId
        });
        if (res.data) return res.data;
    } catch (error) {
        console.error('Error fetching rooms for transfer:', error);
    }
    return null;
}

export async function saveRoomTransfer(data: any) {
    try {
        const res = await api.post('/HostelAllotForCLGStudent/HostelT', data);
        if (res.data) {
            revalidatePath('/Hostel/transactions/room-transfer');
            return res.data;
        }
    } catch (error) {
        console.error('Error saving room transfer:', error);
    }
    return null;
}
