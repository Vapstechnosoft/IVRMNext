'use server';

import { api } from '@/lib/apiService';
import type { IStudent } from '@/types/alumni/user-password-creation';

export async function getInitialData(mi_id = 1) {
    const url = `/UsrPwd/getdata/${mi_id}`;
    try {
        const response = await api.get<any>('alumni', url);
        const resData = response?.data || response;
        if (resData) {
            const yearList = (resData.YearList || resData.yearList || []).map((y: any) => ({
                asmaY_Id: y.ASMAY_Id ?? y.asmaY_Id ?? y.id,
                asmaY_Year: y.ASMAY_Year ?? y.asmaY_Year ?? y.year
            }));
            const classlist = (resData.classlist || resData.classList || []).map((c: any) => ({
                asmcL_Id: c.ASMCL_Id ?? c.asmcL_Id ?? c.id,
                asmcL_ClassName: c.ASMCL_ClassName ?? c.asmcL_ClassName ?? c.className
            }));
            const sectionlist = (resData.sectionlist || resData.sectionList || []).map((s: any) => ({
                asmS_Id: s.ASMS_Id ?? s.asmS_Id ?? s.id,
                asmC_SectionName: s.ASMC_SectionName ?? s.asmC_SectionName ?? s.sectionName
            }));
            return {
                success: true,
                data: {
                    yearList,
                    classlist,
                    sectionlist
                }
            };
        }
    } catch (error: any) {
        console.error('getInitialData error:', error);
    }
    return { success: false, data: { yearList: [], classlist: [], sectionlist: [] } };
}

export async function getReportDetails(data: {
    mi_id?: number;
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    filterdata: string;
}) {
    const url = '/UsrPwd/Getreportdetails';
    const payload = {
        MI_Id: data.mi_id || 1,
        ASMAY_Id: data.asmaY_Id,
        ASMCL_Id: data.asmcL_Id,
        ASMS_Id: data.asmS_Id,
        filterdata: data.filterdata
    };
    try {
        const response = await api.post<any>('alumni', url, payload);
        const resData = response?.data || response;
        const list = resData?.messagelist || resData?.data || (Array.isArray(resData) ? resData : []);
        const mappedStudents: IStudent[] = list.map((item: any) => ({
            amst_id: item.AMST_Id ?? item.amst_Id ?? item.ALMST_Id ?? item.almsT_Id ?? item.id ?? 0,
            studentname: item.studentname ?? item.studentName ?? item.name ?? '',
            amst_admno: item.AMST_AdmNo ?? item.amsT_AdmNo ?? item.admNo ?? '',
            asmcl_classname: item.ASMCL_ClassName ?? item.asmcL_ClassName ?? item.className ?? '',
            asmc_sectionname: item.ASMC_SectionName ?? item.asmC_SectionName ?? item.sectionName ?? '',
            username: item.username ?? item.userName ?? '',
            password: item.password ?? ''
        }));
        return {
            success: true,
            data: mappedStudents,
            total: mappedStudents.length
        };
    } catch (error: any) {
        console.error('getReportDetails error:', error);
        return {
            success: false,
            data: [],
            message: typeof error === 'string' ? error : error?.message || 'Failed to fetch report'
        };
    }
}

export async function createUsername(data: {
    mi_id?: number;
    filterdata: string;
    data_array: { AMST_Id: number }[];
}) {
    const url = '/UsrPwd/createusrnme';
    const payload = {
        MI_Id: data.mi_id || 1,
        filterdata: data.filterdata,
        data_array: data.data_array
    };
    try {
        const response = await api.post<any>('alumni', url, payload);
        const resData = response?.data || response;
        if (resData?.success === 'Success' || resData?.success === true || resData?.success === 'true' || response?.success) {
            return { success: true, message: 'Usernames created successfully' };
        }
        return { success: false, message: resData?.message || 'Failed to create usernames' };
    } catch (error: any) {
        console.error('createUsername error:', error);
        return { success: false, message: typeof error === 'string' ? error : error?.message || 'Failed to create usernames' };
    }
}

export async function sendEmail(data: any) {
    const url = '/SMSEmailSend/emailsend';
    return await api.post<any>('alumni', url, data);
}
