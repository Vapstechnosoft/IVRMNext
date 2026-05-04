'use server';
import { api } from '@/lib/apiService';
import { IOralTestScheduleDetails } from '@/types/admission/preadmission/transactions/oral-test-schedule';

export async function getOralTestScheduleDetails() {
    return await api.get<IOralTestScheduleDetails>('admission', '/api/OralTestSchedule/Getdetails');
}

export async function getClasswiseStudent(classId: number) {
    return await api.post<any>('admission', '/api/OralTestSchedule/classwisestudent', { ASMCL_ID: classId });
}

export async function saveOralTestSchedule(data: any) {
    return await api.post<any>('admission', '/api/OralTestSchedule/', data);
}

export async function deleteOralTestSchedule(id: number) {
    return await api.delete<any>('admission', `/api/OralTestSchedule/OralTestScheduleDeletesData/${id}`);
}

export async function getSelectedRowDetails(id: number) {
    return await api.get<any>('admission', `/api/OralTestSchedule/GetSelectedRowDetails/${id}`);
}

export async function deleteOralTestScheduleStudentData(paotsId: number, pasrId: number) {
    const data = { PAOTS_Id: paotsId, PASR_Id: pasrId };
    return await api.post<any>('admission', '/api/OralTestSchedule/OralTestScheduleDeletesStudentData', data);
}

export async function getScheduleReportDetails(paotsId: number) {
    return await api.post<any>('admission', '/api/ScheduleReport/scheduleGetreportdetails', { PAOTS_Id: paotsId });
}

export async function getRemarksReportDetails(paotsId: number) {
    return await api.post<any>('admission', '/api/ScheduleReport/remarksGetreportdetails', { PAOTS_Id: paotsId });
}

export async function checkAddParticipants(data: any) {
    return await api.post<any>('admission', '/api/OralTestSchedule/checkaddparticipants', data);
}

export async function removeStudents(students: any[]) {
    return await api.post<any>('admission', '/api/OralTestSchedule/removestudents', { DeleteStudentData: students });
}

export async function sendReminder(students: any[]) {
    return await api.post<any>('admission', '/api/OralTestSchedule/ReseOralTestScheduleData', { SelectedStudentData: students });
}
