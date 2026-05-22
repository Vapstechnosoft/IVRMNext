'use server';
import { api } from '@/lib/apiService';
import { IWrittenTestScheduleDetails } from '@/types/admission/preadmission/transactions/written-test-schedule';

export async function getWrittenTestScheduleDetails(classId: number = 0) {
    const response = await api.post<IWrittenTestScheduleDetails>('preadmission', `/WrittenTestSchedule/Getdetails`, { ASMCL_ID: classId });
    return response.data;
}

export async function getWrittenTestStudentDetails(pasrId: number) {
    const response = await api.get<any>('preadmission', `/WrittenTestSchedule/GetStudentdetails/${pasrId}`);
    return response.data;
}

export async function saveWrittenTestSchedule(data: any) {
    const response = await api.post<any>('preadmission', '/WrittenTestSchedule/', data);
    return response.data;
}

export async function deleteWrittenTestSchedule(id: number) {
    // Angular frontend calls this with getURI -> GET request. We'll use get if it expects GET, but often delete is preferred in newer APIs. 
    // Wait, the angular code uses getURI: apiService.getURI("WrittenTestSchedule/WrittenTestScheduleDeletesData", MdeleteId)
    // In our Next.js backend we'll use `get` as requested by Angular or standard backend pattern. Usually we should hit the endpoint correctly.
    const response = await api.delete<any>('preadmission', `/WrittenTestSchedule/WrittenTestScheduleDeletesData/${id}`);
    return response.data;
}

export async function getWrittenTestSelectedRowDetails(id: number) {
    const response = await api.get<any>('preadmission', `/WrittenTestSchedule/GetSelectedRowDetails/${id}`);
    return response.data;
}

export async function deleteWrittenTestScheduleStudentData(data: { PAWTS_Id: number; PASR_Id: number }) {
    // Angular uses POST via create(): apiService.create("WrittenTestSchedule/WrittenTestScheduleDeletesStudentData", data)
    const response = await api.post<any>('preadmission', `/WrittenTestSchedule/WrittenTestScheduleDeletesStudentData`, data);
    return response.data;
}

export async function getWrittenTestRemainStudentDetails() {
    const response = await api.get<any>('preadmission', `/WrittenTestSchedule/GetRemainStudentdetails`);
    return response.data;
}
