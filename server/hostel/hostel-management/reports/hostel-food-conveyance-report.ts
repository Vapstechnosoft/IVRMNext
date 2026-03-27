'use server';

import { api } from '@/lib/apiService';
import { HostelFoodConveyanceReportValues } from '@/schemas/hostel/reports/hostel-food-conveyance-report.schema';

export async function getHFCReportLoadData(pageId: number) {
    try {
        const response = await api.get('hostel', `/api/HostelFoodConveyanceReport/getdata/${pageId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching HFC report load data:', error);
        return null;
    }
}

export async function getHFCReport(data: HostelFoodConveyanceReportValues) {
    try {
        const response = await api.post('hostel', '/api/HostelFoodConveyanceReport/Studdetails', {
            ASMAY_Id: data.asmaY_Id,
            ASMCL_Id: data.asmcL_Id,
            ASMC_Id: data.asmC_Id,
            HFC_Flag: data.hfcFlag
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching HFC report data:', error);
        return null;
    }
}
