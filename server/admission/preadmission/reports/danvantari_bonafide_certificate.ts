'use server';

import { api } from '@/lib/apiService';

export async function getDanvantariBonafideLoadData() {
    return await api.get<any>('admission', '/CollegeStudyCertificateReport/getdata/1');
}

export async function changeYearDanvantariBonafide(data: { ASMAY_Id: number }) {
    return await api.post<any>('admission', '/CollegeStudyCertificateReport/onchangeyear', data);
}

export async function changeCourseDanvantariBonafide(data: { ASMAY_Id: number; AMCO_Id: number }) {
    return await api.post<any>('admission', '/CollegeStudyCertificateReport/onchangecourse', data);
}

export async function changeBranchDanvantariBonafide(data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) {
    return await api.post<any>('admission', '/CollegeStudyCertificateReport/onchangebranch', data);
}

export async function changeSemesterDanvantariBonafide(data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number; AMSE_Id: number }) {
    return await api.post<any>('admission', '/CollegeStudyCertificateReport/onchangesemester', data);
}

export async function getDanvantariBonafideSearchFilter(data: {
    searchfilter: string;
    ASMAY_Id: number;
    AMCST_SOL: string;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
    ACMS_Id: number;
    allorindid: string;
    filterinitialdata?: string;
}) {
    // Note: The legacy code uses 'filterinitialdata' as the radio object (Studying/Deactive)
    return await api.post<any>('admission', '/CollegeStudyCertificateReport/searchfilter', data);
}

export async function getDanvantariBonafideReport(data: {
    ASMAY_Id: number;
    AMCST_SOL: string;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
    ACMS_Id: number;
    AMCST_Id: number;
    allorindid: string;
}) {
    return await api.post<any>('admission', '/CollegeStudyCertificateReport/onclickreport', data);
}
