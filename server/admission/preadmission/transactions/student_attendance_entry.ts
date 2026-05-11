'use server';

import { api, ApiResponse } from "@/lib/apiService";

const BASE_URL = "/StudentAttendanceEntry";

/**
 * Loads initial data for Student Attendance Entry.
 * @param yearId The academic year ID.
 */
export async function getInitialData(portalType?: string | number) {
  const url = portalType !== undefined && portalType !== null && portalType !== ''
    ? `/StudentAttendanceEntry/getinitialdata?stringmobileorportal=${portalType}`
    : '/StudentAttendanceEntry/getinitialdata';
  const res = await api.get<any>('admission', url);
  return res?.data || res;
}
/**
 * Gets student data based on criteria (Class/Section/Year).
 */
export async function getStudentData(data: {
  asmay_Id: number;
  asmcl_Id: number;
  asmS_Id: number;
  asamdM_Entry_DateTime: string;
  monthflag: string;
  monthflag1: string;
  classsecflag: string;
  checksubject: string;
}) {
  const res = await api.post<any>('admission', '/StudentAttendanceEntry/getstudentdata', data);
  return res?.data || res;
}
/**
 * Gets month class held for monthly attendance.
 */
export async function getMonthClassHeld(data: {
  asmay_Id: number;
  asmcl_Id: number;
  asmS_Id: number;
  monthid: number;
  monthflag: string;
  monthflag1: string;
  asamdM_Entry_DateTime: string;
}) {
  const res = await api.post<any>('admission', '/StudentAttendanceEntry/getmonthclassheld', data);
  return res?.data || res;
}

/**
 * Gets date wise attendance details.
 */
export async function getDateWiseAttendance(data: {
  asmay_Id: number;
  asmcl_Id: number;
  asmS_Id: number;
  asamdM_Entry_DateTime: string;
  monthflag: string;
  monthid: number;
}) {
  const res = await api.post<any>('admission', '/StudentAttendanceEntry/getdatewiseatt', data);
  return res?.data || res;
}


/**
 * Gets batch list for a subject.
 */
export async function getBatchList(data: {
  ASMAY_Id: number;
  ASMCL_Id: number;
  ASMS_Id: number;
  ismS_Id: number;
}) {
  const res = await api.post<any>('admission', `/StudentAttendanceEntry/getbatchlist?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}&ismS_Id=${data.ismS_Id}`);
  return res?.data || res;
}
/**
 * Gets student list for period wise attendance.
 */
export async function getStdListPeriod(data: {
  asmay_Id: number;
  asmcl_Id: number;
  asmS_Id: number;
  ismS_Id: number;
  ttmP_Id: number;
  monthflag: string;
  monthflag1: string;
  att_entry_type: string;
  asasB_Id: number;
}) {
  const res = await api.post<any>('admission', '/StudentAttendanceEntry/getstdlistperiod', data);
  return res?.data || res;
}
/**
 * Saves student attendance entry.
 */
export async function saveAttendance(payload: any): Promise<ApiResponse<any>> {
  return await api.post('admission', `${BASE_URL}`, payload);
}

/**
 * Views attendance details staff wise.
 */
export async function viewAttendanceDetailsStaffWise(data: {
  ASMAY_Id: number;
  ASMCL_Id: number;
  ASMS_Id: number;
  att_entry_type: string;
}) {
  let url = `/StudentAttendanceEntry/ViewAttendanceDetailsStaffWise?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}`;
  if (data.att_entry_type) {
    url += `&att_entry_type=${data.att_entry_type}`;
  }
  const res = await api.post<any>('admission', url);
  return res?.data || res;
}

/**
 * Deletes attendance for a criteria.
 */
export async function deleteAttendance(data: any) {
  const res = await api.post<any>('admission', '/StudentAttendanceEntry/Deleteattendance', data);
  return res?.data || res;
}


export async function deleteAttendanceRecordWise(data: {
  ASA_Id: number;
}) {
  const res = await api.post<any>('admission', `/StudentAttendanceEntry/AttendanceDeleteRecordWise?asaId=${data.ASA_Id}`);
  return res?.data || res;
}
