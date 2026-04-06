'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import { format } from 'date-fns';

/**
 * Get initial details for Classwise Daily Attendance Report
 */
export const getClassWiseDailyAttendanceInitialDetails = async (): Promise<ApiResponse<any>> => {
    return api.get('admission', '/ClassWiseDailyAttendance/Getdetails');
};

/**
 * Get classes for a specific academic year
 */
export const getClassWiseDailyAttendanceClasses = async (asmaY_Id: number): Promise<ApiResponse<any>> => {
    return api.post('admission', '/ClassWiseDailyAttendance/setfromdate', { ASMAY_Id: asmaY_Id });
};

/**
 * Get sections for a specific class and year
 */
export const getClassWiseDailyAttendanceSections = async (asmaY_Id: number, asmcL_Id: number): Promise<ApiResponse<any>> => {
    return api.post('admission', '/ClassWiseDailyAttendance/getsection', { ASMAY_Id: asmaY_Id, ASMCL_Id: asmcL_Id });
};

/**
 * Get report data for Classwise Daily Attendance Report
 */
export const getClassWiseDailyAttendanceReport = async (
    asmaY_Id: number,
    fromDate: Date,
    asmcL_Id: number,
    asmS_Id: number,
    searchParams?: ApiSearchparams
): Promise<ApiResponse<any>> => {
    const payload = {
        MI_Id: 2,
        ASMAY_Id: asmaY_Id,
        ASA_FromDate: format(fromDate, 'yyyy-MM-dd'),
        ASMCL_Id: asmcL_Id,
        ASMS_Id: asmS_Id
    };

    return api.post('admission', '/ClassWiseDailyAttendance/Getdetailsreport1', payload);
};

/**
 * Send SMS to absent students
 */
export const sendClassWiseDailyAttendanceSMS = async (
    asmaY_Id: number,
    fromDate: Date,
    absentList: any[]
): Promise<ApiResponse<any>> => {
    const payload = {
        ASMAY_Id: asmaY_Id,
        FromDate: format(fromDate, 'yyyy-MM-dd'),
        absentlist: absentList
    };

    return api.post('admission', '/ClassWiseDailyAttendance/absentsendsms', payload);
};
