"use server";

import { api } from '@/lib/apiService';

export async function getEmpDetails() {
  const url = "/PreLiveMeetingSchedule/getempdetails";
  return await api.get<any>('admission', url);
}

export async function onDateChange(payload: any) {
  const url = "/PreLiveMeetingSchedule/ondatechange";
  return await api.post<any>('admission', url, payload);
}

export async function onScheduleChange(payload: any) {
  const url = "/PreLiveMeetingSchedule/onschedulecahnge";
  return await api.post<any>('admission', url, payload);
}

export async function onStartMeeting(payload: any) {
  const url = "/PreLiveMeetingSchedule/onstartmeeting";
  return await api.post<any>('admission', url, payload);
}

export async function joinMeeting(payload: any) {
  const url = "/PreLiveMeetingSchedule/joinmeeting";
  return await api.post<any>('admission', url, payload);
}

export async function endMainMeeting(payload: any) {
  const url = "/PreLiveMeetingSchedule/endmainmeeting";
  return await api.post<any>('admission', url, payload);
}

export async function saveRemarks(payload: any) {
  const url = "/PreLiveMeetingSchedule/saveremarks";
  return await api.post<any>('admission', url, payload);
}

export async function getPrintData(pasrId: number) {
  const url = `/StudentApplication/getprintdata/${pasrId}`;
  return await api.get<any>('admission', url);
}
