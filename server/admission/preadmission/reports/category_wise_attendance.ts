'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import { format } from 'date-fns';

/**
 * Get initial details for Categorywise Attendance Report
 */
export const getCategoryWiseAttendanceInitialDetails = async (): Promise<ApiResponse<any>> => {
    return api.get('admission', '/CategoryWiseAttendance/getdetails/');
};

/**
 * Get report data for Categorywise Attendance Report
 */
export const getCategoryWiseAttendanceReport = async (
    asmaY_Id: number,
    fromdate: Date,
    categoryIds: number[],
    searchParams?: ApiSearchparams
): Promise<ApiResponse<any>> => {
    const payload = {
        ASMAY_Id: asmaY_Id,
        fromdate: format(fromdate, 'yyyy-MM-dd'),
        AMC_Id: 0,
        categorylistarray: categoryIds.map((id) => ({ AMC_Id: id }))
    };

    return api.post('admission', '/CategoryWiseAttendance/getAttendetails', payload);
};
