'use server';

import { api, ApiResponse } from "@/lib/apiService";

const BASE_URL = "/StudentAttendanceEntry";

/**
 * Loads initial data for Student Attendance Entry.
 * @param yearId The academic year ID.
 */
export async function getInitialData(yearId: number): Promise<ApiResponse<any>> {
  return await api.get('admission', `${BASE_URL}/loadinitialdata/${yearId}`);
}

/**
 * Gets student data based on criteria (Class/Section/Year).
 */
export async function getStudentData(payload: any): Promise<ApiResponse<any>> {
  return await api.post('admission', `${BASE_URL}/getstudentdata`, payload);
}

/**
 * Gets month class held for monthly attendance.
 */
export async function getMonthClassHeld(payload: any): Promise<ApiResponse<any>> {
  return await api.post('admission', `${BASE_URL}/getmonthclassheld`, payload);
}

/**
 * Gets date wise attendance details.
 */
export async function getDateWiseAttendance(payload: any): Promise<ApiResponse<any>> {
  return await api.post('admission', `${BASE_URL}/getdatewiseatt`, payload);
}

/**
 * Gets batch list for a subject.
 */
export async function getBatchList(payload: any): Promise<ApiResponse<any>> {
  return await api.post('admission', `${BASE_URL}/getbatchlist`, payload);
}

/**
 * Gets student list for period wise attendance.
 */
export async function getStdListPeriod(payload: any): Promise<ApiResponse<any>> {
  return await api.post('admission', `${BASE_URL}/getstdlistperiod`, payload);
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
export async function viewAttendanceDetailsStaffWise(payload: any): Promise<ApiResponse<any>> {
  return await api.post('admission', `${BASE_URL}/ViewAttendanceDetailsStaffWise`, payload);
}

/**
 * Deletes attendance for a criteria.
 */
export async function deleteAttendance(payload: any): Promise<ApiResponse<any>> {
  return await api.post('admission', `${BASE_URL}/Deleteattendance`, payload);
}

/**
 * Deletes a specific attendance record.
 */
export async function deleteAttendanceRecordWise(payload: any): Promise<ApiResponse<any>> {
  return await api.post('admission', `${BASE_URL}/AttendanceDeleteRecordWise`, payload);
}
