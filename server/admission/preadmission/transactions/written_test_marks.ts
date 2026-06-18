'use server';

import { api } from '@/lib/apiService';

export async function getWrittenTestMarksInitialData() {
    const response = await api.get<any>('preadmission', '/WrittenTestMarksEntry/GetWrittenTestMarksEntryData');
    return response.data;
}

export async function getWrittenTestMarksStudents(pawtsId: number) {
    const response = await api.post<any>('preadmission', `/WrittenTestMarksEntry/GetdetailsOnSchedule?PAWTS_Id=${pawtsId}`);
    return response.data;
}

export async function getWrittenTestMarksGrid(data: {
    isms_Id: number | string;
    selectedStudentDetails: any[];
}) {
    const response = await api.post<any>('preadmission', '/WrittenTestMarksEntry/GetWrittenTestMarks', data);
    return response.data;
}

export async function saveWrittenTestMarks(data: {
    paswM_Id: number;
    pawtS_Id: number;
    writtenTestScheduleAppFlag: string | boolean;
    selectedStudentMarksData: any[];
}) {
    const response = await api.post<any>('preadmission', '/WrittenTestMarksEntry/SaveWrittenTestMarksEntryData', data);
    return response.data;
}
