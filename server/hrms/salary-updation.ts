'use server';

import { api } from '@/lib/apiService';
import type {
    SalaryUpdationOnloadResponse,
    SalaryUpdationSaveRequest,
    SalaryUpdationSaveResponse
} from '@/types/hrms/salary-updation';

export async function getSalaryUpdationList(roleId: number) {
    const url = `/api/salaryUpdation/getalldetails/${roleId}`;
    return await api.get<SalaryUpdationOnloadResponse>('hrms', url);
}

export async function saveSalaryUpdation(data: SalaryUpdationSaveRequest) {
    const url = '/api/salaryUpdation/';
    return await api.post<SalaryUpdationSaveResponse>('hrms', url, data);
}

export async function deleteSalaryUpdation(data: { HRESU_Id: number; roleId: number }) {
    const url = `/api/salaryUpdation/${data.HRESU_Id}`;
    return await api.delete<any>('hrms', url);
}

export async function testSalaryUpdationAPI(roleId: number = 2) {
    return await getSalaryUpdationList(roleId);
}
