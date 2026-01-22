'use client';

import { api } from '@/lib/apiService';
import { revalidatePath } from 'next/cache';

export async function getStaffRequestLoadData() {
    try {
        const res = await api.post('/StaffRequest/loaddata', {});
        if (res.data) return res.data;
    } catch (error) {
        console.error('Error fetching staff request load data:', error);
    }
    return null;
}

export async function saveStaffRequest(data: any) {
    try {
        const res = await api.post('/StaffRequest/save', data);
        if (res.data) {
            revalidatePath('/Hostel/transactions/staff-request');
            return res.data;
        }
    } catch (error) {
        console.error('Error saving staff request:', error);
    }
    return null;
}

export async function toggleStaffRequestStatus(usersem: any) {
    try {
        const res = await api.post('/StaffRequest/deactive', usersem);
        if (res.data) {
            revalidatePath('/Hostel/transactions/staff-request');
            return res.data;
        }
    } catch (error) {
        console.error('Error toggling staff request status:', error);
    }
    return null;
}

// Approval List
export async function getStaffApprovalLoadData() {
    try {
        // Legacy: apiService.getURI("StaffRequestConfirm/loaddata", 2)
        const res = await api.get('/StaffRequestConfirm/loaddata/2');
        if (res.data) return res.data;
    } catch (error) {
        console.error('Error fetching staff approval load data:', error);
    }
    return null;
}

export async function approveStaffRequest(data: any) {
    try {
        const res = await api.post('/StaffRequestConfirm/requestApproved', data);
        if (res.data) {
            revalidatePath('/Hostel/transactions/staff-approval-list');
            return res.data;
        }
    } catch (error) {
        console.error('Error approving staff request:', error);
    }
    return null;
}

export async function rejectStaffRequest(data: any) {
    try {
        const res = await api.post('/StaffRequestConfirm/requestRejected', data);
        if (res.data) {
            revalidatePath('/Hostel/transactions/staff-approval-list');
            return res.data;
        }
    } catch (error) {
        console.error('Error rejecting staff request:', error);
    }
    return null;
}
