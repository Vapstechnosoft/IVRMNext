'use server';

import { api } from '@/lib/apiService';

export async function getCasteBirthCertificateInitialData(pageId: number) {
    try {
        const response = await api.post<any>('admission', '/StudyCertificate/getdata', { pageid: pageId });
        return { success: true, data: response };
    } catch (error: any) {
        return { success: false, message: error.message || 'Failed to fetch initial data' };
    }
}

export async function searchCasteBirthStudent(data: any) {
    try {
        const response = await api.post<any>('admission', '/StudyCertificate/searchfilter', data);
        return { success: true, data: response };
    } catch (error: any) {
        return { success: false, message: error.message || 'Failed to search students' };
    }
}

export async function getCasteBirthStudentReport(data: any) {
    try {
        const response = await api.post<any>('admission', '/StudyCertificate/StuddetailsReport', data);
        return { success: true, data: response };
    } catch (error: any) {
        return { success: false, message: error.message || 'Failed to generate report' };
    }
}

export async function generateCasteBirthQRCode(data: any) {
    try {
        const response = await api.post<any>('admission', '/QRcodeStudentCertificate/QRCODECertificates', data);
        return { success: true, data: response };
    } catch (error: any) {
        return { success: false, message: error.message || 'Failed to generate QR Code' };
    }
}

