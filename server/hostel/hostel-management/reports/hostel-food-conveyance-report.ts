'use server';

import { api } from '@/lib/apiService';
import { HostelFoodConveyanceReportValues } from '@/schemas/hostel/reports/hostel-food-conveyance-report.schema';

export async function getHFCReportLoadData(pageId: number = 1): Promise<any> {
  try {
    const response = await api.get<any>('hostel', `/HostelFoodConveyanceReport/getdata/${pageId}`);
    return response;
  } catch (error) {
    console.error('Error fetching HFC report load data:', error);
    return null;
  }
}

export async function getHFCReport(data: HostelFoodConveyanceReportValues): Promise<any> {
  try {
    const response = await api.post<any>('hostel', '/HostelFoodConveyanceReport/Studdetails', {
      ASMAY_Id: data.asmaY_Id,
      ASMCL_Id: data.asmcL_Id,
      ASMC_Id: data.asmC_Id,
      HFC_Flag: data.hfcFlag,
    });
    return response;
  } catch (error) {
    console.error('Error fetching HFC report data:', error);
    return null;
  }
}
