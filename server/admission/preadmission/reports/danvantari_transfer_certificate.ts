'use server';

import { api } from '@/lib/apiService';

export async function getDanvantariTCLoadData() {
    return await api.get<any>('admission', '/CollegeStudentTCReport/getalldetails/2');
}

export async function changeYearDanvantariTC(data: { ASMAY_Id: number; tctemporper: string }) {
    return await api.post<any>('admission', '/CollegeStudentTCReport/onchangeyeartc', data);
}

export async function stdNameChangeDanvantariTC(data: { AMCST_Id: number; ASMAY_Id: number; tctemporper: string }) {
    return await api.post<any>('admission', '/CollegeStudentTCReport/stdnamechange', data);
}

export async function getDanvantariTCDetails(data: { ASMAY_Id: number; AMCST_Id: number; tctemporper: string }) {
    return await api.post<any>('admission', '/CollegeStudentTCReport/getTcdetails', data);
}
