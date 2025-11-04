'use server';

import { api } from '@/lib/apiService';
import type {
    SalaryIncrementDeleteRequest,
    SalaryIncrementDeleteResponse,
    SalaryIncrementOnloadRequest,
    SalaryIncrementOnloadResponse,
    SalaryIncrementSaveRequest,
    SalaryIncrementSaveResponse
} from '@/types/hrms/salary-increment';

/**
 * Get salary increment onload details
 * POST /api/EmployeeSalaryIncreementProcessFacade/onloadgetdetails
 */
export async function getSalaryIncrementOnload(payload: SalaryIncrementOnloadRequest) {
    const url = '/api/EmployeeSalaryIncreementProcessFacade/onloadgetdetails';
    
    // Prepare request body matching the exact API structure from the working implementation
    const now = new Date().toISOString();
    const requestBody = {
        MI_Id: payload.MI_Id || 30,
        roleId: payload.roleId || 0,
        HREIC_Id: 0,
        HRME_Id: 0,
        HREIC_LastIncrementDate: now,
        HREIC_IncrementDueDate: now,
        HREIC_IncrementDate: now,
        Fromdate: now,
        Todate: now,
        HREIC_ArrearApplicableFlg: true,
        HREIC_ArrearGivenFlg: true,
        HREIC_ArrearMonths: 0,
        UserId: 0,
        HREIC_ActiveFlag: true,
        HREICED_Id: true,
        HRMED_Id: 0,
        HREICED_Amount: 0,
        HREICED_Percentage: 'string',
        HREICED_ActiveFlag: true,
        retrunMsg: 'string',
        Status: 'string',
        monthdropdown: [],
        griddata: [],
        Reportdata: [],
        employeelist: [],
        earningdeductiontype: [],
        getempsdetails: [],
        leaveyeardropdown: [],
        Type: 'string',
        Option: 'string',
        Month: 0,
        Year: 0,
        selected_hrmeID: 0,
        employee: []
    };
    
    const response = await api.post<SalaryIncrementOnloadResponse>('hrms', url, requestBody);
    
    // Debug: Log the response structure
    console.log('=== Salary Increment Onload API Response ===');
    console.log('Status: Response received');
    console.log('Response type:', typeof response);
    console.log('Response keys:', response && typeof response === 'object' ? Object.keys(response) : 'N/A');
    
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        const wrappedResponse = response as { success: boolean; message?: string; data?: SalaryIncrementOnloadResponse };
        console.log('Response is already wrapped');
        console.log('Data keys:', wrappedResponse.data ? Object.keys(wrappedResponse.data) : 'No data');
        console.log('Employee list length:', wrappedResponse.data?.employeelist?.length || 0);
        console.log('Grid data length:', wrappedResponse.data?.griddata?.length || 0);
        return response;
    }
    
    // Wrap raw response data
    const rawData = response as unknown as SalaryIncrementOnloadResponse;
    console.log('Response is raw, wrapping it');
    console.log('Raw data keys:', rawData && typeof rawData === 'object' ? Object.keys(rawData) : 'N/A');
    console.log('Employee list length:', rawData?.employeelist?.length || 0);
    console.log('Grid data length:', rawData?.griddata?.length || 0);
    
    return {
        success: true,
        message: 'Data loaded successfully',
        data: rawData
    };
}

export async function saveSalaryIncrement(payload: SalaryIncrementSaveRequest) {
    const url = '/api/EmployeeSalaryIncreementProcessFacade';
    return await api.post<SalaryIncrementSaveResponse>('hrms', url, payload);
}

export async function deleteSalaryIncrement(payload: SalaryIncrementDeleteRequest) {
    const url = '/api/EmployeeSalaryIncreementProcessFacade/deactivateRecordById';
    return await api.post<SalaryIncrementDeleteResponse>('hrms', url, payload);
}
