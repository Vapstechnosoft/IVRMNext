'use server';

import { type ApiResponse, api } from '@/lib/apiService';

export const getInitialDataNDA = async () => {
    let acdlist: any[] = [];
    let monthlist: any[] = [];
    let examlist: any[] = [];

    const endpoints = [
        '/ExamMonthEndReport/getdetails/0',
        '/ExamMonthEndReport/getdetails',
        '/exam_month_end_report/getdetails',
        '/ExamMonthEndReportFacade/getdetails'
    ];

    for (const ep of endpoints) {
        try {
            let res: any;
            if (ep.includes('Facade')) {
                res = await api.post<any>('exam', ep, {});
            } else {
                res = await api.get<any>('exam', ep);
            }
            const raw = res?.data || res;
            if (raw && typeof raw === 'object') {
                const years = raw.acdlist || raw.yearlist || raw.yearList || raw.getyear || raw.academicYearList || raw.year_list;
                const months = raw.monthlist || raw.monthList || raw.getmonth || raw.month_list;
                const exams = raw.examlist || raw.examList || raw.getexam || raw.exam_list;

                if (Array.isArray(years) && years.length > 0) acdlist = years;
                if (Array.isArray(months) && months.length > 0) monthlist = months;
                if (Array.isArray(exams) && exams.length > 0) examlist = exams;

                if (acdlist.length > 0 || monthlist.length > 0 || examlist.length > 0) {
                    break;
                }
            }
        } catch (err) {
            console.warn(`[getInitialDataNDA] ${ep} failed:`, err);
        }
    }

    if (acdlist.length === 0) {
        try {
            const yrRes: any = await api.get<any>('exam', '/exam_master/get_academic_year_list');
            const rawYr = yrRes?.data || yrRes;
            if (Array.isArray(rawYr) && rawYr.length > 0) {
                acdlist = rawYr;
            }
        } catch (err) {
            console.warn('[getInitialDataNDA] /exam_master/get_academic_year_list failed:', err);
        }
    }

    return { acdlist, monthlist, examlist };
};

export const getNDAMonthEndReportData = async (_data: any): Promise<ApiResponse<any>> => {
    const payload = {
        asmaY_Id: Number(_data.ASMAY_Id),
        emE_Id: Number(_data.EME_Id),
        ivrM_Month_Id: Number(_data.IVRM_Month_Id),
        ASMAY_Id: Number(_data.ASMAY_Id),
        EME_Id: Number(_data.EME_Id),
        IVRM_Month_Id: Number(_data.IVRM_Month_Id),
        genderflage: _data.radiodata || 'All',
        radiodata: _data.radiodata || 'All'
    };

    const endpoints = [
        '/ExamMonthEndReport/getreport',
        '/ExamMonthEndReport/onreport',
        '/ExamMonthEndReportFacade/getreport',
        '/ExamMonthEndReportFacade/onreport',
        '/exam_month_end_report'
    ];

    let lastError: any = null;
    for (const ep of endpoints) {
        try {
            console.log(`[getNDAMonthEndReportData] Attempting POST to: ${ep} with payload:`, JSON.stringify(payload));
            const res = await api.post<any>('exam', ep, payload);
            if (res) {
                console.log(`[getNDAMonthEndReportData] Success response from ${ep}`);
                return res;
            }
        } catch (e: any) {
            console.warn(`[getNDAMonthEndReportData] POST ${ep} failed:`, e);
            lastError = e;
        }
    }

    throw lastError || new Error('All report endpoints failed');
};


