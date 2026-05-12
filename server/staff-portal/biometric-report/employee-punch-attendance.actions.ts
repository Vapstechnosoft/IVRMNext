'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import {
    IEmployeeDetails,
    IEmployeePunchAttendanceFilter,
    IEmployeePunchAttendanceReportData,
} from '@/types/staff-portal/biometric-report/employee-punch-attendance.types';

const BASE_URL = '/EmployeePunchAttendence';

export const getEmployeePunchAttendanceInitialData = async (): Promise<
    ApiResponse<IEmployeeDetails[]>
> => {

    return await api.get<IEmployeeDetails[]>(
        'portal',
        `${BASE_URL}/getalldetails`
    );
};

export const getEmployeePunchAttendanceReport = async (
    payload: IEmployeePunchAttendanceFilter
): Promise<ApiResponse<IEmployeePunchAttendanceReportData>> => {
    return await api.post<IEmployeePunchAttendanceReportData>(
        'portal',
        `${BASE_URL}/getrpt/`,
        payload
    );
};
