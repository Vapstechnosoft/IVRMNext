'use server';

import { api } from '@/lib/apiService';

export async function getDanvantariBonafideLoadData() {
    return await api.get<any>('admission', '/CollegeStudyCertificateReport/getdata');
}

export async function changeYearDanvantariBonafide(data: { ASMAY_Id: number }) {
    // return await api.post<any>('admission', '/CollegeStudyCertificateReport/onchangeyear', data);
    const url = `/CollegeStudyCertificateReport/onchangeyear?ASMAY_Id=${data.ASMAY_Id}`;
    return await api.post<any>('admission', url, {});

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
    // searchfilter: string;
    // ASMAY_Id: number;
    // AMCST_SOL: string;
    // AMCO_Id: number;
    // AMB_Id: number;
    // AMSE_Id: number;
    // ACMS_Id: number;
    // allorindid: string;
    // filterinitialdata?: string;
    AMCO_Id: number;
    ASMAY_Id: number;
    AMB_Id: number;
    searchfilter: string;
    AMCST_SOL: string;

}) {

    const url = `/CollegeStudyCertificateReport/searchfilter?AMCO_Id=${data.AMCO_Id}&ASMAY_Id=${data.ASMAY_Id}&AMB_Id=${data.AMB_Id}&searchfilter=${data.searchfilter}&AMCST_SOL=${data.AMCST_SOL}`;
    return await api.post<any>('admission', url, {});
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
    //return await api.post<any>('admission', '/CollegeStudyCertificateReport/onclickreport', data);
    const url = `/CollegeStudyCertificateReport/onclickreport?ASMAY_Id=${data.ASMAY_Id}&AMCST_SOL=${data.AMCST_SOL}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}&ACMS_Id=${data.ACMS_Id}&AMCST_Id=${data.AMCST_Id}&allorindid=${data.allorindid}`;
    return await api.post<any>('admission', url, {});
}
