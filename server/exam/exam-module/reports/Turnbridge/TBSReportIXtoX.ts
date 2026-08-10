'use server';

import { getTBSReportSchool } from './TBSReportSchool';
import { type ApiResponse } from '@/lib/apiService';

/**
 * Server Action for Turnbridge IX to X Report Card
 * Reuses backend API `/JSHSExamReports_/promotion_report_TBSchool` via getTBSReportSchool
 */
export async function getTBSReportIXtoX(data: any): Promise<ApiResponse<any>> {
    return getTBSReportSchool(data);
}
