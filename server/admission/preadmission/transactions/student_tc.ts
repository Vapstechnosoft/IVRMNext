'use server';

import { api } from '@/lib/apiService';

export interface StudentTcDTO {
    amsT_Id: number;
    studentName: string;
    amsT_AdmNo: string;
    // Add other fields if known/needed
}

export const getStudentsByAcademicYear = async (asmayId: number): Promise<any> => {
    return api.get<StudentTcDTO[]>('admission', `/StudentTc/GetStudentsByAcademicYear?asmayId=${asmayId}`);
};

export const getStudentDetailsOnNameChange = async (asmayId: number, amstId: number): Promise<any> => {
    return api.get('admission', `/StudentTc/OnStudentNameChange?ASMAY_Id=${asmayId}&AMST_Id=${amstId}`);
};

export const getTCCancelDetails = async (asmayId: number, amstId: number, reason = 'tmp'): Promise<any> => {
    return api.post('admission', `/StudentTc/GetTCCancelDetails?ASMAY_Id=${asmayId}&AMST_Id=${amstId}&TC_CancelReason=${reason}`, {});
};

// export const getStudentTCInitialData = async (data: any): Promise<any> => {
//     return api.post('admission', '/StudentTc/GetStudentNameList', data);
// };

// export const getStudentTCList = async (data: any): Promise<any> => {
//     return api.post('admission', '/StudentTc/GetStudentNameList', data);
// };

export const getStudentTCDetails = async (data: any): Promise<any> => {
    return api.post('admission', '/StudentTc/GetTcDetails', data);
};

export const saveStudentTC = async (data: any): Promise<any> => {
    return api.post('admission', '/StudentTc/SaveDetails', data);
};
