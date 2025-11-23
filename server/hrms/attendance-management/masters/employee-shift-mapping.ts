'use server';

import { createLocalCrud } from '@/lib/localdb';
import { api, type ApiResponse } from '@/lib/apiService';
import { getEmployeeOnload } from '@/server/hrms/hrmsConfig/employee';
import { getMasterHoliday } from './master-holiday';
import { getShiftSettingMaster } from './shift-setting-master';
import type { ApiSearchparams } from '@/types';
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

/**
 * Get shift names from API
 * POST /api/EmployeeShiftMappingFacade/Shiftname
 */
export async function getEmployeeShiftMappingShiftNames(fomsId: number = 0) {
    const url = '/api/EmployeeShiftMappingFacade/Shiftname';
    const requestBody = {
        MI_Id: 30,
        FOMS_Id: fomsId
    };
    
    try {
        const response = await api.post<any>('hrmsfrontoffice', url, requestBody);
        
        console.log('📥 [SERVER] Shift names API response:', {
            success: response?.success,
            hasData: !!response?.data,
            dataType: typeof response?.data
        });
        
        // Extract shift names from response
        // The API response structure may vary, so we handle multiple possible formats
        let shiftNames: Array<{ label: string; value: string; id: number }> = [];
        
        if (response?.data) {
            // If data is an array
            if (Array.isArray(response.data)) {
                shiftNames = response.data.map((item: any) => ({
                    label: item.fomS_ShiftName || item.ShiftName || item.shiftName || item.label || item.name || '',
                    value: item.fomS_ShiftName || item.ShiftName || item.shiftName || item.value || item.name || '',
                    id: item.fomS_Id || item.FOMS_Id || item.id || 0
                })).filter((item: { label: string; value: string }) => item.label && item.value);
            } 
            // If data is an object with a list/array property
            else if (typeof response.data === 'object' && response.data !== null) {
                const dataList = response.data.report_list || response.data.shifts || response.data.list || response.data.data || [];
                if (Array.isArray(dataList)) {
                    shiftNames = dataList.map((item: any) => ({
                        label: item.fomS_ShiftName || item.ShiftName || item.shiftName || item.label || item.name || '',
                        value: item.fomS_ShiftName || item.ShiftName || item.shiftName || item.value || item.name || '',
                        id: item.fomS_Id || item.FOMS_Id || item.id || 0
                    })).filter((item: { label: string; value: string }) => item.label && item.value);
                }
            }
        }
        
        return {
            success: response?.success ?? true,
            data: shiftNames,
            message: response?.message || 'Shift names retrieved successfully'
        };
    } catch (error: any) {
        console.error('❌ [SERVER] Failed to fetch shift names:', error);
        console.error('❌ [SERVER] Error details:', {
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            responseData: error?.response?.data,
            fullError: error
        });
        
        // Extract proper error message from API response
        let errorMessage = 'Failed to fetch shift names';
        
        if (error?.response?.data) {
            const apiError = error.response.data;
            
            if (typeof apiError === 'string') {
                errorMessage = apiError;
            } else if (typeof apiError === 'object' && apiError !== null) {
                if (apiError.message) {
                    errorMessage = apiError.message;
                } else if (apiError.error) {
                    errorMessage = apiError.error;
                } else if (apiError.msg) {
                    errorMessage = apiError.msg;
                } else if (apiError.errorMessage) {
                    errorMessage = apiError.errorMessage;
                } else if (apiError.errors && Array.isArray(apiError.errors)) {
                    errorMessage = apiError.errors.map((e: any) => e.message || e).join(', ');
                } else if (error.response.status) {
                    errorMessage = `Request failed with status ${error.response.status}`;
                }
            }
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        return {
            success: false,
            data: [],
            message: errorMessage
        };
    }
}

/**
 * Get dropdown data for employee shift mapping form
 * Fetches employee types, departments, designations, day types, and shifts from APIs
 */
export async function getEmployeeShiftMappingDropdowns() {
    try {
        // Fetch employee onload data for types, departments, designations
        const employeeOnload = await getEmployeeOnload(30, 0);
        const employeeData = (employeeOnload?.data || {}) as any;
        
        // Fetch master holiday data for day types (holidayType)
        const holidayData = await getMasterHoliday();
        const holidayDropdownData = holidayData?.data || {};
        
        // Fetch shift names from the dedicated API endpoint
        const shiftNamesResponse = await getEmployeeShiftMappingShiftNames(0);
        const shiftNames = shiftNamesResponse?.data || [];
        
        return {
            success: true,
            data: {
                // Employee types from employee onload
                employeeTypes: (employeeData.employeeTypedropdownlist || []).map((item: any) => ({
                    label: item.HRMET_EmployeeTypeName || item.label || item.name || '',
                    value: String(item.HRMET_Id || item.value || item.id || '')
                })).filter((item: { label: string; value: string }) => item.label && item.value),
                
                // Departments from employee onload
                departments: (employeeData.departmentdropdownlist || []).map((item: any) => ({
                    label: item.HRMD_DepartmentName || item.label || item.name || '',
                    value: String(item.HRMD_Id || item.value || item.id || '')
                })).filter((item: { label: string; value: string }) => item.label && item.value),
                
                // Designations from employee onload
                designations: (employeeData.designationdropdownlist || []).map((item: any) => ({
                    label: item.HRMDES_DesignationName || item.label || item.name || '',
                    value: String(item.HRMDES_Id || item.value || item.id || '')
                })).filter((item: { label: string; value: string }) => item.label && item.value),
                
                // Day types from master holiday (holidayType)
                dayTypes: (holidayDropdownData.holidayType || []).map((item: any) => ({
                    label: item.fohtwD_HolidayWDType || item.label || item.name || '',
                    value: String(item.fohwdT_Id || item.value || item.id || ''),
                    id: item.fohwdT_Id || item.id || 0
                })).filter((item: { label: string; value: string }) => item.label && item.value),
                
                // Shifts from dedicated shift names API
                shifts: shiftNames
            },
            message: 'Dropdown data retrieved successfully'
        };
    } catch (error: any) {
        console.error('❌ [SERVER] Failed to fetch employee shift mapping dropdowns:', error);
        console.error('❌ [SERVER] Error details:', {
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            responseData: error?.response?.data,
            fullError: error
        });
        
        // Extract proper error message from API response
        let errorMessage = 'Failed to fetch dropdown data';
        
        // Try to extract error message from API response
        if (error?.response?.data) {
            const apiError = error.response.data;
            
            // Check if response is a string
            if (typeof apiError === 'string') {
                errorMessage = apiError;
            } else if (typeof apiError === 'object' && apiError !== null) {
                // Try different possible error message fields
                if (apiError.message) {
                    errorMessage = apiError.message;
                } else if (apiError.error) {
                    errorMessage = apiError.error;
                } else if (apiError.msg) {
                    errorMessage = apiError.msg;
                } else if (apiError.errorMessage) {
                    errorMessage = apiError.errorMessage;
                } else if (apiError.errors && Array.isArray(apiError.errors)) {
                    errorMessage = apiError.errors.map((e: any) => e.message || e).join(', ');
                } else if (error.response.status) {
                    errorMessage = `Request failed with status ${error.response.status}`;
                }
            }
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        return {
            success: false,
            data: {
                employeeTypes: [],
                departments: [],
                designations: [],
                dayTypes: [],
                shifts: []
            },
            message: errorMessage
        };
    }
}

/**
 * Helper function to convert searchParams from URL (strings) to proper types
 */
function normalizeSearchParams(searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>): ApiSearchparams {
    if (!searchParams) return {};
    
    // Helper to get first value if array, or the value itself
    const getValue = (value: string | string[] | number | undefined, defaultValue: string | number): string | number => {
        if (value === undefined) return defaultValue;
        if (typeof value === 'number') return value;
        if (Array.isArray(value)) return value[0] || defaultValue;
        return value;
    };
    
    return {
        page: typeof getValue(searchParams.page, 1) === 'string' ? parseInt(getValue(searchParams.page, 1) as string, 10) || 1 : (getValue(searchParams.page, 1) as number) || 1,
        page_size: typeof getValue(searchParams.page_size, 10) === 'string' ? parseInt(getValue(searchParams.page_size, 10) as string, 10) || 10 : (getValue(searchParams.page_size, 10) as number) || 10,
        search_query: (getValue(searchParams.search_query, '') as string) || '',
        search_column: (getValue(searchParams.search_column, '') as string) || '',
        sort_column: (getValue(searchParams.sort_column, '') as string) || '',
        sort_direction: (getValue(searchParams.sort_direction, '') as string) || ''
    };
}

/**
 * Get employee shift mapping edit data from API
 * POST /api/EmployeeShiftMappingFacade/editdetails
 */
export async function getEmployeeShiftMappingEditData(foestId: number) {
    const url = '/api/EmployeeShiftMappingFacade/editdetails';
    const requestBody = {
        FOEST_Id: foestId
    };
    
    try {
        const response = await api.post<any>('hrmsfrontoffice', url, requestBody);
        
        console.log('📥 [SERVER] Edit data API response:', {
            success: response?.success,
            hasData: !!response?.data,
            dataType: typeof response?.data
        });
        
        // Extract the data structure - similar to getdata response
        const responseData = response?.data || {};
        const editData = responseData?.report_list?.[0] || responseData?.data || responseData || {};
        
        // Map API response to our interface (similar to getEmployeeShiftMapping mapping)
        const cleanTime = (timeStr: string | null | undefined): string => {
            if (!timeStr) return '';
            return String(timeStr).trim();
        };
        
        const formatDate = (dateStr: string | null | undefined): string => {
            if (!dateStr) return '';
            try {
                const date = new Date(dateStr);
                return date.toISOString().split('T')[0]; // YYYY-MM-DD format
            } catch {
                return String(dateStr);
            }
        };
        
        const mappedData: EmployeeShiftMapping = {
            id: editData.FOEST_Id || editData.id || foestId,
            employee: editData.EmployeeName || editData.employee || '',
            shiftName: editData.ShiftName || editData.shiftName || '',
            dayType: editData.DayType || editData.dayType || '',
            holidayType: editData.DayType || editData.dayType || '',
            applicableDate: formatDate(editData.Date || editData.date || editData.FOEST_Date),
            totalWork: cleanTime(editData.FDWHrMin || editData.FOEST_FDWHrMin),
            totalWorkingHours: cleanTime(editData.FDWHrMin || editData.FOEST_FDWHrMin),
            halfDayWork: cleanTime(editData.HDWHrMin || editData.FOEST_HDWHrMin),
            halfDayWorkingHours: cleanTime(editData.HDWHrMin || editData.FOEST_HDWHrMin),
            morningLogin: cleanTime(editData.IHalfLogin || editData.FOEST_IHalfLoginTime),
            shiftStartTime: cleanTime(editData.IHalfLogin || editData.FOEST_IHalfLoginTime),
            morningLogout: cleanTime(editData.IHalfLogout || editData.FOEST_IHalfLogoutTime),
            lunchStartTime: cleanTime(editData.IHalfLogout || editData.FOEST_IHalfLogoutTime),
            afternoonLogin: cleanTime(editData.IIHalfLogin || editData.FOEST_IIHalfLoginTime),
            lunchEndTime: cleanTime(editData.IIHalfLogin || editData.FOEST_IIHalfLoginTime),
            afternoonLogout: cleanTime(editData.IIHalfLogout || editData.FOEST_IIHalfLogoutTime),
            shiftEndTime: cleanTime(editData.IIHalfLogout || editData.FOEST_IIHalfLogoutTime),
            delayShift: cleanTime(editData.DelayPerShift || editData.FOEST_DelayPerShiftHrMin),
            delayPerShift: cleanTime(editData.DelayPerShift || editData.FOEST_DelayPerShiftHrMin),
            earlyShift: cleanTime(editData.EarlyPerShift || editData.FOEST_EarlyPerShiftHrMin),
            earlyPerShift: cleanTime(editData.EarlyPerShift || editData.FOEST_EarlyPerShiftHrMin),
            lunchHour: cleanTime(editData.LunchDuration || editData.FOEST_LunchHoursDuration),
            lunchHours: cleanTime(editData.LunchDuration || editData.FOEST_LunchHoursDuration),
            // Default values for fields not in API response
            employees: editData.EmployeeName ? [editData.EmployeeName] : (editData.EmployeeIds || []),
            type: editData.TypeIds || [],
            department: editData.DepartmentIds || [],
            designation: editData.DesignationIds || [],
            isActive: true,
            createdAt: editData.Date || editData.FOEST_Date ? new Date(editData.Date || editData.FOEST_Date) : new Date()
        };
        
        return {
            success: response?.success ?? true,
            message: response?.message || 'Employee shift mapping edit data retrieved successfully',
            data: mappedData
        };
    } catch (error: any) {
        console.error('❌ [SERVER] Failed to fetch employee shift mapping edit data:', error);
        console.error('❌ [SERVER] Error details:', {
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            responseData: error?.response?.data,
            fullError: error
        });
        
        // Extract proper error message from API response
        let errorMessage = 'Failed to fetch employee shift mapping edit data';
        
        if (error?.response?.data) {
            const apiError = error.response.data;
            
            if (typeof apiError === 'string') {
                errorMessage = apiError;
            } else if (typeof apiError === 'object' && apiError !== null) {
                if (apiError.message) {
                    errorMessage = apiError.message;
                } else if (apiError.error) {
                    errorMessage = apiError.error;
                } else if (apiError.msg) {
                    errorMessage = apiError.msg;
                } else if (apiError.errorMessage) {
                    errorMessage = apiError.errorMessage;
                } else if (apiError.errors && Array.isArray(apiError.errors)) {
                    errorMessage = apiError.errors.map((e: any) => e.message || e).join(', ');
                } else if (error.response.status) {
                    errorMessage = `Request failed with status ${error.response.status}`;
                }
            }
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        return {
            success: false,
            message: errorMessage,
            data: null
        };
    }
}

/**
 * Get employee shift mapping data from API
 * POST /api/EmployeeShiftMappingFacade/getdata
 */
export async function getEmployeeShiftMapping(searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>) {
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    
    const requestBody = {
        page: normalizedParams.page || 1,
        page_size: normalizedParams.page_size || 10,
        search_query: normalizedParams.search_query || '',
        search_column: normalizedParams.search_column || '',
        sort_column: normalizedParams.sort_column || '',
        sort_direction: normalizedParams.sort_direction || '',
        is_export: false,
        MIID: 30,
        LoginUserId: 0,
        UserRole: ''
    };

    const url = '/api/EmployeeShiftMappingFacade/getdata';
    
    try {
        const response = await api.post<any>('hrmsfrontoffice', url, requestBody);
        
        // API response structure:
        // {
        //   "success": true,
        //   "message": "OK",
        //   "data": {
        //     "report_list": [
        //       {
        //         "FOEST_Id": 221,
        //         "EmployeeName": "LAKSHMI DEVI  T",
        //         "ShiftName": "Employee Shift",
        //         "DayType": "WEEK DAY",
        //         "Date": "2024-06-25T00:00:00",
        //         "FDWHrMin": "7:30 ",
        //         "HDWHrMin": "4:00  ",
        //         "IHalfLogin": "9:30  ",
        //         "IHalfLogout": "13:00  ",
        //         "IIHalfLogin": "13:30  ",
        //         "IIHalfLogout": "17:00 ",
        //         "DelayPerShift": "0:00  ",
        //         "EarlyPerShift": "0:00  ",
        //         "LunchDuration": "0:30  "
        //       }
        //     ]
        //   },
        //   "total": 205,
        //   "page": 1,
        //   "page_size": 1
        // }
        
        // Extract the data structure
        const responseData = response?.data || {};
        const reportList = responseData?.report_list || [];
        
        // Map API response to our interface
        const mappedData: EmployeeShiftMapping[] = reportList.map((item: any) => {
            // Helper to trim and clean time strings
            const cleanTime = (timeStr: string | null | undefined): string => {
                if (!timeStr) return '';
                return String(timeStr).trim();
            };
            
            // Helper to format date
            const formatDate = (dateStr: string | null | undefined): string => {
                if (!dateStr) return '';
                try {
                    const date = new Date(dateStr);
                    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
                } catch {
                    return String(dateStr);
                }
            };
            
            return {
                id: item.FOEST_Id || item.id || 0,
                employee: item.EmployeeName || item.employee || '',
                shiftName: item.ShiftName || item.shiftName || '',
                dayType: item.DayType || item.dayType || '',
                holidayType: item.DayType || item.dayType || '',
                applicableDate: formatDate(item.Date || item.date),
                totalWork: cleanTime(item.FDWHrMin || item.FDWHrMin),
                totalWorkingHours: cleanTime(item.FDWHrMin || item.FDWHrMin),
                halfDayWork: cleanTime(item.HDWHrMin || item.HDWHrMin),
                halfDayWorkingHours: cleanTime(item.HDWHrMin || item.HDWHrMin),
                morningLogin: cleanTime(item.IHalfLogin || item.IHalfLogin),
                shiftStartTime: cleanTime(item.IHalfLogin || item.IHalfLogin),
                morningLogout: cleanTime(item.IHalfLogout || item.IHalfLogout),
                lunchStartTime: cleanTime(item.IHalfLogout || item.IHalfLogout),
                afternoonLogin: cleanTime(item.IIHalfLogin || item.IIHalfLogin),
                lunchEndTime: cleanTime(item.IIHalfLogin || item.IIHalfLogin),
                afternoonLogout: cleanTime(item.IIHalfLogout || item.IIHalfLogout),
                shiftEndTime: cleanTime(item.IIHalfLogout || item.IIHalfLogout),
                delayShift: cleanTime(item.DelayPerShift || item.DelayPerShift),
                delayPerShift: cleanTime(item.DelayPerShift || item.DelayPerShift),
                earlyShift: cleanTime(item.EarlyPerShift || item.EarlyPerShift),
                earlyPerShift: cleanTime(item.EarlyPerShift || item.EarlyPerShift),
                lunchHour: cleanTime(item.LunchDuration || item.LunchDuration),
                lunchHours: cleanTime(item.LunchDuration || item.LunchDuration),
                // Default values for fields not in API response
                employees: item.EmployeeName ? [item.EmployeeName] : [],
                type: [],
                department: [],
                designation: [],
                isActive: true,
                createdAt: item.Date ? new Date(item.Date) : new Date()
            };
        });
        
        // Extract pagination info from response
        const responseTotal = typeof response?.total === 'number' ? response.total : mappedData.length;
        const responsePage = typeof response?.page === 'number' ? response.page : (normalizedParams.page || 1);
        const responsePageSize = typeof response?.page_size === 'number' 
            ? response.page_size 
            : (normalizedParams.page_size || 10);
        
        return {
            success: response?.success ?? true,
            message: response?.message || 'Employee shift mappings retrieved successfully',
            data: mappedData,
            total: responseTotal,
            page: responsePage,
            page_size: responsePageSize
        };
    } catch (error: any) {
        console.error('❌ [SERVER] Failed to fetch employee shift mapping data:', error);
        console.error('❌ [SERVER] Error details:', {
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            responseData: error?.response?.data,
            fullError: error
        });
        
        // Extract proper error message from API response
        let errorMessage = 'Failed to fetch employee shift mapping data';
        
        // Try to extract error message from API response
        if (error?.response?.data) {
            const apiError = error.response.data;
            
            // Check if response is a string
            if (typeof apiError === 'string') {
                errorMessage = apiError;
            } else if (typeof apiError === 'object' && apiError !== null) {
                // Try different possible error message fields
                if (apiError.message) {
                    errorMessage = apiError.message;
                } else if (apiError.error) {
                    errorMessage = apiError.error;
                } else if (apiError.msg) {
                    errorMessage = apiError.msg;
                } else if (apiError.errorMessage) {
                    errorMessage = apiError.errorMessage;
                } else if (apiError.errors && Array.isArray(apiError.errors)) {
                    errorMessage = apiError.errors.map((e: any) => e.message || e).join(', ');
                } else if (error.response.status) {
                    errorMessage = `Request failed with status ${error.response.status}`;
                }
            }
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        // Return error response in expected format
        return {
            success: false,
            message: errorMessage,
            data: [],
            total: 0,
            page: normalizedParams.page || 1,
            page_size: normalizedParams.page_size || 10
        };
    }
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
    
    // Build request body - using exact API field names (uppercase)
    const requestBody: EmployeeShiftMappingSaveRequest = {
        FOEST_Id: data.id || 0, // 0 for new, or existing ID for update
        MI_Id: 30,
        FOMS_Id: data.fomS_Id, // Shift Master ID
        FOEST_Date: applicableDateISO,
        FOEST_FDWHrMin: data.totalWorkingHours || '', // Full Day Working Hours Minutes
        FOEST_HDWHrMin: data.halfDayWorkingHours || '', // Half Day Working Hours Minutes
        FOEST_IHalfLoginTime: data.shiftStartTime || '', // First Half Login Time
        FOEST_IHalfLogoutTime: data.lunchStartTime || '', // First Half Logout Time
        FOEST_IIHalfLoginTime: data.lunchEndTime || '', // Second Half Login Time
        FOEST_IIHalfLogoutTime: data.shiftEndTime || '', // Second Half Logout Time
        FOEST_DelayPerShiftHrMin: data.delayPerShift || '', // Delay Per Shift Hours Minutes
        FOEST_EarlyPerShiftHrMin: data.earlyPerShift || '', // Early Per Shift Hours Minutes
        FOEST_LunchHoursDuration: data.lunchHours || '', // Lunch Hours Duration
        FOEST_BlockAttendance: '', // Block Attendance (optional)
        FOEST_FixTimings: '', // Fix Timings (optional)
        EmployeeIds: data.employeeIds, // Array of employee IDs
        DayTypeIds: data.dayTypeIds, // Array of day type IDs
        UserId: 0
    };
    
    console.log('🔄 [SERVER] Saving employee shift mapping via API');
    console.log('📤 [SERVER] Request URL:', url);
    console.log('📤 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('📤 [SERVER] Request Body Summary:', {
        FOEST_Id: requestBody.FOEST_Id,
        MI_Id: requestBody.MI_Id,
        FOMS_Id: requestBody.FOMS_Id,
        FOEST_Date: requestBody.FOEST_Date,
        EmployeeIdsCount: requestBody.EmployeeIds.length,
        EmployeeIds: requestBody.EmployeeIds,
        DayTypeIdsCount: requestBody.DayTypeIds.length,
        DayTypeIds: requestBody.DayTypeIds
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
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            responseData: error?.response?.data,
            fullError: error
        });
        
        // Extract proper error message from API response
        let errorMessage = 'Failed to save employee shift mapping';
        
        // Try to extract error message from API response
        if (error?.response?.data) {
            const apiError = error.response.data;
            
            // Check if response is a string
            if (typeof apiError === 'string') {
                errorMessage = apiError;
            } else if (typeof apiError === 'object' && apiError !== null) {
                // Try different possible error message fields
                if (apiError.message) {
                    errorMessage = apiError.message;
                } else if (apiError.error) {
                    errorMessage = apiError.error;
                } else if (apiError.msg) {
                    errorMessage = apiError.msg;
                } else if (apiError.errorMessage) {
                    errorMessage = apiError.errorMessage;
                } else if (apiError.errors && Array.isArray(apiError.errors)) {
                    errorMessage = apiError.errors.map((e: any) => e.message || e).join(', ');
                } else if (error.response.status) {
                    errorMessage = `Request failed with status ${error.response.status}`;
                }
            }
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        return {
            success: false,
            message: errorMessage,
            data: null
        };
    }
}

/**
 * Get employees based on filters
 * POST /api/EmployeeShiftMappingFacade/get_employee
 */
export async function getEmployeeShiftMappingEmployees(params: {
    groupTypeIds?: number[];
    departmentIds?: number[];
    designationIds?: number[];
}) {
    const url = '/api/EmployeeShiftMappingFacade/get_employee';
    const requestBody = {
        MI_Id: 30,
        GroupTypeIds: params.groupTypeIds || [0],
        DepartmentIds: params.departmentIds || [0],
        DesignationIds: params.designationIds || [0]
    };
    
    try {
        const response = await api.post<any>('hrmsfrontoffice', url, requestBody);
        
        console.log('📥 [SERVER] Get employees API response:', {
            success: response?.success,
            hasData: !!response?.data,
            dataType: typeof response?.data
        });
        
        // Extract employees from response
        let employees: any[] = [];
        
        if (response?.data) {
            // If data is an array
            if (Array.isArray(response.data)) {
                employees = response.data;
            } 
            // If data is an object with a list/array property
            else if (typeof response.data === 'object' && response.data !== null) {
                employees = response.data.report_list || response.data.employees || response.data.list || response.data.data || [];
            }
        }
        
        return {
            success: response?.success ?? true,
            data: employees,
            message: response?.message || 'Employees retrieved successfully'
        };
    } catch (error: any) {
        console.error('❌ [SERVER] Failed to fetch employees:', error);
        console.error('❌ [SERVER] Error details:', {
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            responseData: error?.response?.data,
            fullError: error
        });
        
        // Extract proper error message from API response
        let errorMessage = 'Failed to fetch employees';
        
        if (error?.response?.data) {
            const apiError = error.response.data;
            
            if (typeof apiError === 'string') {
                errorMessage = apiError;
            } else if (typeof apiError === 'object' && apiError !== null) {
                if (apiError.message) {
                    errorMessage = apiError.message;
                } else if (apiError.error) {
                    errorMessage = apiError.error;
                } else if (apiError.msg) {
                    errorMessage = apiError.msg;
                } else if (apiError.errorMessage) {
                    errorMessage = apiError.errorMessage;
                } else if (apiError.errors && Array.isArray(apiError.errors)) {
                    errorMessage = apiError.errors.map((e: any) => e.message || e).join(', ');
                } else if (error.response.status) {
                    errorMessage = `Request failed with status ${error.response.status}`;
                }
            }
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        return {
            success: false,
            data: [],
            message: errorMessage
        };
    }
}

export async function deleteEmployeeShiftMapping(id: number) {
    const url = '/api/EmployeeShiftMappingFacade/deletedetails';
    const requestBody = {
        FOEST_Id: id
    };
    
    try {
        const response = await api.post<any>('hrmsfrontoffice', url, requestBody);
        
        console.log('📥 [SERVER] Delete API response:', {
            success: response?.success,
            message: response?.message
        });
        
        // Check if deletion was successful
        if (response?.success) {
            return {
                success: true,
                message: response?.message || 'Employee shift mapping deleted successfully'
            };
        }
        
        // If API returned success: false, extract error message
        let errorMessage = 'Failed to delete employee shift mapping';
        if (response?.message) {
            errorMessage = response.message;
        } else if (response?.data && typeof response.data === 'string') {
            errorMessage = response.data;
        }
        
        return {
            success: false,
            message: errorMessage
        };
    } catch (error: any) {
        console.error('❌ [SERVER] Failed to delete employee shift mapping:', error);
        console.error('❌ [SERVER] Error details:', {
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            responseData: error?.response?.data,
            fullError: error
        });
        
        // Extract proper error message from API response
        let errorMessage = 'Failed to delete employee shift mapping';
        
        if (error?.response?.data) {
            const apiError = error.response.data;
            
            if (typeof apiError === 'string') {
                errorMessage = apiError;
            } else if (typeof apiError === 'object' && apiError !== null) {
                if (apiError.message) {
                    errorMessage = apiError.message;
                } else if (apiError.error) {
                    errorMessage = apiError.error;
                } else if (apiError.msg) {
                    errorMessage = apiError.msg;
                } else if (apiError.errorMessage) {
                    errorMessage = apiError.errorMessage;
                } else if (apiError.errors && Array.isArray(apiError.errors)) {
                    errorMessage = apiError.errors.map((e: any) => e.message || e).join(', ');
                } else if (error.response.status) {
                    errorMessage = `Request failed with status ${error.response.status}`;
                }
            }
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        return {
            success: false,
            message: errorMessage
        };
    }
}

