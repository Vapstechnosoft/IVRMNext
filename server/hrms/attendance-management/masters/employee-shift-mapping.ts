'use server';

import { createLocalCrud } from '@/lib/localdb';
import { api, type ApiResponse } from '@/lib/apiService';
import type {
    EmployeeShiftMappingSaveRequest,
    EmployeeShiftMappingSaveResponse
} from '@/types/hrms/attendance-management/employee-shift-mapping';

export interface EmployeeShiftMapping {
    id: number;
    employeeTypes?: string[];
    dayTypes?: string[];
    allEmployees?: boolean;
    searchEmployee?: string;
    type: string | string[];
    department: string | string[];
    designation: string | string[];
    dayType: string | string[];
    shiftName: string;
    applicableDate: string;
    employees: string[];
    employee: string;
    holidayType: string;
    totalWork: string;
    halfDayWork: string;
    morningLogin: string;
    morningLogout: string;
    afternoonLogin: string;
    afternoonLogout: string;
    delayShift: string;
    earlyShift: string;
    lunchHour: string;
    isActive: boolean;
    shiftStartTime?: string;
    lunchStartTime?: string;
    shiftEndTime?: string;
    lunchEndTime?: string;
    totalWorkingHours?: string;
    delayPerShift?: string;
    halfDayWorkingHours?: string;
    earlyPerShift?: string;
    lunchHours?: string;
    createdAt: Date;
}

const store = createLocalCrud<EmployeeShiftMapping>('master:employeeShiftMapping');

export async function getEmployeeShiftMapping() {
    return {
        success: true,
        data: store.list(),
        message: 'Employee shift mappings retrieved successfully'
    };
}

export async function addOrUpdateEmployeeShiftMapping(data: {
    id?: number;
    type: string | string[];
    department: string | string[];
    designation: string | string[];
    dayType: string | string[];
    shiftName: string;
    applicableDate: string;
    employees: string[];
    employee: string;
    holidayType: string;
    totalWork: string;
    halfDayWork: string;
    morningLogin: string;
    morningLogout: string;
    afternoonLogin: string;
    afternoonLogout: string;
    delayShift: string;
    earlyShift: string;
    lunchHour: string;
    isActive: boolean;
    shiftStartTime?: string;
    lunchStartTime?: string;
    shiftEndTime?: string;
    lunchEndTime?: string;
    totalWorkingHours?: string;
    delayPerShift?: string;
    halfDayWorkingHours?: string;
    earlyPerShift?: string;
    lunchHours?: string;
    // Additional fields for API mapping
    fomS_Id?: number; // Shift Master ID (required by API)
    employeeIds?: number[]; // Employee IDs (required by API)
    dayTypeIds?: number[]; // Day Type IDs (required by API)
}) {
    try {
        // If we have the required API fields, use the API endpoint
        if (data.fomS_Id !== undefined && data.employeeIds && data.employeeIds.length > 0 && data.dayTypeIds && data.dayTypeIds.length > 0) {
            return await saveEmployeeShiftMappingViaAPI({
                id: data.id,
                shiftName: data.shiftName,
                applicableDate: data.applicableDate,
                employees: data.employees,
                dayType: data.dayType,
                fomS_Id: data.fomS_Id,
                employeeIds: data.employeeIds,
                dayTypeIds: data.dayTypeIds,
                shiftStartTime: data.shiftStartTime,
                lunchStartTime: data.lunchStartTime,
                shiftEndTime: data.shiftEndTime,
                lunchEndTime: data.lunchEndTime,
                totalWorkingHours: data.totalWorkingHours,
                delayPerShift: data.delayPerShift,
                halfDayWorkingHours: data.halfDayWorkingHours,
                earlyPerShift: data.earlyPerShift,
                lunchHours: data.lunchHours
            });
        }
        
        // Otherwise, fall back to local storage (for backward compatibility during development)
        if (data.id) {
            const updated = store.update(data.id, data);
            if (updated) {
                return {
                    success: true,
                    data: updated,
                    message: 'Employee shift mapping updated successfully'
                };
            }
            return {
                success: false,
                message: 'Employee shift mapping not found'
            };
        } else {
            const created = store.create(data as Omit<EmployeeShiftMapping, 'id' | 'createdAt'>);
            return {
                success: true,
                data: created,
                message: 'Employee shift mapping created successfully'
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to save employee shift mapping'
        };
    }
}

/**
 * Save employee shift mapping via API
 * POST /api/EmployeeShiftMappingFacade/savedetail
 */
async function saveEmployeeShiftMappingViaAPI(data: {
    id?: number;
    shiftName: string;
    applicableDate: string;
    employees: string[];
    dayType: string | string[];
    fomS_Id: number;
    employeeIds: number[];
    dayTypeIds: number[];
    shiftStartTime?: string;
    lunchStartTime?: string;
    shiftEndTime?: string;
    lunchEndTime?: string;
    totalWorkingHours?: string;
    delayPerShift?: string;
    halfDayWorkingHours?: string;
    earlyPerShift?: string;
    lunchHours?: string;
}): Promise<ApiResponse<any>> {
    const url = '/api/EmployeeShiftMappingFacade/savedetail';
    
    // Convert applicableDate to ISO format
    const applicableDateISO = data.applicableDate ? new Date(data.applicableDate).toISOString() : new Date().toISOString();
    
    // Build request body
    const requestBody: EmployeeShiftMappingSaveRequest = {
        foesT_Id: data.id || 0, // 0 for new, or existing ID for update
        mI_Id: 30,
        fomS_Id: data.fomS_Id, // Shift Master ID
        foesT_Date: applicableDateISO,
        foesT_FDWHrMin: data.totalWorkingHours || '', // Full Day Working Hours Minutes
        foesT_HDWHrMin: data.halfDayWorkingHours || '', // Half Day Working Hours Minutes
        foesT_IHalfLoginTime: data.shiftStartTime || '', // First Half Login Time
        foesT_IHalfLogoutTime: data.lunchStartTime || '', // First Half Logout Time
        foesT_IIHalfLoginTime: data.lunchEndTime || '', // Second Half Login Time
        foesT_IIHalfLogoutTime: data.shiftEndTime || '', // Second Half Logout Time
        foesT_DelayPerShiftHrMin: data.delayPerShift || '', // Delay Per Shift Hours Minutes
        foesT_EarlyPerShiftHrMin: data.earlyPerShift || '', // Early Per Shift Hours Minutes
        foesT_LunchHoursDuration: data.lunchHours || '', // Lunch Hours Duration
        foesT_BlockAttendance: '', // Block Attendance (optional)
        foesT_FixTimings: '', // Fix Timings (optional)
        employeeIds: data.employeeIds, // Array of employee IDs
        dayTypeIds: data.dayTypeIds, // Array of day type IDs
        userId: 0
    };
    
    console.log('🔄 [SERVER] Saving employee shift mapping via API');
    console.log('📤 [SERVER] Request URL:', url);
    console.log('📤 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('📤 [SERVER] Request Body Summary:', {
        foesT_Id: requestBody.foesT_Id,
        mI_Id: requestBody.mI_Id,
        fomS_Id: requestBody.fomS_Id,
        foesT_Date: requestBody.foesT_Date,
        employeeIdsCount: requestBody.employeeIds.length,
        employeeIds: requestBody.employeeIds,
        dayTypeIdsCount: requestBody.dayTypeIds.length,
        dayTypeIds: requestBody.dayTypeIds
    });
    
    try {
        const response = await api.post<EmployeeShiftMappingSaveResponse>('hrmsfrontoffice', url, requestBody);
        
        console.log('📥 [SERVER] Raw API Response:', JSON.stringify(response, null, 2));
        console.log('📥 [SERVER] Response Analysis:', {
            hasResponse: !!response,
            success: response?.success,
            message: response?.message,
            hasData: !!response?.data,
            responseType: typeof response
        });
        
        // The API returns: { success: boolean, message: string, data: any | null, total: number | null, page: number | null, page_size: number | null }
        if (response && typeof response === 'object' && 'success' in response) {
            const result = {
                success: response.success,
                message: response.message || (response.success ? 'Employee shift mapping saved successfully' : 'Failed to save employee shift mapping'),
                data: response.data || null
            };
            console.log('✅ [SERVER] Returning result:', result);
            return result;
        }
        
        console.log('❌ [SERVER] Unexpected response format');
        return {
            success: false,
            message: 'Unexpected response format from API',
            data: null
        };
    } catch (error: any) {
        console.error('❌ [SERVER] Error saving employee shift mapping via API:', error);
        console.error('❌ [SERVER] Error details:', {
            message: error.message,
            status: error.status,
            response: error.response
        });
        return {
            success: false,
            message: error.message || 'Failed to save employee shift mapping',
            data: null
        };
    }
}

export async function deleteEmployeeShiftMapping(id: number) {
    try {
        const removed = store.remove(id);
        if (removed) {
            return {
                success: true,
                message: 'Employee shift mapping deleted successfully'
            };
        }
        return {
            success: false,
            message: 'Employee shift mapping not found'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to delete employee shift mapping'
        };
    }
}

