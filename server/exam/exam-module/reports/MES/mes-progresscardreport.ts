'use server';

import { api } from '@/lib/apiService';

/**
 * MES Progress Card Report Server Actions
 */

export async function getInitialData() {
    const url = '/BaldwinAllReport/Getdetails';
    return await api.get<any>('exam', url);
}

export async function getStudents(data: any) {
    const url = '/Baldwin_Final_P_Report/get_students';
    return await api.post<any>('exam', url, data);
}

export async function getExamReport(data: any) {
    const url = '/BaldwinAllReport/savedetails';
    return await api.post<any>('exam', url, data);
}

export async function onchangeYear(data: any) {
    const url = '/CumulativeReport/onchangeyear';
    return await api.post<any>('exam', url, data);
}

export async function onchangeClass(data: any) {
    const url = '/CumulativeReport/onchangeclass';
    return await api.post<any>('exam', url, data);
}

export async function onchangeSection(data: any) {
    const url = '/CumulativeReport/onchangesection';
    return await api.post<any>('exam', url, data);
}
