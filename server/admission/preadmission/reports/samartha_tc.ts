'use server';

import { api } from '@/lib/apiService';

export async function getSamarthaTCLoadData() {
    return await api.get<any>('admission', '/studenttccustomreport/getinitialdata');
}

// export async function (data: any) {
//     return await api.post<any>('admission', '/studenttccustomreport/changeyear', data);
// }

export async function changeYearSamarthaTC(data: {
    ASMAY_Id: number;
    tctemporper: string;
    report_type: string;
    search?: string;
}) {
    const url = `/StudenttcCustomReport/changeyear?tctemporper=${data.tctemporper}&ASMAY_Id=${data.ASMAY_Id}&report_type=${data.report_type}&admnoorname=${data.search || ""}`;
    return await api.get<any>('admission', url);
}




// export async function changeClassSamarthaTC(data: any) {
//     return await api.post<any>('admission', '/studenttccustomreport/changeclass', data);
// }


export async function changeClassSamarthaTC(data: {
    ASMAY_Id: number;
    tctemporper: string;
    report_type: string;
    ASMCL_Id: number;
    search?: string;
}) {
    const url = `/StudenttcCustomReport/changeclass?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&admnoorname=${data.search || ""}`;
    return await api.get<any>('admission', url);
}

// export async function changeSectionSamarthaTC(data: any) {
//     return await api.post<any>('admission', '/studenttccustomreport/changesection', data);
// }



export async function changeSectionSamarthaTC(data: {
    ASMAY_Id: number;
    tctemporper: string;
    report_type: string;
    ASMCL_Id: number;
    ASMS_Id: number;
    search?: string;
}) {
    const url = `/StudenttcCustomReport/changesection?tctemporper=${data.tctemporper}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}&admnoorname=${data.search || ""}`;
    return await api.get<any>('admission', url);
}


// export async function getSamarthaTCDetails(data: any) {
//     return await api.post<any>('admission', '/studenttccustomreport/getTCdata', data);
// }


export async function getSamarthaTCDetails(data: {
    ASMAY_Id: number;
    AMST_Id: number;
    tctemporper: string;
    ASMCL_Id?: number;
    ASMS_Id?: number;
    search?: string;
    report_type: string;
    Boardtype?: string;
    BSPID?: string;
    Previous_School_Name?: string;
}) {
    const url = `/StudenttcCustomReport/getTCdata?tctemporper=${data.tctemporper}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id || 0}&ASMS_Id=${data.ASMS_Id || 0}&AMST_Id=${data.AMST_Id}&report_type=${data.report_type}&admnoorname=${data.search || ""}`;
    return await api.get<any>('admission', url);
}
