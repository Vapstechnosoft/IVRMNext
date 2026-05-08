'use server';
import { api } from '@/lib/apiService';
import { IOralTestScheduleDetails } from '@/types/admission/preadmission/transactions/oral-test-schedule';

export async function getOralReScheduleDetails(classId: number) {
    const response = await api.get<any>('preadmission', `/OralTestReSchedule/Getdetails?ASMCL_ID=${classId}`);
    return response.data.data || response.data;
}

export async function getReScheduleReportDetails(schids: string) {
    const response = await api.post<any>('preadmission', `/OralTestReSchedule/Getreportdetails?schids=${schids}`, {});
    return response.data;
}

export async function getReScheduleStudentDetails(pasrId: number) {
    const response = await api.post<any>('preadmission', `/OralTestReSchedule/GetStudentdetails?pasr_id=${pasrId}`, {});
    return response.data;
}

export async function getReScheduleSelectedRowDetails(paotsId: number) {
    const response = await api.post<any>('preadmission', `/OralTestReSchedule/GetSelectedRowDetails?PAOTS_Id=${paotsId}`, {});
    return response.data;
}

export async function deleteReScheduleStudent(paotsId: number, pasrId: number) {
    const response = await api.post<any>('preadmission', `/OralTestReSchedule/OralTestScheduleDeletesStudentData?PASR_Id=${pasrId}&PAOTS_Id=${paotsId}`, {});
    return response.data;
}

export async function deleteOralReSchedule(id: number) {
    const response = await api.post<any>('preadmission', `/OralTestReSchedule/OralTestScheduleDeletesData?PAOTS_Id=${id}`, {});
    return response.data;
}

export async function saveOralReSchedule(data: any) {
    const response = await api.post<any>('preadmission', '/OralTestReSchedule/SaveOraltest', data);
    return response.data;
}
