'use server';
import { api } from '@/lib/apiService';
import { IOralTestScheduleDetails } from '@/types/admission/preadmission/transactions/oral-test-schedule';

export async function getOralReScheduleDetails() {
    return await api.get<IOralTestScheduleDetails>('admission', '/api/OralTestReSchedule/Getdetails');
}

export async function getReScheduleReportDetails(paotsId: number) {
    return await api.post<any>('admission', '/api/OralTestReSchedule/Getreportdetails', { schids: paotsId });
}

export async function getReScheduleStudentDetails(pasrId: number) {
    return await api.get<any>('admission', `/api/OralTestReSchedule/GetStudentdetails/${pasrId}`);
}

export async function deleteReScheduleStudent(paotsId: number, pasrId: number) {
    const data = { PAOTS_Id: paotsId, PASR_Id: pasrId };
    return await api.post<any>('admission', '/api/OralTestReSchedule/OralTestScheduleDeletesStudentData', data);
}

export async function deleteOralReSchedule(id: number) {
    return await api.delete<any>('admission', `/api/OralTestReSchedule/OralTestScheduleDeletesData/${id}`);
}

export async function getReScheduleSelectedRowDetails(id: number) {
    return await api.get<any>('admission', `/api/OralTestReSchedule/GetSelectedRowDetails/${id}`);
}

export async function saveOralReSchedule(data: any) {
    return await api.post<any>('admission', '/api/OralTestReSchedule/', data);
}
