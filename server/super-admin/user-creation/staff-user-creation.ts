'use server';

import { api } from '@/lib/apiService';
import type { StaffUserCreationOnloadDTO } from '@/types/super-admin/user-creation/staff-user-creation';

const API_KEY = 'sadmin';

export async function getStaffUserCreationOnload(pageId: number) {
    try {
        const response = await api.get<StaffUserCreationOnloadDTO>(API_KEY, `StaffLogin/getalldetails/${pageId}`);
        if (response.success && response.data) {
            return { success: true, data: response.data };
        }
        return { success: false, message: response.message || 'Failed to fetch onload details', data: null };
    } catch (error: any) {
        console.error('getStaffUserCreationOnload error:', error);
        return { success: false, message: error.message || 'Failed to fetch onload details', data: null };
    }
}

export async function changeInstitution(payload: any) {
    try {
        const response = await api.post<any>(API_KEY, 'StaffLogin/changeinsti', payload);
        if (response.success && response.data) {
            return { success: true, data: response.data };
        }
        return { success: false, message: response.message || 'Failed to change institution', data: null };
    } catch (error: any) {
        console.error('changeInstitution error:', error);
        return { success: false, message: error.message || 'Failed to change institution', data: null };
    }
}

export async function getStaffData(payload: any) {
    try {
        const response = await api.post<any>(API_KEY, 'StaffLogin/getstudata', payload);
        if (response.success && response.data) {
            return { success: true, data: response.data };
        }
        return { success: false, message: response.message || 'Failed to fetch staff data', data: null };
    } catch (error: any) {
        console.error('getStaffData error:', error);
        return { success: false, message: error.message || 'Failed to fetch staff data', data: null };
    }
}

export async function onchangeuser(payload: any) {
    try {
        const response = await api.post<any>(API_KEY, 'StaffLogin/onchangeuser', payload);
        if (response.success && response.data) {
            return { success: true, data: response.data };
        }
        return { success: false, message: response.message || 'Failed to fetch user data', data: null };
    } catch (error: any) {
        console.error('onchangeuser error:', error);
        return { success: false, message: error.message || 'Failed to fetch user data', data: null };
    }
}

export async function saveStaffUser(payload: any) {
    try {
        const response = await api.post<any>(API_KEY, 'StaffLogin/savadata', payload);
        if (response.success) {
            return { success: true, message: response.message || 'Saved successfully' };
        }
        return { success: false, message: response.message || 'Failed to save' };
    } catch (error: any) {
        console.error('saveStaffUser error:', error);
        return { success: false, message: error.message || 'Failed to save' };
    }
}

export async function updateUsername(payload: any) {
    try {
        const response = await api.post<any>(API_KEY, 'StaffLogin/updateuser', payload);
        if (response.success) {
            return { success: true, message: response.message || 'Username updated successfully' };
        }
        return { success: false, message: response.message || 'Failed to update username' };
    } catch (error: any) {
        console.error('updateUsername error:', error);
        return { success: false, message: error.message || 'Failed to update username' };
    }
}

export async function sendOTPSms(mobileNo: string) {
    try {
        const response = await api.get<any>(API_KEY, `StaffLogin/sendotpsms/${mobileNo}`);
        if (response.success) {
            return { success: true, message: response.message || 'OTP sent successfully' };
        }
        return { success: false, message: response.message || 'Failed to send OTP' };
    } catch (error: any) {
        console.error('sendOTPSms error:', error);
        return { success: false, message: error.message || 'Failed to send OTP' };
    }
}

export async function verifyOTP(otp: string) {
    try {
        const response = await api.get<any>(API_KEY, `StaffLogin/VerifyforgetEmailOtp/${otp}`);
        if (response.success) {
            return { success: true, message: response.message || 'OTP verified successfully' };
        }
        return { success: false, message: response.message || 'Failed to verify OTP' };
    } catch (error: any) {
        console.error('verifyOTP error:', error);
        return { success: false, message: error.message || 'Failed to verify OTP' };
    }
}
