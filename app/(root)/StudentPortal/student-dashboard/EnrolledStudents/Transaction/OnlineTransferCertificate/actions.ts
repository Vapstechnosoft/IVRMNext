'use server';

import { api } from '@/lib/apiService';

// Define types based on expected data
export interface OnlineTCData {
    ASTC_Id?: number;
    ASTC_Date?: string;
    ASTC_Reason?: string;
    ASTC_Remarks?: string;
}

export async function getTransferCertificateDetails(data: any) {
    const url = `/api/StudentPortal/OnlineTransferCertificate/getdetails`;
    return await api.post<any>('default', url, data);
}

export async function applyTransferCertificate(data: any) {
    const url = `/api/StudentPortal/OnlineTransferCertificate/save`;
    return await api.post<any>('default', url, data);
}

export async function editTransferCertificate(data: any) {
    const url = `/api/StudentPortal/OnlineTransferCertificate/getdetails`;
    return await api.post<any>('default', url, data);
}

export async function deactivateTransferCertificate(data: any) {
    const url = `/api/StudentPortal/OnlineTransferCertificate/deactivate`;
    return await api.post<any>('default', url, data);
}

export async function approveTransferCertificate(data: any) {
    const url = `/api/StudentPortal/OnlineTransferCertificate/approve`;
    return await api.post<any>('default', url, data);
}

export async function rejectTransferCertificate(data: any) {
    const url = `/api/StudentPortal/OnlineTransferCertificate/reject`;
    return await api.post<any>('default', url, data);
}
