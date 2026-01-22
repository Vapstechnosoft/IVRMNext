'use server';

import { api } from '@/lib/apiService';
import { AllotmentReportSchema } from '@/schemas/hostel/reports/allotment-report.schema';

const URL_BASE = 'Hostel_Allotment_Report/';

export const getAllotmentReportLoadData = async () => {
  try {
    const response = await api.get<{ yearlist: any[], hostellist: any[] }>('default', URL_BASE + 'getdata/2');
    return response.data;
  } catch (error) {
    console.error('Error loading report data:', error);
    return { yearlist: [], hostellist: [] };
  }
};

export const getAllotmentReport = async (data: AllotmentReportSchema) => {
  try {
    const payload = {
      type: data.type,
      frmdate: data.frmdate,
      todate: data.todate,
      ASMAY_Id: data.ASMAY_Id,
      HLMH_Id: data.HLMH_Id,
    };
    const response = await api.create('default', URL_BASE + 'getreport', payload);
    return response.data;
  } catch (error) {
    console.error('Error generating report:', error);
    return { griddata: [] };
  }
};
