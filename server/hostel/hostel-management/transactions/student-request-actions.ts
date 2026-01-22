'use client';

import { api } from '@/lib/apiService';
import { revalidatePath } from 'next/cache';

export async function getStudentRequestLoadData() {
    try {
        const res = await api.post('/StudentRequest/loaddata', {});
        if (res.data) return res.data;
    } catch (error) {
        console.error('Error fetching student request load data:', error);
    }
    return null;
}

export async function saveStudentRequest(data: any) {
    try {
        const res = await api.post('/StudentRequest/save', data);
        if (res.data) {
            revalidatePath('/Hostel/transactions/student-request');
            return res.data;
        }
    } catch (error) {
        console.error('Error saving student request:', error);
    }
    return null;
}

export async function toggleStudentRequestStatus(usersem: any) {
    try {
        const res = await api.post('/StudentRequest/deactive', usersem);
        if (res.data) {
            revalidatePath('/Hostel/transactions/student-request');
            return res.data;
        }
    } catch (error) {
        console.error('Error toggling student request status:', error);
    }
    return null;
}

// Confirmation / Approval
export async function getStudentConfirmLoadData() {
    try {
        // Legacy: apiService.getURI("StudentRequestConfirm/loaddata", 2)
        const res = await api.get('/StudentRequestConfirm/loaddata/2');
        if (res.data) return res.data;
    } catch (error) {
        console.error('Error fetching student confirm load data:', error);
    }
    return null;
}

export async function approveStudentRequest(data: any) {
    try {
        const res = await api.post('/StudentRequestConfirm/requestApproved', data);
        if (res.data) {
            revalidatePath('/Hostel/transactions/student-request-confirm');
            return res.data;
        }
    } catch (error) {
        console.error('Error approving student request:', error);
    }
    return null;
}

export async function rejectStudentRequest(data: any) {
    try {
        const res = await api.post('/StudentRequestConfirm/requestRejected', data);
        if (res.data) {
            revalidatePath('/Hostel/transactions/student-request-confirm');
            return res.data;
        }
    } catch (error) {
        console.error('Error rejecting student request:', error);
    }
    return null;
}
