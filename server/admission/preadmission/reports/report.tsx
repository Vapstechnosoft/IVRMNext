'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IConcessionDropDown } from '@/types/admission/preadmission/masters';

export async function getStudentTcReport(data: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, ',ivrmmR_Name');
    const url = `/StudentTcReport/GetAdmissionTcReport?${urlParams}&ASMAY_Id=${data.ASMAY_Id}&AllOrInd=${data.AllOrInd}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&TempararyArrayheadList=${data.TempararyArrayheadList}&PermOrTemp=${data.PermOrTemp}&AMC_Id=${data.AMC_Id}`;
    return await api.post<any>('admission', url, data);
}
export async function getMonthEndReport(data: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, ',ivrmmR_Name');
    const url = `/monthendreport/GetMonthEndReport?${urlParams}&AcayId=${data.ASMAY_Id}&Month=${data.month}&Year=${data.year}`;
    return await api.post<any>('admission', url, data);
}
export async function getPreAdmissionMonthEndReport(data: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, ',ivrmmR_Name');
    const url = `/PreAdmissionMonthEndReport/GetPreAdmissionMonthEndReport?Year=${data.year}&Month=${data.month}&Amay=${data.ASMAY_Id}&${urlParams}`;
    return await api.post<any>('admission', url, data);
}
export async function getPreAdmissionRegistrationReport(data: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'name,email_Id,mob_No,created_Date');
    let url = `/RegistrationReport/GetRegistrationReport?${urlParams}`;

    // YEAR WISE
    if (data?.academicYearId) {
        url += `&ASMAY_Id=${data.academicYearId}`;
    }

    // BETWEEN DATES — pass each date if available
    if (data?.fromDate !== null && data?.fromDate !== undefined) {
        url += `&From_Date=${data.fromDate}`;
    }

    if (data?.toDate !== null && data?.toDate !== undefined) {
        url += `&To_Date=${data.toDate}`;
    }

    return await api.post<any>('admission', url);
}
export async function getPreAdmissionEmailSmsReport(data: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'name,email_Id,mob_No,created_Date');
    let url = `/EmailSmsReport/GetSMSEmailReport?${urlParams}`;

    // YEAR WISE
    if (data?.academicYearId) {
        url += `&ASMAY_Id=${data.academicYearId}`;
    }

    // BETWEEN DATES — pass each date if available
    if (data?.fromDate !== null && data?.fromDate !== undefined) {
        url += `&From_Date=${data.fromDate}`;
    }

    if (data?.toDate !== null && data?.toDate !== undefined) {
        url += `&To_Date=${data.toDate}`;
    }

    return await api.post<any>('admission', url);
}
export async function getStudyCertficateReport(data: any) {
    const url = `/StudyCertificateReport/GetStudyCertificateReport?&ASMAY_Id=${data.ASMAY_Id}&AllOrInd=${data.AllOrInd}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&AMST_Id=${data.AMST_Id}`;
    return await api.post<any>('admission', url, data);
}
export async function getConcessionDropdown() {
    const url = '/Classwisestudentdetails/GetConcessionDropdown';
    return await api.get<IConcessionDropDown[]>('admission', url);
}
export async function getclasswiseStudentDetails(
    ASMAY_Id: number,
    fmcC_Id: number,
    // studentScope: string,
    payload?: any,
    searchParams?: ApiSearchparams
) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'AMST_FirstName');
    const url = `/Classwisestudentdetails/Getreportdetails?ASMAY_Id=${ASMAY_Id}&flag=${fmcC_Id}&${urlParams}`;

    return await api.post<any[]>('admission', url, payload);
}
export async function getAttendanceAbsentSmsReport(ASMAY_Id: number, from_date: string, frequency: string, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'AMST_FirstName');
    const url = `/OveralldailyattendanceabsentsmsFacade/GetOverallDailyAbsentAttendance?${urlParams}&ASMAY_Id=${ASMAY_Id}&FromDate=${from_date}&Flag=${frequency}`;
    return await api.post<any[]>('admission', url);
}
export async function getAttendanceReport(ASMAY_Id: number, from_date: string, frequency: string, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'AMST_FirstName');
    const url = `/OverallAttendance/GetOverallDailyAttendance?${urlParams}&ASMAY_Id=${ASMAY_Id}&FromDate=${from_date}&Flag=${frequency}`;
    return await api.post<any[]>('admission', url);
}
