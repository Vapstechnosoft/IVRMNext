'use server';

import { api } from '@/lib/apiService';

// DCPS_TransferCertificate api/CollegeStudentTCReport/getalldetails
export async function getDanvantariTCLoadData() {
    return await api.get<any>('admission', '/CollegeStudentTCReport/getalldetails');
}

// DCPS_TransferCertificate api/CollegeStudentTCReport/onchangeyear
export async function changeYearDanvantariTC(data: { ASMAY_Id: number; tctemporper: string }) {
    return await api.post<any>('admission', '/CollegeStudentTCReport/onchangeyear', data);
}

// DCPS_TransferCertificate api/CollegeStudentTCReport/onchangecourse
export async function changeCourseDanvantariTC(data: { ASMAY_Id: number; AMCO_Id: number; tctemporper: string }) {
    return await api.post<any>('admission', '/CollegeStudentTCReport/onchangecourse', data);
}

// DCPS_TransferCertificate api/CollegeStudentTCReport/onchangesemester
export async function changeSemesterDanvantariTC(data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number; AMSE_Id: number; tctemporper: string }) {
    return await api.post<any>('admission', '/CollegeStudentTCReport/onchangesemester', data);
}

// DCPS_TransferCertificate api/CollegeStudentTCReport/Getreportdetails
export async function getDanvantariTCDetails(data: { ASMAY_Id: number; AMCST_Id: number; tctemporper: string }) {
    return await api.post<any>('admission', '/CollegeStudentTCReport/Getreportdetails', data);
}
