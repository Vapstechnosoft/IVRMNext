'use server';

import { api, ApiResponse } from "@/lib/apiService";

const BASE_URL = "/BBKVCustomReport";

export async function getTCInitialData(): Promise<ApiResponse<any>> {
    return await api.get('admission', `${BASE_URL}/getdetails/2`);
}

export async function onTCYearChange(asmayId: number): Promise<ApiResponse<any>> {
    return await api.post('admission', `${BASE_URL}/onchangeyear`, { ASMAY_Id: asmayId });
}

export async function onTCClassChange(asmayId: number, asmclId: number): Promise<ApiResponse<any>> {
    return await api.post('admission', `${BASE_URL}/onchangeclass`, { ASMAY_Id: asmayId, ASMCL_Id: asmclId });
}

export async function onTCSectionChange(asmayId: number, asmclId: number, asmsId: number): Promise<ApiResponse<any>> {
    return await api.post('admission', `${BASE_URL}/onchangesection`, { ASMAY_Id: asmayId, ASMCL_Id: asmclId, ASMS_Id: asmsId });
}

export async function getStudentNameRegNo(payload: { ASMAY_Id: number; admnoorname: string; tctemporper: string }): Promise<ApiResponse<any>> {
    return await api.post('admission', `${BASE_URL}/getnameregno`, payload);
}

export async function onStudentNameChange(asmayId: number, amstId: number): Promise<ApiResponse<any>> {
    return await api.post('admission', `${BASE_URL}/stdnamechange`, { ASMAY_Id: asmayId, AMST_Id: amstId });
}

export async function getTCDetailsRecord(payload: { ASMAY_Id: number; AMST_Id: number; tctemporper: string }): Promise<ApiResponse<any>> {
    return await api.post('admission', `${BASE_URL}/getTcdetails`, payload);
}

export async function getTCReportDetails(payload: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number; Temp_AmstId: { AMST_Id: number }[] }): Promise<ApiResponse<any>> {
    return await api.post('admission', `${BASE_URL}/GetReportdetails`, payload);
}
