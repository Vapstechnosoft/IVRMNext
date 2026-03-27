'use server';

import { api } from '@/lib/apiService';
import { HostelFoodConveyanceReportValues } from '@/schemas/hostel/reports/hostel-food-conveyance-report.schema';

export interface HFCReportLoadDataResponse {
    allAcademicYear: any[];
    allClass: any[];
    allSection: any[];
}

export interface HFCReportStudent {
    regno?: string;
    admno?: string;
    stuFN: string;
    stuMN?: string;
    stuLN?: string;
    class?: string;
    section?: string;
    namme?: string;
    [key: string]: any;
}


export interface HFCReportResponse {
    studentlist: HFCReportStudent[];
}

export async function getHFCReportLoadData(pageId: number = 0): Promise<HFCReportLoadDataResponse | null> {
    try {
        const response = await api.get<HFCReportLoadDataResponse>('hostel', `/api/HostelFoodConveyanceReport/getdata/${pageId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching HFC report load data:', error);
        return null;
    }
}

export async function getHFCReport(data: HostelFoodConveyanceReportValues): Promise<HFCReportResponse | null> {
    try {
        const response = await api.post<HFCReportResponse>('hostel', '/api/HostelFoodConveyanceReport/Studdetails', {
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

