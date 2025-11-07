'use server';

import { api } from '@/lib/apiService';
import type { ApiResponse } from '@/lib/apiService';
import type {
    SalaryApprovalOnloadRequest,
    SalaryApprovalOnloadResponse,
    SalaryApprovalRequest,
    SalaryApprovalResponse,
    SalaryApprovalSearchRequest,
    SalaryApprovalSearchResponse
} from '@/types/hrms/salary-approval';

/**
 * Get salary approval process onload data
 * POST /api/CumulativeSalaryReportFacade/onloadgetdetailsNew?mid=30
 */
export async function getSalaryApprovalOnload(payload: SalaryApprovalOnloadRequest) {
    console.log('🔵 [SALARY APPROVAL - BACKEND] getSalaryApprovalOnload - START');
    console.log('📥 [SALARY APPROVAL - BACKEND] Request payload:', JSON.stringify(payload, null, 2));
    
    const url = '/api/CumulativeSalaryReportFacade/onloadgetdetailsNew?mid=30';
    console.log('🌐 [SALARY APPROVAL - BACKEND] API URL:', url);
    console.log('🌐 [SALARY APPROVAL - BACKEND] API Base: hrms');
    
    try {
        const response = await api.post<SalaryApprovalOnloadResponse>('hrms', url, {});
        console.log('✅ [SALARY APPROVAL - BACKEND] API Response received');
        console.log('📤 [SALARY APPROVAL - BACKEND] Response structure:', {
            hasSuccess: 'success' in response,
            hasData: 'data' in response,
            responseKeys: Object.keys(response || {})
        });
        
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            console.log('✅ [SALARY APPROVAL - BACKEND] Response already wrapped, returning as-is');
            console.log('🔵 [SALARY APPROVAL - BACKEND] getSalaryApprovalOnload - END (Success)');
            return response;
        }
        
        // Wrap raw response data
        const wrappedResponse = {
            success: true,
            message: 'Data loaded successfully',
            data: response as unknown as SalaryApprovalOnloadResponse
        };
        console.log('✅ [SALARY APPROVAL - BACKEND] Response wrapped successfully');
        console.log('📊 [SALARY APPROVAL - BACKEND] Response data summary:', {
            hasGroupTypes: !!(wrappedResponse.data?.groupTypedropdownlist?.length),
            groupTypesCount: wrappedResponse.data?.groupTypedropdownlist?.length || 0,
            hasDepartments: !!(wrappedResponse.data?.departmentdropdownlist?.length),
            departmentsCount: wrappedResponse.data?.departmentdropdownlist?.length || 0,
            hasDesignations: !!(wrappedResponse.data?.designationdropdownlist?.length),
            designationsCount: wrappedResponse.data?.designationdropdownlist?.length || 0,
            hasMonths: !!(wrappedResponse.data?.monthdropdown),
            hasLeaveYears: !!(wrappedResponse.data?.leaveyeardropdown?.length),
            leaveYearsCount: wrappedResponse.data?.leaveyeardropdown?.length || 0
        });
        console.log('🔵 [SALARY APPROVAL - BACKEND] getSalaryApprovalOnload - END (Success)');
        return wrappedResponse;
    } catch (error) {
        console.error('❌ [SALARY APPROVAL - BACKEND] getSalaryApprovalOnload - ERROR');
        console.error('💥 [SALARY APPROVAL - BACKEND] Error details:', error);
        console.error('💥 [SALARY APPROVAL - BACKEND] Error message:', error instanceof Error ? error.message : String(error));
        console.error('💥 [SALARY APPROVAL - BACKEND] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        throw error;
    }
}

/**
 * Search employees by selection for salary approval
 * POST /api/CumulativeSalaryReportFacade/GetEmployeedetailsBySelectionNew
 */
export async function searchSalaryApprovalEmployees(payload: SalaryApprovalSearchRequest) {
    console.log('🔵 [SALARY APPROVAL - BACKEND] searchSalaryApprovalEmployees - START');
    console.log('📥 [SALARY APPROVAL - BACKEND] Request payload:', JSON.stringify(payload, null, 2));
    
    const url = '/api/CumulativeSalaryReportFacade/GetEmployeedetailsBySelectionNew';
    console.log('🌐 [SALARY APPROVAL - BACKEND] API URL:', url);
    console.log('🌐 [SALARY APPROVAL - BACKEND] API Base: hrms');
    
    // Prepare request body - ensure arrays are [0] when empty, as API expects
    // Trim month value to remove any trailing/leading spaces
    const trimmedMonth = payload.HRES_Month ? payload.HRES_Month.trim() : 'string';
    console.log('🔍 [SALARY APPROVAL - BACKEND] Month value processing:');
    console.log('  - Original:', JSON.stringify(payload.HRES_Month));
    console.log('  - Trimmed:', JSON.stringify(trimmedMonth));
    console.log('  - Length before:', payload.HRES_Month?.length || 0);
    console.log('  - Length after:', trimmedMonth.length);
    
    const requestBody = {
        MI_Id: payload.MI_Id || 0,
        HRES_Year: payload.HRES_Year || 'string',
        HRES_Month: trimmedMonth,
        hrmdeS_IdList: payload.hrmdeS_IdList && payload.hrmdeS_IdList.length > 0 ? payload.hrmdeS_IdList : [0],
        hrmD_IdList: payload.hrmD_IdList && payload.hrmD_IdList.length > 0 ? payload.hrmD_IdList : [0],
        groupTypeIdList: payload.groupTypeIdList && payload.groupTypeIdList.length > 0 ? payload.groupTypeIdList : [0],
        LogInUserId: payload.LogInUserId || 0
    };
    
    console.log('📤 [SALARY APPROVAL - BACKEND] Request body prepared:', JSON.stringify(requestBody, null, 2));
    console.log('📊 [SALARY APPROVAL - BACKEND] Request body summary:', {
        MI_Id: requestBody.MI_Id,
        HRES_Year: requestBody.HRES_Year,
        HRES_Month: requestBody.HRES_Month,
        designationIdsCount: requestBody.hrmdeS_IdList.length,
        departmentIdsCount: requestBody.hrmD_IdList.length,
        groupTypeIdsCount: requestBody.groupTypeIdList.length,
        LogInUserId: requestBody.LogInUserId
    });
    
    try {
        const response = await api.post<SalaryApprovalSearchResponse>('hrms', url, requestBody);
        console.log('✅ [SALARY APPROVAL - BACKEND] API Response received');
        console.log('📤 [SALARY APPROVAL - BACKEND] Response structure:', {
            hasSuccess: 'success' in response,
            hasData: 'data' in response,
            responseKeys: Object.keys(response || {})
        });
        
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const employeeCount = (response.data as SalaryApprovalSearchResponse)?.ReportData?.length || 0;
            console.log('✅ [SALARY APPROVAL - BACKEND] Response already wrapped');
            console.log('📊 [SALARY APPROVAL - BACKEND] Employees found:', employeeCount);
            console.log('🔍 [SALARY APPROVAL - BACKEND] ReportData type:', typeof (response.data as SalaryApprovalSearchResponse)?.ReportData);
            console.log('🔍 [SALARY APPROVAL - BACKEND] ReportData value:', JSON.stringify((response.data as SalaryApprovalSearchResponse)?.ReportData, null, 2));
            console.log('🔵 [SALARY APPROVAL - BACKEND] searchSalaryApprovalEmployees - END (Success)');
            return response;
        }
        
        // Wrap raw response data
        const wrappedResponse = {
            success: true,
            message: 'Data loaded successfully',
            data: response as unknown as SalaryApprovalSearchResponse
        };
        
        // Detailed inspection of ReportData
        const reportData = wrappedResponse.data?.ReportData;
        console.log('🔍 [SALARY APPROVAL - BACKEND] ReportData inspection:');
        console.log('  - Type:', typeof reportData);
        console.log('  - Is Array:', Array.isArray(reportData));
        console.log('  - Is Null:', reportData === null);
        console.log('  - Is Undefined:', reportData === undefined);
        console.log('  - Value:', JSON.stringify(reportData, null, 2));
        
        if (reportData && Array.isArray(reportData)) {
            console.log('  - Array length:', reportData.length);
            if (reportData.length > 0) {
                console.log('  - First item keys:', Object.keys(reportData[0] || {}));
            }
        }
        
        const employeeCount = Array.isArray(reportData) ? reportData.length : 0;
        console.log('✅ [SALARY APPROVAL - BACKEND] Response wrapped successfully');
        console.log('📊 [SALARY APPROVAL - BACKEND] Employees found:', employeeCount);
        if (employeeCount > 0 && reportData) {
            console.log('📋 [SALARY APPROVAL - BACKEND] First employee sample:', JSON.stringify(reportData[0], null, 2));
        } else {
            console.log('⚠️ [SALARY APPROVAL - BACKEND] No employees found in ReportData');
            console.log('🔍 [SALARY APPROVAL - BACKEND] Checking alternative response keys...');
            console.log('  - Has employeeDetails:', 'employeeDetails' in (response as any));
            console.log('  - Has masterEmployeeList:', 'masterEmployeeList' in (response as any));
            console.log('  - Has currentemployeeDetails:', 'currentemployeeDetails' in (response as any));
            if ((response as any)?.employeeDetails) {
                console.log('  - employeeDetails type:', typeof (response as any).employeeDetails);
                console.log('  - employeeDetails is array:', Array.isArray((response as any).employeeDetails));
            }
        }
        console.log('🔵 [SALARY APPROVAL - BACKEND] searchSalaryApprovalEmployees - END (Success)');
        return wrappedResponse;
    } catch (error) {
        console.error('❌ [SALARY APPROVAL - BACKEND] searchSalaryApprovalEmployees - ERROR');
        console.error('💥 [SALARY APPROVAL - BACKEND] Error details:', error);
        console.error('💥 [SALARY APPROVAL - BACKEND] Error message:', error instanceof Error ? error.message : String(error));
        console.error('💥 [SALARY APPROVAL - BACKEND] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        throw error;
    }
}

/**
 * Approve or reject salaries for selected employees
 * POST /api/CumulativeSalaryReportFacade/approveSalary
 */
export async function approveSalaries(payload: SalaryApprovalRequest) {
    console.log('🔵 [SALARY APPROVAL - BACKEND] approveSalaries - START');
    console.log('📥 [SALARY APPROVAL - BACKEND] Request payload:', JSON.stringify(payload, null, 2));
    console.log('📊 [SALARY APPROVAL - BACKEND] Approval details:', {
        MI_Id: payload.MI_Id,
        HRES_Year: payload.HRES_Year,
        HRES_Month: payload.HRES_Month,
        approvalStatus: payload.approvalStatus,
        employeeCount: payload.employeeIdList?.length || 0,
        employeeIds: payload.employeeIdList,
        LogInUserId: payload.LogInUserId,
        remarks: payload.remarks || 'N/A'
    });
    
    const url = '/api/CumulativeSalaryReportFacade/approveSalary';
    console.log('🌐 [SALARY APPROVAL - BACKEND] API URL:', url);
    console.log('🌐 [SALARY APPROVAL - BACKEND] API Base: hrms');
    
    try {
        const response = await api.post<SalaryApprovalResponse>('hrms', url, payload);
        console.log('✅ [SALARY APPROVAL - BACKEND] API Response received');
        console.log('📤 [SALARY APPROVAL - BACKEND] Response:', JSON.stringify(response, null, 2));
        console.log('📊 [SALARY APPROVAL - BACKEND] Approval result:', {
            success: response.success,
            message: response.message,
            approvedCount: response.approvedCount || 0,
            failedCount: response.failedCount || 0
        });
        console.log('🔵 [SALARY APPROVAL - BACKEND] approveSalaries - END (Success)');
        return response;
    } catch (error) {
        console.error('❌ [SALARY APPROVAL - BACKEND] approveSalaries - ERROR');
        console.error('💥 [SALARY APPROVAL - BACKEND] Error details:', error);
        console.error('💥 [SALARY APPROVAL - BACKEND] Error message:', error instanceof Error ? error.message : String(error));
        console.error('💥 [SALARY APPROVAL - BACKEND] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        throw error;
    }
}

/**
 * Test API connection for salary approval process
 */
export async function testSalaryApprovalProcessAPI(miId: number = 30) {
    const url = `/api/CumulativeSalaryReportFacade/onloadgetdetailsNew?mid=${miId}`;
    return await api.post<SalaryApprovalResponse>('hrms', url, {});
}
