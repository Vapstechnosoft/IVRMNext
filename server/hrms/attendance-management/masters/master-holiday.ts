'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    MasterHolidayGetDataResponse,
    MasterHolidayGetDataResponseData,
    MasterHolidaySaveRequest
} from '@/types/hrms/attendance-management/master-holiday';

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
 * Get master holiday data from API
 * Following the preadmission module pattern - returns API response directly
 */
export async function getMasterHoliday(searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>) {
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

    console.log('📤 [SERVER] getMasterHoliday request body:', JSON.stringify(requestBody, null, 2));

    const url = '/api/MasterHolidayFacade/getdata';
    
    try {
        const response = await api.post<MasterHolidayGetDataResponseData>('hrmsfrontoffice', url, requestBody);
        
        console.log('📥 [SERVER] getMasterHoliday raw response:', {
            hasResponse: !!response,
            responseKeys: response ? Object.keys(response) : [],
            hasData: !!response?.data,
            dataType: typeof response?.data,
            dataKeys: response?.data ? Object.keys(response.data) : [],
            dataValue: response?.data,
            fullResponse: JSON.stringify(response, null, 2)
        });
        
        // API response structure (from Swagger):
        // {
        //   "success": true,
        //   "message": "success",
        //   "data": {
        //     "success": true,
        //     "message": "OK",
        //     "data": {
        //       "yeardropdown": [...],
        //       "departmentType": [...],
        //       "holidayType": [...],
        //       "dayslist": [...],
        //       "report_list": [...]
        //     },
        //     "total": 1041,
        //     "page": 1,
        //     "page_size": 10
        //   },
        //   "total": null,
        //   "page": null,
        //   "page_size": null
        // }
        
        // Extract the nested data structure
        const innerResponse = response?.data as any;
        const actualData: MasterHolidayGetDataResponseData = innerResponse?.data || {
            yeardropdown: [],
            departmentType: [],
            holidayType: [],
            dayslist: [],
            report_list: []
        };
        
        // Extract pagination info from inner response (response.data.total, response.data.page, response.data.page_size)
        // Fallback to outer response or defaults
        const responseTotal = typeof innerResponse?.total === 'number' 
            ? innerResponse.total 
            : (typeof response?.total === 'number' ? response.total : (actualData?.report_list?.length || 0));
        const responsePage = typeof innerResponse?.page === 'number' 
            ? innerResponse.page 
            : (typeof response?.page === 'number' ? response.page : (normalizedParams.page || 1));
        const responsePageSize = typeof innerResponse?.page_size === 'number' 
            ? innerResponse.page_size 
            : (typeof innerResponse?.page_Size === 'number' 
                ? innerResponse.page_Size 
                : (typeof response?.page_size === 'number' 
                    ? response.page_size 
                    : (typeof response?.page_Size === 'number' 
                        ? response.page_Size 
                        : (normalizedParams.page_size || 10))));
        
        const responseData: MasterHolidayGetDataResponse = {
            success: response?.success ?? true,
            message: response?.message || 'Master holiday data retrieved successfully',
            data: actualData,
            total: responseTotal,
            page: responsePage,
            page_size: responsePageSize
        };
        
        console.log('📥 [SERVER] getMasterHoliday transformed response:', {
            success: responseData.success,
            hasData: !!responseData.data,
            reportListLength: responseData.data?.report_list?.length || 0,
            total: responseData.total,
            page: responseData.page,
            page_size: responseData.page_size,
            hasYearDropdown: !!responseData.data?.yeardropdown,
            yearDropdownLength: responseData.data?.yeardropdown?.length || 0,
            hasDepartmentType: !!responseData.data?.departmentType,
            departmentTypeLength: responseData.data?.departmentType?.length || 0,
            hasHolidayType: !!responseData.data?.holidayType,
            holidayTypeLength: responseData.data?.holidayType?.length || 0,
            hasDaysList: !!responseData.data?.dayslist,
            daysListLength: responseData.data?.dayslist?.length || 0
        });
        
        return responseData;
    } catch (error: any) {
        console.error('❌ [SERVER] getMasterHoliday API error:', error);
        console.error('❌ [SERVER] Error details:', {
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            responseData: error?.response?.data,
            fullError: error
        });
        
        // Extract proper error message from API response
        let errorMessage = 'Failed to fetch master holiday data';
        
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
        
        // Return error response in expected format
        return {
            success: false,
            message: errorMessage,
            data: {
                yeardropdown: [],
                departmentType: [],
                holidayType: [],
                dayslist: [],
                report_list: []
            },
            total: 0,
            page: normalizedParams.page || 1,
            page_size: normalizedParams.page_size || 10
        };
    }
}

/**
 * Save master holiday data to API
 * Following the preadmission module pattern - returns API response directly
 */
export async function addOrUpdateMasterHoliday(
    data: {
        id?: number;
        calendarYear: string;
        department: string;
        holidayType: string;
        name: string;
        selectedDays: string[];
        fromDate: string;
        toDate: string;
        isActive: boolean;
    },
    dropdownData?: MasterHolidayGetDataResponseData
) {
    console.log('🔵 [SERVER] addOrUpdateMasterHoliday called');
    console.log('📥 [SERVER] Received data:', JSON.stringify(data, null, 2));
    console.log('📥 [SERVER] Dropdown data available:', {
        hasYear: !!dropdownData?.yeardropdown,
        hasDept: !!dropdownData?.departmentType,
        hasHolidayType: !!dropdownData?.holidayType,
        hasDaysList: !!dropdownData?.dayslist
    });

    // Find IDs from dropdown data
    // API field names are uppercase: HRMLY_LeaveYear, HRMD_DepartmentName, FOHTWD_HolidayWDType
    const yearItem = dropdownData?.yeardropdown?.find((y: any) => 
        (y.HRMLY_LeaveYear || y.hrmlY_LeaveYear) === data.calendarYear
    );
    const departmentItem = data.department 
        ? dropdownData?.departmentType?.find((d: any) => 
            (d.HRMD_DepartmentName || d.hrmD_DepartmentName) === data.department
        )
        : null;
    const holidayTypeItem = dropdownData?.holidayType?.find((h: any) => 
        (h.FOHTWD_HolidayWDType || h.fohtwD_HolidayWDType) === data.holidayType
    );

    console.log('🔍 [SERVER] Found IDs:', {
        yearId: (yearItem as any)?.HRMLY_Id || yearItem?.hrmlY_Id || 'NOT FOUND',
        departmentId: (departmentItem as any)?.HRMD_Id || departmentItem?.hrmD_Id || (data.department ? 'NOT FOUND' : 'NOT PROVIDED'),
        holidayTypeId: (holidayTypeItem as any)?.FOHWDT_Id || holidayTypeItem?.fohwdT_Id || 'NOT FOUND',
        yearSearch: data.calendarYear,
        deptSearch: data.department || 'NOT PROVIDED',
        holidayTypeSearch: data.holidayType
    });

    // Build selectedDaysDate array
    const selectedDaysDate: { date: string; dayname: string }[] = [];
    
    // Get day names from dayslist
    // API field names are uppercase: FOMD_DayCode, FOMD_DayName
    const daysMap = new Map(
        dropdownData?.dayslist?.map((day: any) => [
            day.FOMD_DayCode || day.fomD_DayCode || '',
            day.FOMD_DayName || day.fomD_DayName || ''
        ]) || []
    );
    
    if (data.selectedDays && data.selectedDays.length > 0) {
        if (data.holidayType === 'WEEK DAY') {
            // For WEEK DAY type: use the calendar year's date range to generate all occurrences
            // Get the year's date range from dropdown data
            const yearItem = dropdownData?.yeardropdown?.find((y) => y.hrmlY_LeaveYear === data.calendarYear);
            
            // API field names are uppercase: HRMLY_FromDate, HRMLY_ToDate
            const fromDate = (yearItem as any)?.HRMLY_FromDate || yearItem?.hrmlY_FromDate;
            const toDate = (yearItem as any)?.HRMLY_ToDate || yearItem?.hrmlY_ToDate;
            if (yearItem && fromDate && toDate) {
                const fromDateObj = new Date(fromDate);
                const toDateObj = new Date(toDate);
                const currentDate = new Date(fromDateObj);
                
                console.log('📅 [SERVER] Building selectedDaysDate for WEEK DAY using year range:', {
                    year: data.calendarYear,
                    fromDate: fromDateObj.toISOString(),
                    toDate: toDateObj.toISOString(),
                    selectedDays: data.selectedDays
                });
                
                // Generate all occurrences of selected days within the year range
                while (currentDate <= toDateObj) {
                    const dayOfWeek = currentDate.getDay();
                    const dayCodes = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                    const currentDayCode = dayCodes[dayOfWeek];
                    
                    if (data.selectedDays.includes(currentDayCode)) {
                        const dayName = daysMap.get(currentDayCode) || currentDayCode;
                        // Format date as YYYY-MM-DD (date only, no time) - API might expect this format
                        const dateStr = currentDate.toISOString().split('T')[0];
                        selectedDaysDate.push({
                            date: dateStr,
                            dayname: dayName
                        });
                    }
                    
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            } else {
                // Fallback: just send day names with empty dates if year range not available
                console.warn('⚠️ [SERVER] Year date range not found, using empty dates for WEEK DAY');
                for (const dayCode of data.selectedDays) {
                    const dayName = daysMap.get(dayCode) || dayCode;
                    selectedDaysDate.push({
                        date: '', // Fallback: empty date
                        dayname: dayName
                    });
                }
            }
            
            console.log('📅 [SERVER] Built selectedDaysDate for WEEK DAY:', {
                count: selectedDaysDate.length,
                sample: selectedDaysDate.slice(0, 5) // Show first 5 as sample
            });
        } else if (data.fromDate && data.fromDate.trim() !== '' && data.toDate && data.toDate.trim() !== '') {
            // For PUBLIC HOLIDAY and WEEK END: generate dates between fromDate and toDate
            const fromDateObj = new Date(data.fromDate);
            const toDateObj = new Date(data.toDate);
            const currentDate = new Date(fromDateObj);

            console.log('📅 [SERVER] Building selectedDaysDate with date range:', {
                fromDate: fromDateObj.toISOString(),
                toDate: toDateObj.toISOString(),
                selectedDays: data.selectedDays
            });

            while (currentDate <= toDateObj) {
                const dayOfWeek = currentDate.getDay();
                const dayCodes = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                const currentDayCode = dayCodes[dayOfWeek];

                if (data.selectedDays.includes(currentDayCode)) {
                    const dayName = daysMap.get(currentDayCode) || currentDayCode;
                    // Format date as YYYY-MM-DD (date only, no time) - API might expect this format
                    const dateStr = currentDate.toISOString().split('T')[0];
                    selectedDaysDate.push({
                        date: dateStr,
                        dayname: dayName
                    });
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
    }
    
    console.log('📅 [SERVER] Selected days date array:', {
        count: selectedDaysDate.length,
        items: selectedDaysDate
    });

    // Handle dates - only convert if they exist and are not empty
    // Send null instead of empty string for optional dates (API validation requirement)
    const startDate = data.fromDate && data.fromDate.trim() !== '' 
        ? new Date(data.fromDate).toISOString() 
        : null;
    const endDate = data.toDate && data.toDate.trim() !== '' 
        ? new Date(data.toDate).toISOString() 
        : null;

    console.log('📅 [SERVER] Date conversion:', {
        fromDateInput: data.fromDate,
        toDateInput: data.toDate,
        startDateISO: startDate,
        endDateISO: endDate
    });

    // For new records, id should be 0 or undefined
    // For updates, id should be the existing record ID
    const isEdit = data.id && data.id > 0;
    
    const requestBody: MasterHolidaySaveRequest & { fomhwD_Id?: number; fomhwdD_Id?: number } = {
        mI_Id: 30,
        hrmlY_Id: (yearItem as any)?.HRMLY_Id || yearItem?.hrmlY_Id || 0,
        fohwdT_Id: (holidayTypeItem as any)?.FOHWDT_Id || holidayTypeItem?.fohwdT_Id || 0,
        hrmD_Id: (departmentItem as any)?.HRMD_Id || departmentItem?.hrmD_Id || 0,
        day_flag: data.selectedDays && data.selectedDays.length > 0,
        fO_Start_Date: startDate,
        fomhwdD_ToDate: endDate,
        fomhwD_HolidayWDName: data.name || '',
        userid: 0,
        selectedDaysDate: selectedDaysDate,
        // Include IDs for edit mode (API might need these)
        ...(isEdit ? { 
            fomhwD_Id: data.id,
            fomhwdD_Id: data.id // May need to get the detail ID separately
        } : {})
    };
    
    console.log('📝 [SERVER] Request body details:', {
        isEdit,
        hasId: !!data.id,
        id: data.id,
        requestBodyKeys: Object.keys(requestBody),
        day_flag: requestBody.day_flag,
        selectedDaysDateCount: requestBody.selectedDaysDate.length
    });

    console.log('📤 [SERVER] Request body:', JSON.stringify(requestBody, null, 2));
    console.log('📤 [SERVER] Selected days date count:', selectedDaysDate.length);

    const url = '/api/MasterHolidayFacade/savedetail';
    console.log('🌐 [SERVER] Calling API:', url);
    
    try {
        const response = await api.post<any>('hrmsfrontoffice', url, requestBody);
        
        // ========== COMPREHENSIVE DEBUG LOGGING ==========
        console.log('🔵 ========== MASTER HOLIDAY SAVE API RESPONSE ==========');
        console.log('🔵 [SERVER] Raw API Response (Full):', JSON.stringify(response, null, 2));
        console.log('🔵 [SERVER] Response Type:', typeof response);
        console.log('🔵 [SERVER] Response is Array?', Array.isArray(response));
        console.log('🔵 [SERVER] Response is Null?', response === null);
        console.log('🔵 [SERVER] Response is Undefined?', response === undefined);
        
        // Detailed response logging
        console.log('📊 [SERVER] Response structure analysis:', {
            hasResponse: !!response,
            responseType: typeof response,
            isArray: Array.isArray(response),
            isObject: typeof response === 'object' && response !== null,
            responseKeys: response && typeof response === 'object' ? Object.keys(response) : 'N/A',
            hasSuccess: response && typeof response === 'object' ? 'success' in response : false,
            success: response?.success,
            hasMessage: response && typeof response === 'object' ? 'message' in response : false,
            message: response?.message,
            hasReturnval: response && typeof response === 'object' ? 'returnval' in response : false,
            returnval: response?.returnval,
            hasReportList: response && typeof response === 'object' ? 'report_list' in response : false,
            reportListLength: Array.isArray((response as any)?.report_list) ? (response as any).report_list.length : 0,
            hasData: response && typeof response === 'object' ? 'data' in response : false,
            dataType: typeof response?.data,
            dataKeys: response?.data && typeof response.data === 'object' ? Object.keys(response.data) : []
        });
        
        // Transform response to match expected format
        // The API response is nested: { success: true, message: "success", data: { returnval: true, report_list: [...] } }
        const responseData = response as any;
        
        console.log('🔵 [SERVER] Response Data Type Check:', {
            isObject: typeof responseData === 'object',
            isNull: responseData === null,
            isUndefined: responseData === undefined,
            hasResponseData: !!responseData,
            hasData: !!responseData?.data,
            hasNestedData: !!responseData?.data?.data
        });
        
        // Check nested structure - API returns: { success: true, message: "success", data: { returnval: true, report_list: [...] } }
        const nestedData = responseData?.data?.data || responseData?.data || responseData;
        const apiSuccess = responseData?.data?.success || responseData?.success;
        const apiMessage = responseData?.data?.message || responseData?.message;
        
        console.log('🔍 [SERVER] Checking nested structure for success indicators:', {
            hasResponseData: !!responseData,
            hasData: !!responseData?.data,
            hasNestedData: !!responseData?.data?.data,
            apiSuccess: apiSuccess,
            apiSuccessType: typeof apiSuccess,
            apiMessage: apiMessage,
            nestedDataKeys: nestedData && typeof nestedData === 'object' ? Object.keys(nestedData) : [],
            hasReturnval: nestedData && 'returnval' in nestedData,
            returnval: nestedData?.returnval,
            returnvalType: typeof nestedData?.returnval,
            hasReportList: nestedData && 'report_list' in nestedData,
            reportListType: typeof nestedData?.report_list,
            reportListIsArray: Array.isArray(nestedData?.report_list),
            reportListLength: Array.isArray(nestedData?.report_list) ? nestedData.report_list.length : 0
        });
        
        // Extract success indicators from nested structure
        const returnval = nestedData?.returnval;
        const reportList = nestedData?.report_list;
        const hasReportList = Array.isArray(reportList) && reportList.length > 0;
        
        // Check for success indicators:
        // 1. API success flag (response.data.success === true)
        // 2. returnval === true (explicit success)
        // 3. New IDs were created (fomhwD_Id > 0 or fomhwdD_Id > 0) - indicates save succeeded
        // 4. If returnval is true OR (has report_list), it's likely success
        const fomhwD_Id = nestedData?.fomhwD_Id || 0;
        const fomhwdD_Id = nestedData?.fomhwdD_Id || 0;
        const hasNewIds = fomhwD_Id > 0 || fomhwdD_Id > 0;
        
        // Success if: API success is true, OR returnval is true, OR (has new IDs AND has report list)
        const isSuccess = apiSuccess === true || returnval === true || (hasNewIds && hasReportList);
        
        // Extract error message from response if available
        const apiErrorMessage = nestedData?.msg || 
                               nestedData?.errorMessage || 
                               nestedData?.error ||
                               responseData?.msg ||
                               responseData?.errorMessage ||
                               responseData?.error ||
                               (nestedData?.errors && Array.isArray(nestedData.errors) 
                                   ? nestedData.errors.map((e: any) => e.message || e).join(', ')
                                   : null);
        
        // Determine message - use API message if available, otherwise default
        let message = apiMessage || 'Master holiday saved successfully';
        if (!isSuccess) {
            if (apiErrorMessage) {
                message = apiErrorMessage;
            } else {
                message = returnval === false && !hasNewIds 
                    ? 'Failed to save master holiday. Please check the data and try again.'
                    : apiMessage || 'Master holiday operation completed, but result is unclear. Please verify.';
            }
        } else if (data.id && data.id > 0) {
            message = apiMessage || 'Master holiday updated successfully';
        } else {
            message = apiMessage || 'Master holiday saved successfully';
        }
        
        console.log('🔄 [SERVER] Transforming response - Analysis:', {
            apiSuccess,
            apiSuccessType: typeof apiSuccess,
            apiMessage,
            returnval,
            returnvalType: typeof returnval,
            returnvalStrictTrue: returnval === true,
            returnvalStrictFalse: returnval === false,
            returnvalTruthy: !!returnval,
            hasReportList,
            reportListLength: reportList?.length || 0,
            fomhwD_Id,
            fomhwdD_Id,
            hasNewIds,
            isSuccess,
            message,
            isEdit: !!(data.id && data.id > 0),
            rawReturnval: returnval,
            rawFomhwD_Id: nestedData?.fomhwD_Id,
            rawFomhwdD_Id: nestedData?.fomhwdD_Id,
            nestedDataStructure: {
                hasNestedData: !!nestedData,
                nestedDataKeys: nestedData && typeof nestedData === 'object' ? Object.keys(nestedData).slice(0, 10) : []
            }
        });
        
        // Transform to expected ApiResponse format
        // Use the nested data if available, otherwise use the full response
        const transformedResponse = {
            success: isSuccess,
            message: message,
            data: nestedData || responseData,
            // Include report_list and total if available for consistency with getdata response
            total: reportList?.length || 0,
            page: 1,
            page_size: 10
        };
        
        console.log('✅ [SERVER] Final transformed response:', JSON.stringify(transformedResponse, null, 2));
        console.log('✅ [SERVER] Transformed response summary:', {
            success: transformedResponse.success,
            successType: typeof transformedResponse.success,
            message: transformedResponse.message,
            messageType: typeof transformedResponse.message,
            hasData: !!transformedResponse.data,
            total: transformedResponse.total
        });
        console.log('🔵 ========== END MASTER HOLIDAY SAVE API RESPONSE ==========');
        
        return transformedResponse;
    } catch (error: any) {
        console.error('❌ [SERVER] API error:', error);
        console.error('❌ [SERVER] Error details:', {
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data
        });
        throw error;
    }
}

/**
 * Delete master holiday
 */
export async function deleteMasterHoliday(id: number) {
    const requestBody = {
        fomhwdD_Id: id
    };

    const url = '/api/MasterHolidayFacade/delete';
    
    try {
        const response = await api.post<any>('hrmsfrontoffice', url, requestBody);
        
        // Transform response to match expected format
        const responseData = response as any;
        
        // Check for success indicators
        const returnval = responseData?.returnval;
        const returnvalBool = returnval === true || returnval === 'true' || returnval === 1 || returnval === '1';
        const hasSuccessField = 'success' in responseData && responseData.success === true;
        
        // Multiple ways to determine success
        const isSuccess = returnvalBool || hasSuccessField || responseData?.success === true;
        
        // Extract error message from response if available
        const apiErrorMessage = responseData?.msg || 
                               responseData?.errorMessage || 
                               responseData?.error ||
                               (responseData?.errors && Array.isArray(responseData.errors) 
                                   ? responseData.errors.map((e: any) => e.message || e).join(', ')
                                   : null);
        
        // Determine message
        const message = isSuccess 
            ? 'Master holiday deleted successfully'
            : (apiErrorMessage || 'Failed to delete master holiday');
        
        return {
            success: isSuccess,
            message: message,
            data: responseData
        };
    } catch (error: any) {
        console.error('Failed to delete master holiday:', error);
        
        return {
            success: false,
            message: error?.response?.data?.msg || error?.message || 'Failed to delete master holiday',
            data: error?.response?.data
        };
    }
}

