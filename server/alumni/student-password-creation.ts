'use server';

import { api } from '@/lib/apiService';
import type {
    IStudentPasswordCreationInitialData,
    IStudentPasswordCreationReportResponse,
    ICommonResponse,
    ICredentialStudent
} from '@/types/alumni/student-password-creation';

export async function getInitialData() {
    try {
        const res = await api.get<IStudentPasswordCreationInitialData>('alumni', 'SMSEmailSend/getdata');
        return { success: true, data: res.data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getReportDetails(data: {
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    filterdata: string;
}) {
    try {
        const url = `SMSEmailSend/Getreportdetails?ASMAY_Id=${data.asmaY_Id}&ASMCL_Id=${data.asmcL_Id}&ASMS_Id=${data.asmS_Id}&filterdata=${data.filterdata}`;
        const res = await api.get<IStudentPasswordCreationReportResponse>('alumni', url);
        return { success: true, data: res.data?.messagelist };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function resetStudentPassword(student: ICredentialStudent, selectedStudents: ICredentialStudent[]) {
    try {
        const data = {
            username: student.username,
            amsT_Id: student.amsT_Id,
            data_array: selectedStudents
        };
        const res = await api.post<any>('alumni', 'SMSEmailSend/resetUser', data);
        if (res.data?.message === 'Success') {
            return { success: true, message: 'Password Reset Successfully' };
        } else {
            return { success: false, message: 'Failed to reset password' };
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function sendSMS(filterdata: string, selectedStudents: ICredentialStudent[]) {
    try {
        const data = {
            filterdata,
            data_array: selectedStudents
        };
        const res = await api.post<ICommonResponse>('alumni', 'SMSEmailSend/smssend', data);
        if (res.data?.success === 'success') {
            return { success: true, message: 'SMS Sent Successfully' };
        } else {
            return { success: false, message: 'Failed to send SMS' };
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function sendEmail(filterdata: string, selectedStudents: ICredentialStudent[]) {
    try {
        const data = {
            filterdata,
            data_array: selectedStudents
        };
        const res = await api.post<ICommonResponse>('alumni', 'SMSEmailSend/emailsend', data);
        if (res.data?.success === 'success') {
            return { success: true, message: 'Email Sent Successfully' };
        } else {
            return { success: false, message: 'Failed to send Email' };
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function sendWhatsApp(filterdata: string, selectedStudents: ICredentialStudent[]) {
    try {
        const data = {
            filterdata,
            data_array: selectedStudents
        };
        const res = await api.post<ICommonResponse>('alumni', 'SMSEmailSend/whatsapp', data);
        if (res.data?.success === 'success') {
            return { success: true, message: 'WhatsApp Sent Successfully' };
        } else {
            return { success: false, message: 'Failed to send WhatsApp' };
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
