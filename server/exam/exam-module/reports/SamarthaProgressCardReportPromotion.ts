'use server';

import { api } from '@/lib/apiService';

export async function getSamarthaProgressCardReportPromotion(data: any) {
    try {
        const url = '/JSHSExamReportsFacade/nds_6_8_report';
        const payload = {
            ASMAY_Id: data.asmaY_Id,
            ASMCL_Id: data.asmcL_Id,
            ASMS_Id: data.asmS_Id,
            Temp_AmstIds: data.studentList
        };
        const response = await api.post<any>('exam', url, payload);
        return response;
    } catch (error) {
        console.error('Error in getSamarthaProgressCardReportPromotion:', error);
        return {
            success: false,
            status: 500,
            message: 'An error occurred while fetching report data',
            data: null
        };
    }
}
