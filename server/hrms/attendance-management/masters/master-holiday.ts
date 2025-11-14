'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    MasterHolidayGetDataResponse,
    MasterHolidayGetDataResponseData,
    MasterHolidaySaveRequest
} from '@/types/hrms/attendance-management/master-holiday';

/**
 * Get master holiday data from API
 * Following the preadmission module pattern - returns API response directly
 */
export async function getMasterHoliday(searchParams?: ApiSearchparams) {
    const requestBody = {
        page: searchParams?.page || 1,
        page_size: searchParams?.page_size || 10,
        search_query: searchParams?.search_query || '',
        search_column: searchParams?.search_column || '',
        sort_column: searchParams?.sort_column || '',
        sort_direction: searchParams?.sort_direction || '',
        is_export: false,
        miid: 30,
        loginUserId: 0,
        userRole: ''
    };

    const url = '/api/MasterHolidayFacade/getdata';
    return await api.post<MasterHolidayGetDataResponse>('hrmsfrontoffice', url, requestBody);
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
    const yearItem = dropdownData?.yeardropdown?.find((y) => y.hrmlY_LeaveYear === data.calendarYear);
    const departmentItem = data.department 
        ? dropdownData?.departmentType?.find((d) => d.hrmD_DepartmentName === data.department)
        : null;
    const holidayTypeItem = dropdownData?.holidayType?.find((h) => h.fohtwD_HolidayWDType === data.holidayType);

    console.log('🔍 [SERVER] Found IDs:', {
        yearId: yearItem?.hrmlY_Id || 'NOT FOUND',
        departmentId: departmentItem?.hrmD_Id || (data.department ? 'NOT FOUND' : 'NOT PROVIDED'),
        holidayTypeId: holidayTypeItem?.fohwdT_Id || 'NOT FOUND',
        yearSearch: data.calendarYear,
        deptSearch: data.department || 'NOT PROVIDED',
        holidayTypeSearch: data.holidayType
    });

    // Build selectedDaysDate array
    const selectedDaysDate: { date: string; dayname: string }[] = [];
    
    // Get day names from dayslist
    const daysMap = new Map(
        dropdownData?.dayslist?.map((day) => [day.fomD_DayCode, day.fomD_DayName]) || []
    );
    
    if (data.selectedDays && data.selectedDays.length > 0) {
        if (data.holidayType === 'WEEK DAY') {
            // For WEEK DAY type: use the calendar year's date range to generate all occurrences
            // Get the year's date range from dropdown data
            const yearItem = dropdownData?.yeardropdown?.find((y) => y.hrmlY_LeaveYear === data.calendarYear);
            
            if (yearItem && yearItem.hrmlY_FromDate && yearItem.hrmlY_ToDate) {
                const fromDateObj = new Date(yearItem.hrmlY_FromDate);
                const toDateObj = new Date(yearItem.hrmlY_ToDate);
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
        hrmlY_Id: yearItem?.hrmlY_Id || 0,
        fohwdT_Id: holidayTypeItem?.fohwdT_Id || 0,
        hrmD_Id: departmentItem?.hrmD_Id || 0,
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
        
        // Detailed response logging
        console.log('✅ [SERVER] API response received');
        console.log('📊 [SERVER] Response structure:', {
            hasResponse: !!response,
            hasSuccess: 'success' in response,
            success: response?.success,
            hasMessage: 'message' in response,
            message: response?.message,
            hasReturnval: 'returnval' in response,
            returnval: response?.returnval,
            hasReportList: 'report_list' in response,
            reportListLength: (response as any)?.report_list?.length || 0,
            hasData: 'data' in response,
            dataType: typeof response?.data,
            dataKeys: response?.data ? Object.keys(response.data) : [],
            responseKeys: response ? Object.keys(response) : []
        });
        
        // Transform response to match expected format
        // The save endpoint returns { returnval, report_list, ... } instead of { success, message, data }
        const responseData = response as any;
        
        // Check for error messages or validation details in the response
        console.log('🔍 [SERVER] Checking for error messages:', {
            hasMsg: 'msg' in responseData,
            msg: responseData?.msg,
            hasErrorMessage: 'errorMessage' in responseData,
            errorMessage: responseData?.errorMessage,
            hasError: 'error' in responseData,
            error: responseData?.error,
            hasErrors: 'errors' in responseData,
            errors: responseData?.errors,
            hasValidationErrors: 'validationErrors' in responseData,
            validationErrors: responseData?.validationErrors,
            returnval: responseData?.returnval,
            fomhwD_Id: responseData?.fomhwD_Id,
            fomhwdD_Id: responseData?.fomhwdD_Id,
            count: responseData?.count,
            gridviewdetails: responseData?.gridviewdetails
        });
        
        // Log full response structure to see all available fields
        console.log('📋 [SERVER] Full response keys and sample values:', {
            allKeys: Object.keys(responseData || {}),
            sampleValues: Object.fromEntries(
                Object.entries(responseData || {}).slice(0, 20).map(([key, value]) => [
                    key,
                    typeof value === 'object' && value !== null && !Array.isArray(value)
                        ? Object.keys(value).slice(0, 5)
                        : Array.isArray(value)
                          ? `Array(${value.length})`
                          : value
                ])
            )
        });
        const returnval = responseData?.returnval;
        const reportList = responseData?.report_list;
        const hasReportList = Array.isArray(reportList) && reportList.length > 0;
        
        // Check for success indicators:
        // 1. returnval === true (explicit success)
        // 2. New IDs were created (fomhwD_Id > 0 or fomhwdD_Id > 0) - indicates save succeeded
        // 3. If returnval is false but we have report_list AND new IDs, it might still be success
        const fomhwD_Id = responseData?.fomhwD_Id || 0;
        const fomhwdD_Id = responseData?.fomhwdD_Id || 0;
        const hasNewIds = fomhwD_Id > 0 || fomhwdD_Id > 0;
        
        // Success if: returnval is true, OR (has new IDs AND has report list)
        const isSuccess = returnval === true || (hasNewIds && hasReportList);
        
        // Extract error message from response if available
        const apiErrorMessage = responseData?.msg || 
                               responseData?.errorMessage || 
                               responseData?.error ||
                               (responseData?.errors && Array.isArray(responseData.errors) 
                                   ? responseData.errors.map((e: any) => e.message || e).join(', ')
                                   : null);
        
        // Determine message
        let message = 'Master holiday saved successfully';
        if (!isSuccess) {
            if (apiErrorMessage) {
                message = apiErrorMessage;
            } else {
                message = returnval === false && !hasNewIds 
                    ? 'Failed to save master holiday. Please check the data and try again.'
                    : 'Master holiday operation completed, but result is unclear. Please verify.';
            }
        } else if (data.id && data.id > 0) {
            message = 'Master holiday updated successfully';
        }
        
        console.log('🔄 [SERVER] Transforming response:', {
            returnval,
            hasReportList,
            reportListLength: reportList?.length || 0,
            fomhwD_Id,
            fomhwdD_Id,
            hasNewIds,
            isSuccess,
            message,
            isEdit: !!(data.id && data.id > 0)
        });
        
        // Transform to expected ApiResponse format
        const transformedResponse = {
            success: isSuccess,
            message: message,
            data: responseData,
            // Include report_list and total if available for consistency with getdata response
            total: reportList?.length || 0,
            page: 1,
            page_size: 10
        };
        
        console.log('✅ [SERVER] Transformed response:', {
            success: transformedResponse.success,
            message: transformedResponse.message,
            hasData: !!transformedResponse.data,
            total: transformedResponse.total
        });
        
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
        const isSuccess = returnval === true || returnval === 'true';
        
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
        console.error('❌ [SERVER] Delete API error:', error);
        console.error('❌ [SERVER] Error details:', {
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data
        });
        
        return {
            success: false,
            message: error?.response?.data?.msg || error?.message || 'Failed to delete master holiday',
            data: error?.response?.data
        };
    }
}

