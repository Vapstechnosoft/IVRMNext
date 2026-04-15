'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches initial data for NDA Student Photo Approval (Years, Classes, Sections)
 */
export async function getNdaPhotoInitialData(data: { dup: string }) {
  const url = '/SMSApprovalTransaction/Getdata';
  const res = await api.post<any>('admission', url, data);
  return res?.data || res;
}

/**
 * Fetches student or staff photo approval records based on selection
 */
export async function getNdaPhotoApprovalList(data: {
  dup: string;
  ASMAY_Id?: number;
  ASMCL_Id?: number;
  ASMS_Id?: number;
}) {
  const url = '/SMSApprovalTransaction/NDAonSelectGetApproval';
  const res = await api.post<any>('admission', url, data);
  return res?.data || res;
}

/**
 * Saves photo approval/rejection status
 */
export async function saveNdaPhotoApproval(data: {
  SelectedImageslist: any[];
  dup: string;
}) {
  const url = '/SMSApprovalTransaction/NDAsavedetails';
  const res = await api.post<any>('admission', url, data);
  return res?.data || res;
}
