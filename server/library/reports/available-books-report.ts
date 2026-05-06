'use server';

import { api } from '@/lib/apiService';
import type {
    IAvailableBooksReportInitialData,
    IAvailableBooksReportRequest,
    IAvailableBooksReportResponse
} from '@/types/library/reports/available-books-report';

const FACADE = 'AvailableBooksReport';

export async function getAvailableBooksReportInitialData() {
    const url = `AvailableBooksReport/getdetails`;
    return await api.get<IAvailableBooksReportInitialData>('library', url);
}

export async function getAvailableBooksReportData(data: IAvailableBooksReportRequest) {
    const url = `${FACADE}/get-report`;
    return await api.post<IAvailableBooksReportResponse>('library', url, data);
}
