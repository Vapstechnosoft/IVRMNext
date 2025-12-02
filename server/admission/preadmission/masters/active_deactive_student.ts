'use server';

import { api } from '@/lib/apiService';

export async function getMasterStudentList(amst_sol: string, asmay_id: number, asmcl_id: number, asms_id: number) {
    const url = `/activate_deactivate_students/${amst_sol}?asmay_id=${asmay_id}&asmcl_id=${asmcl_id}&asms_id=${asms_id}`;
    return await api.get('admission', url);
}
export async function ActiveDeactive(data: any) {
    const url = '/activate_deactivate_students';
    return await api.put<any>('admission', url, data);
}
