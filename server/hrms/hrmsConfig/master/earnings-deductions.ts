'use server';

import { api } from '@/lib/apiService';
import type {
    EarningsDeductionDetail,
    MasterEarningsDeductionsInput,
    MasterEarningsDeductionsOnloadResponse,
    MasterEarningsDeductionsResponse
} from '@/types/hrms/master-earnings-deductions';

/**
 * Get onload details for master earnings deductions
 * POST /api/MasterEarningsDeductionsFacade/onloadgetdetails
 */
export async function getMasterEarningsDeductionsList(roleId: number) {
    console.log('🟠 [API] getMasterEarningsDeductionsList called with roleId:', roleId);
    
    const url = '/api/MasterEarningsDeductionsFacade/onloadgetdetails';
    const currentDate = new Date().toISOString();
    
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMED_Id: 0,
        MI_Id: roleId,
        HRMED_Name: 'string',
        HRMED_EDTypeFlag: 'string',
        HRMED_EarnDedFlag: 'string',
        HRMED_AmountPercentFlag: 'string',
        HRMED_AmountPercent: 'string',
        HRMED_ActiveFlag: true,
        HRMED_RoundOffFlag: 'string',
        HRMED_ReviseFlg: false,
        HRMED_Order: 0,
        earningdetectionList: [],
        retrunMsg: 'string',
        roleId: roleId,
        earningList: [],
        detectionList: [],
        eardettypelist: [],
        eardettypeDropdown: [],
        perc_OfDTO: [],
        selectedearningdetectionList: [],
        percentOff: 'string',
        HREED_Amount: 0,
        arrearlist: [],
        grosslist: [],
        EarningsDeductionsDTO: []
    };
    
    console.log('🟠 [API] Calling onloadgetdetails API...');
    const response = await api.post<MasterEarningsDeductionsOnloadResponse>('hrms', url, requestBody);
    
    console.log('🟢 [API] Onload response received');
    const eardettypeDropdown = (response?.eardettypeDropdown || []) as any[];
    const earningdetectionList = (response?.earningdetectionList || []) as any[];
    console.log('🟢 [API] eardettypeDropdown count:', eardettypeDropdown.length || 0);
    console.log('🟢 [API] earningdetectionList count:', earningdetectionList.length || 0);
    
    return response;
}

/**
 * Save or Update master earnings deductions record
 * POST /api/MasterEarningsDeductionsFacade
 */
export async function saveMasterEarningsDeductions(data: MasterEarningsDeductionsInput) {
    console.log('🟠 [API] saveMasterEarningsDeductions called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    
    const url = '/api/MasterEarningsDeductionsFacade';
    const currentDate = new Date().toISOString();
    
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMED_Id: data.HRMED_Id || 0,
        MI_Id: data.MI_Id,
        HRMED_Name: data.HRMED_Name,
        HRMED_EDTypeFlag: data.HRMED_EDTypeFlag,
        HRMED_EarnDedFlag: data.HRMED_EarnDedFlag,
        HRMED_AmountPercentFlag: data.HRMED_AmountPercentFlag,
        HRMED_AmountPercent: data.HRMED_AmountPercent,
        HRMED_ActiveFlag: data.HRMED_ActiveFlag,
        HRMED_RoundOffFlag: data.HRMED_RoundOffFlag,
        HRMED_ReviseFlg: data.HRMED_ReviseFlg,
        HRMED_Order: data.HRMED_Order || 0,
        earningdetectionList: [
            {
                CreatedDate: currentDate,
                UpdatedDate: currentDate,
                HRMED_Id: data.HRMED_Id || 0,
                MI_Id: data.MI_Id,
                HRMED_Name: data.HRMED_Name,
                HRMED_EDTypeFlag: data.HRMED_EDTypeFlag,
                HRMED_EarnDedFlag: data.HRMED_EarnDedFlag,
                HRMED_AmountPercentFlag: data.HRMED_AmountPercentFlag,
                HRMED_AmountPercent: data.HRMED_AmountPercent,
                HRMED_ActiveFlag: data.HRMED_ActiveFlag,
                HRMED_RoundOffFlag: data.HRMED_RoundOffFlag,
                HRMED_Order: data.HRMED_Order || 0,
                HRMED_ReviseFlg: data.HRMED_ReviseFlg
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id,
        earningList: [],
        detectionList: [],
        eardettypelist: [],
        eardettypeDropdown: [],
        perc_OfDTO: [],
        selectedearningdetectionList: [],
        percentOff: 'string',
        HREED_Amount: 0,
        arrearlist: [],
        grosslist: [],
        EarningsDeductionsDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterEarningsDeductionsResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.success:', response?.success);
        console.log('🟢 [API] Response.message:', response?.message);
        console.log('🟢 [API] Response.data:', response?.data);
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.HRMED_Id:', (response as any)?.HRMED_Id);
        
        // Handle the response format - backend returns entity directly, not wrapped
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const savedId = responseData?.HRMED_Id || 0;
        
        // Check if save was successful
        // Success indicator: HRMED_Id > 0 means save was successful
        // Note: Backend sometimes returns "Error occured" even on success, so we rely on ID
        const isSuccess = savedId > 0;
        
        console.log('🟢 [API] Parsed - isSuccess:', isSuccess, 'savedId:', savedId, 'retrunMsg:', retrunMsg);
        
        // Return formatted response
        const formattedResponse = {
            success: isSuccess,
            message: isSuccess 
                ? (data.HRMED_Id ? 'Earning/Deduction updated successfully' : 'Earning/Deduction added successfully')
                : (retrunMsg || 'Failed to save earning/deduction'),
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
 * Get details of a specific master earnings deductions by ID
 * GET /api/MasterEarningsDeductions/details/{id}
 */
export async function getMasterEarningsDeductionsDetails(id: number) {
    const url = `/api/MasterEarningsDeductions/details/${id}`;
    return await api.get<EarningsDeductionDetail>('hrms', url);
}

/**
 * Activate or Deactivate a master earnings deductions record
 * POST /api/MasterEarningsDeductionsFacade/deactivateRecordById
 */
export async function activateDeactivateMasterEarningsDeductions(data: {
    HRMED_Id: number;
    HRMED_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    console.log('🟠 [API] activateDeactivateMasterEarningsDeductions called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Toggling to:', data.HRMED_ActiveFlag ? 'ACTIVE' : 'INACTIVE');
    
    const url = '/api/MasterEarningsDeductionsFacade/deactivateRecordById';
    const currentDate = new Date().toISOString();
    
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMED_Id: data.HRMED_Id,
        MI_Id: data.MI_Id || 30,
        HRMED_Name: 'string',
        HRMED_EDTypeFlag: 'string',
        HRMED_EarnDedFlag: 'string',
        HRMED_AmountPercentFlag: 'string',
        HRMED_AmountPercent: 'string',
        HRMED_ActiveFlag: data.HRMED_ActiveFlag,
        HRMED_RoundOffFlag: 'string',
        HRMED_ReviseFlg: true,
        HRMED_Order: 0,
        earningdetectionList: [
            {
                CreatedDate: currentDate,
                UpdatedDate: currentDate,
                HRMED_Id: data.HRMED_Id,
                MI_Id: data.MI_Id || 30,
                HRMED_Name: 'string',
                HRMED_EDTypeFlag: 'string',
                HRMED_EarnDedFlag: 'string',
                HRMED_AmountPercentFlag: 'string',
                HRMED_AmountPercent: 'string',
                HRMED_ActiveFlag: data.HRMED_ActiveFlag,
                HRMED_RoundOffFlag: 'string',
                HRMED_Order: 0,
                HRMED_ReviseFlg: true
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30,
        earningList: [],
        detectionList: [],
        eardettypelist: [],
        eardettypeDropdown: [],
        perc_OfDTO: [],
        selectedearningdetectionList: [],
        percentOff: 'string',
        HREED_Amount: 0,
        arrearlist: [],
        grosslist: [],
        EarningsDeductionsDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterEarningsDeductionsResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Toggle response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response HRMED_Id:', (response as any)?.HRMED_Id);
        console.log('🟢 [API] Response HRMED_ActiveFlag:', (response as any)?.HRMED_ActiveFlag);
        console.log('🟢 [API] Response retrunMsg:', (response as any)?.retrunMsg);
        
        // Check success based on response
        const responseData = response as any;
        const returnedId = responseData?.HRMED_Id || 0;
        const returnedFlag = responseData?.HRMED_ActiveFlag;
        
        // Success if we get an ID back and the flag matches what we sent
        const isSuccess = returnedId > 0;
        
        console.log('🟢 [API] Toggle success:', isSuccess);
        
        const formattedResponse = {
            success: isSuccess,
            message: isSuccess 
                ? `Earning/Deduction ${data.HRMED_ActiveFlag ? 'activated' : 'deactivated'} successfully`
                : 'Failed to toggle earning/deduction status',
            data: responseData
        };
        
        console.log('🟢 [API] Formatted toggle response:', JSON.stringify(formattedResponse, null, 2));
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Toggle error occurred');
        console.error('🔴 [API] Error:', error);
        console.error('🔴 [API] Error message:', error?.message);
        console.error('🔴 [API] Error response:', error?.response);
        console.error('🔴 [API] Error response data:', error?.response?.data);
        throw error;
    }
}

export async function saveMasterEarningsDeductionsOrder(earningsDeductions: EarningsDeductionDetail[]) {
    const url = '/api/MasterEarningsDeductionsFacade';
    const currentDate = new Date().toISOString();
    
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMED_Id: 0,
        MI_Id: 30,
        HRMED_Name: 'string',
        HRMED_EDTypeFlag: 'string',
        HRMED_EarnDedFlag: 'string',
        HRMED_AmountPercentFlag: 'string',
        HRMED_AmountPercent: 'string',
        HRMED_ActiveFlag: true,
        HRMED_RoundOffFlag: 'string',
        HRMED_ReviseFlg: true,
        HRMED_Order: 0,
        earningdetectionList: earningsDeductions.map((ed) => ({
            CreatedDate: ed.CreatedDate || currentDate,
            UpdatedDate: currentDate,
            HRMED_Id: ed.HRMED_Id,
            MI_Id: ed.MI_Id,
            HRMED_Name: ed.HRMED_Name,
            HRMED_EDTypeFlag: ed.HRMED_EDTypeFlag,
            HRMED_EarnDedFlag: ed.HRMED_EarnDedFlag,
            HRMED_AmountPercentFlag: ed.HRMED_AmountPercentFlag,
            HRMED_AmountPercent: ed.HRMED_AmountPercent,
            HRMED_ActiveFlag: ed.HRMED_ActiveFlag,
            HRMED_RoundOffFlag: ed.HRMED_RoundOffFlag,
            HRMED_Order: ed.HRMED_Order,
            HRMED_ReviseFlg: ed.HRMED_ReviseFlg
        })),
        retrunMsg: 'string',
        roleId: 30,
        earningList: [],
        detectionList: [],
        eardettypelist: [],
        eardettypeDropdown: [],
        perc_OfDTO: [],
        selectedearningdetectionList: [],
        percentOff: 'string',
        HREED_Amount: 0,
        arrearlist: [],
        grosslist: [],
        EarningsDeductionsDTO: []
    };
    return await api.post<MasterEarningsDeductionsResponse>('hrms', url, requestBody);
}
