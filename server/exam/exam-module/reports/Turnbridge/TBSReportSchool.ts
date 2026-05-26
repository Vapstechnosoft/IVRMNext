'use server';

import { api } from '@/lib/apiService';

export async function getTBSReportSchool(data: any) {
    try {
        const url = '/JSHSExamReports/TBSReportSchool';
        const payload = {
            ASMAY_Id: data.ASMAY_Id,
            ASMCL_Id: data.ASMCL_Id,
            ASMS_Id: data.ASMS_Id,
            Temp_AmstIds: data.Temp_AmstIds,
            EMPG_GroupName: '',
            EMGR_Id: 0
        };
        const response = await api.post<any>('exam', url, payload);
        return response;
    } catch (error) {
        console.error('getTBSReportSchool error:', error);
        return {
            success: false,
            status: 500,
            message: 'Server error occurred while fetching report',
            data: null
        };
    }
}
