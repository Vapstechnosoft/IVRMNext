'use server';

import { api } from '@/lib/apiService';
import type { LeaveYearDetail, MasterLeaveYearInput, MasterLeaveYearResponse } from '@/types/hrms/master-leave-year';

/**
 * Get onload details for master leave year
 * POST /api/MasterLeaveYearFacade/onloadgetdetails
 */
export async function getMasterLeaveYearList(roleId: number) {
    const url = '/api/MasterLeaveYearFacade/onloadgetdetails';
    const requestBody = {
        HRMLY_Id: 1,
        MI_Id: 30,
        HRMLY_LeaveYear: '2025-2026',
        HRMLY_FromDate: '2025-04-01T00:00:00',
        HRMLY_ToDate: '2026-03-31T00:00:00',
        HRMLY_ActiveFlag: true,
        leaveYearList: [],
        retrunMsg: '',
        roleId: roleId,
        ASMAY_From_Date: null,
        ASMAY_To_Date: null,
        HRMLY_LeaveYearOrder: 1,
        yeardetailList: [],
        LeaveorderDTO: []
    };
    return await api.post<MasterLeaveYearResponse>('hrms', url, requestBody);
}

/**
 * Create or Update a master leave year record
 * POST /api/MasterLeaveYearFacade (for both create and update)
 */
export async function saveMasterLeaveYear(data: MasterLeaveYearInput) {
    const isEdit = data.HRMLY_Id && data.HRMLY_Id > 0;
    const url = '/api/MasterLeaveYearFacade'; // Use same endpoint for both add and edit
    
    console.log('🟠 [API] saveMasterLeaveYear called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Input order value:', data.HRMLY_LeaveYearOrder);
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    console.log('🟠 [API] URL:', url);
    
    const currentDate = new Date().toISOString();
    
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMLY_Id: data.HRMLY_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRMLY_LeaveYear: data.HRMLY_LeaveYear,
        HRMLY_FromDate: data.HRMLY_FromDate,
        HRMLY_ToDate: data.HRMLY_ToDate,
        HRMLY_ActiveFlag: data.HRMLY_ActiveFlag,
        HRMLY_LeaveYearOrder: data.HRMLY_LeaveYearOrder ?? 1,  // Use ?? instead of || to allow 0
        leaveYearList: [
            {
                CreatedDate: currentDate,
                UpdatedDate: currentDate,
                HRMLY_Id: data.HRMLY_Id || 0,
                MI_Id: data.MI_Id || 30,
                HRMLY_LeaveYear: data.HRMLY_LeaveYear,
                HRMLY_FromDate: data.HRMLY_FromDate,
                HRMLY_ToDate: data.HRMLY_ToDate,
                HRMLY_ActiveFlag: data.HRMLY_ActiveFlag,
                HRMLY_LeaveYearOrder: data.HRMLY_LeaveYearOrder ?? 1  // Use ?? instead of || to allow 0
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30,
        ASMAY_From_Date: null,
        ASMAY_To_Date: null,
        yeardetailList: [],
        LeaveorderDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Order in request body:', requestBody.HRMLY_LeaveYearOrder);
    console.log('🟠 [API] Order in leaveYearList[0]:', requestBody.leaveYearList[0].HRMLY_LeaveYearOrder);
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterLeaveYearResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.success:', response?.success);
        console.log('🟢 [API] Response.message:', response?.message);
        console.log('🟢 [API] Response.data:', response?.data);
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.HRMLY_Id:', (response as any)?.HRMLY_Id);
        
        // Handle the response format
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const leaveYearId = responseData?.HRMLY_Id || (responseData?.data as any)?.HRMLY_Id || 0;
        const hasLeaveYearList = !!(responseData?.leaveYearList || responseData?.data?.leaveYearList);
        
        console.log('🟢 [API] Parsed - leaveYearId:', leaveYearId, 'retrunMsg:', retrunMsg, 'hasLeaveYearList:', hasLeaveYearList);
        
        // Check if "Update", "Saved", "Add", or "Order" message indicates success
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add' || retrunMsg === 'Order';
        
        // Success if we have a leave year ID, leaveYearList, or success message
        const isSuccess = leaveYearId > 0 || hasLeaveYearList || isUpdateSuccess;
        
        console.log('🟢 [API] isSuccess:', isSuccess);
        
        const formattedResponse = {
            success: isSuccess,
            message: isSuccess 
                ? (isEdit ? 'Leave Year updated successfully' : 'Leave Year added successfully')
                : (retrunMsg || 'Failed to save leave year'),
            data: responseData
        };
        
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Error occurred in api.post');
        console.error('🔴 [API] Error:', error);
        console.error('🔴 [API] Error message:', error?.message);
        console.error('🔴 [API] Error response:', error?.response);
        console.error('🔴 [API] Error response data:', error?.response?.data);
        throw error;
    }
}

/**
 * Get details of a specific master leave year by ID
 * GET /api/MasterLeaveYearFacade/getRecordById/{id}
 */
export async function getMasterLeaveYearDetails(id: number) {
    const url = `/api/MasterLeaveYearFacade/getRecordById/${id}`;
    return await api.get<MasterLeaveYearResponse>('hrms', url);
}

/**
 * Activate or Deactivate a master leave year record
 * POST /api/MasterLeaveYearFacade/deactivateRecordById
 */
export async function activateDeactivateMasterLeaveYear(data: {
    HRMLY_Id: number;
    HRMLY_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterLeaveYearFacade/deactivateRecordById';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMLY_Id: data.HRMLY_Id,
        MI_Id: 30,
        HRMLY_LeaveYear: 'string',
        HRMLY_FromDate: new Date().toISOString(),
        HRMLY_ToDate: new Date().toISOString(),
        HRMLY_ActiveFlag: data.HRMLY_ActiveFlag,
        leaveYearList: [],
        retrunMsg: 'string',
        roleId: 0,
        ASMAY_From_Date: null,
        ASMAY_To_Date: null,
        HRMLY_LeaveYearOrder: 1,
        yeardetailList: [],
        LeaveorderDTO: []
    };
    return await api.post<MasterLeaveYearResponse>('hrms', url, requestBody);
}

export async function saveMasterLeaveYearOrder(leaveYears: LeaveYearDetail[]) {
    console.log('🟠 [API] saveMasterLeaveYearOrder called');
    console.log('🟠 [API] Number of leave years to update:', leaveYears.length);
    
    const url = '/api/MasterLeaveYearFacade';
    const currentDate = new Date().toISOString();
    
    // Populate leaveYearList with all leave years and their updated orders
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMLY_Id: 0,
        MI_Id: 30,
        HRMLY_LeaveYear: 'string',
        HRMLY_FromDate: currentDate,
        HRMLY_ToDate: currentDate,
        HRMLY_ActiveFlag: true,
        leaveYearList: leaveYears.map((ly) => ({
            CreatedDate: ly.CreatedDate || currentDate,
            UpdatedDate: currentDate,  // Always update the UpdatedDate
            HRMLY_Id: ly.HRMLY_Id,
            MI_Id: ly.MI_Id || 30,
            HRMLY_LeaveYear: ly.HRMLY_LeaveYear,
            HRMLY_FromDate: ly.HRMLY_FromDate,
            HRMLY_ToDate: ly.HRMLY_ToDate,
            HRMLY_ActiveFlag: ly.HRMLY_ActiveFlag,
            HRMLY_LeaveYearOrder: ly.HRMLY_LeaveYearOrder ?? 0
        })),
        retrunMsg: 'string',
        roleId: 30,
        ASMAY_From_Date: null,
        ASMAY_To_Date: null,
        HRMLY_LeaveYearOrder: 0,
        yeardetailList: [],
        LeaveorderDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] leaveYearList count:', requestBody.leaveYearList.length);
    console.log('🟠 [API] Sample orders:', requestBody.leaveYearList.slice(0, 3).map(ly => `ID=${ly.HRMLY_Id}, Order=${ly.HRMLY_LeaveYearOrder}`));
    
    try {
        const response = await api.post<MasterLeaveYearResponse>('hrms', url, requestBody);
        console.log('🟢 [API] saveMasterLeaveYearOrder success');
        return response;
    } catch (error: any) {
        console.log('🔴 [API] saveMasterLeaveYearOrder error:', error);
        console.error('🔴 [API] Error message:', error?.message);
        throw error;
    }
}
