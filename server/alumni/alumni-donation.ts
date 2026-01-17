'use server';

import { api } from '@/lib/apiService';
import type { IAlumniDonationLoadResponse, IPaymentGatewayDetails } from '@/types/alumni/alumni-donation';

export async function getAlumniDonationLoadData() {
    const url = '/AlumniDonation/page_load';
    return await api.get<IAlumniDonationLoadResponse>('alumni', url);
}

export async function getDonationAmount(data: { mI_Id: number; almdoN_Id: number }) {
    const url = '/AlumniDonation/get_amount';
    return await api.post<any>('alumni', url, data);
}

export async function getPaymentDetails(data: { mI_Id: number; fpgD_PGName: string }) {
    const url = '/AlumniDonation/getpayment_details';
    return await api.post<IPaymentGatewayDetails>('alumni', url, data);
}

export async function saveDonationPayment(data: any) {
    const url = '/AlumniDonation/payment_save';
    return await api.post<any>('alumni', url, data);
}

export async function getDonationReport(data: { mI_Id: number; fromdate: string | Date; todate: string | Date }) {
    const url = '/AlumniDonation/getdonationreport';
    return await api.post<any>('alumni', url, data);
}
