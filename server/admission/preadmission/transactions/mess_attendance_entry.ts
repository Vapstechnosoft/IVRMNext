'use server';

import { api } from '@/lib/apiService';

export async function getMessAttendanceLoadData(yearId: number) {
    const res = await api.get<any>('admission', `/StudentAttendanceEntry/loadinitialdata/${yearId}`);
    return res?.data || res;
}

export async function getStudentData(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    classsecflag: string;
}) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/getstudentdata/', data);
    return res?.data || res;
}

export async function getStudents(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    ASAMDM_Entry_DateTime: string;
    checksubject: string;
}) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/GetStudents/', data);
    return res?.data || res;
}

export async function getMonthClassHeld(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    monthid: number;
    monthflag: string;
    monthflag1: string;
    ASA_FromDate: string;
}) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/getmonthclassheld/', data);
    return res?.data || res;
}

export async function getDatewiseAttMDM(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    monthid: number;
    monthflag: string;
    monthflag1: string;
    ASA_FromDate: string;
}) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/getdatewiseattMDM/', data);
    return res?.data || res;
}

export async function getBatchList(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    ismS_Id: number;
}) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/getbatchlist/', data);
    return res?.data || res;
}

export async function getStdListPeriod(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    ismS_Id: number;
    TTMP_Id: number;
    monthflag: string;
    monthflag1: string;
    ASA_FromDate: string;
    asasB_Id: number;
}) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/getstdlistperiod/', data);
    return res?.data || res;
}

export async function viewAttendanceDetailsStaffWise(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    att_entry_type: string;
}) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/ViewAttendanceDetailsStaffWise', data);
    return res?.data || res;
}

export async function saveMessStudentAttendance(data: any) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/SaveMessStudentAttendance', data);
    return res?.data || res;
}

export async function deleteAttendance(data: any) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/Deleteattendance', data);
    return res?.data || res;
}

export async function attendanceDeleteRecordWise(data: any) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/AttendanceDeleteRecordWise', data);
    return res?.data || res;
}
