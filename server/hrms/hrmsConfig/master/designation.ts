'use server';

import { api } from '@/lib/apiService';
import type {
    DesignationDetail,
    MasterDesignationInput,
    MasterDesignationResponse,
    OnloadGetDesignationDetailsRequest,
    SaveDesignationRequest
} from '@/types/hrms/master-designation';

export async function getMasterDesignationList(roleId: number) {
    const url = '/api/MasterDesignationFacade/onloadgetdetails';
    const requestBody: OnloadGetDesignationDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMDES_Id: 0,
        MI_Id: 30,
        HRMDES_DesignationName: 'string',
        HRMDES_BasicAmount: 0,
        HRMDES_SanctionedSeats: 0,
        HRMDES_DisplaySanctionedSeatsFlag: false,
        HRMDES_Order: 0,
        HRMDES_ActiveFlag: true,
        designationlList: [],
        retrunMsg: 'string',
        roleId: roleId,
        DesignationDTO: []
    };
    return await api.post<MasterDesignationResponse>('hrms', url, requestBody);
}

export async function saveMasterDesignation(data: MasterDesignationInput) {
    const isEdit = data.HRMDES_Id && data.HRMDES_Id > 0;
    const url = '/api/MasterDesignationFacade';
    
    console.log('🟠 [API] saveMasterDesignation called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    
    const now = new Date().toISOString();
    const requestBody: SaveDesignationRequest = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMDES_Id: data.HRMDES_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRMDES_DesignationName: data.HRMDES_DesignationName,
        HRMDES_BasicAmount: data.HRMDES_BasicAmount,
        HRMDES_SanctionedSeats: data.HRMDES_SanctionedSeats,
        HRMDES_DisplaySanctionedSeatsFlag: data.HRMDES_DisplaySanctionedSeatsFlag,
        HRMDES_Order: data.HRMDES_Order ?? 0,
        HRMDES_ActiveFlag: data.HRMDES_ActiveFlag,
        designationlList: [
            {
                CreatedDate: now,
                UpdatedDate: now,
                HRMDES_Id: data.HRMDES_Id || 0,
                MI_Id: data.MI_Id || 30,
                HRMDES_DesignationName: data.HRMDES_DesignationName,
                HRMDES_BasicAmount: data.HRMDES_BasicAmount,
                HRMDES_SanctionedSeats: data.HRMDES_SanctionedSeats,
                HRMDES_DisplaySanctionedSeatsFlag: data.HRMDES_DisplaySanctionedSeatsFlag,
                HRMDES_Order: data.HRMDES_Order ?? 0,
                HRMDES_ActiveFlag: data.HRMDES_ActiveFlag
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30,
        DesignationDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body Order:', requestBody.HRMDES_Order);
    console.log('🟠 [API] Request Body designationlList[0].Order:', requestBody.designationlList[0]?.HRMDES_Order);
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterDesignationResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.HRMDES_Order:', (response as any)?.HRMDES_Order);
        console.log('🟢 [API] Response.designationlList[0]?.Order:', (response as any)?.designationlList?.[0]?.HRMDES_Order);
        
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const savedId = responseData?.HRMDES_Id || 0;
        const hasDesignationList = !!(responseData?.designationlList?.length > 0);
        
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add' || retrunMsg === 'Order';
        const isDuplicateError = retrunMsg === 'Duplicate';
        const isSuccess = (savedId > 0 || isUpdateSuccess || hasDesignationList) && !isDuplicateError;
        
        console.log('🟢 [API] Parsed - savedId:', savedId, 'retrunMsg:', retrunMsg, 'hasDesignationList:', hasDesignationList);
        console.log('🟢 [API] isSuccess:', isSuccess, 'isDuplicate:', isDuplicateError);
        
        const formattedResponse = {
            success: isSuccess,
            message: isDuplicateError 
                ? 'Designation already exists'
                : isSuccess 
                    ? (isEdit ? 'Designation updated successfully' : 'Designation added successfully')
                    : (retrunMsg || 'Failed to save designation'),
            data: responseData
        };
        
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Error occurred');
        console.error('🔴 [API] Error:', error);
        throw error;
    }
}

export async function activateDeactivateMasterDesignation(data: {
    HRMDES_Id: number;
    HRMDES_ActiveFlag: boolean;
    roleId?: number;
}) {
    const url = '/api/MasterDesignationFacade/deactivateRecordById';
    
    console.log('🟠 [API] activateDeactivateMasterDesignation called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Action:', data.HRMDES_ActiveFlag ? 'Activate' : 'Deactivate');
    
    const now = new Date().toISOString();
    const requestBody: SaveDesignationRequest = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMDES_Id: data.HRMDES_Id,
        MI_Id: 30,
        HRMDES_DesignationName: 'string',
        HRMDES_BasicAmount: 0,
        HRMDES_SanctionedSeats: 0,
        HRMDES_DisplaySanctionedSeatsFlag: true,
        HRMDES_Order: 0,
        HRMDES_ActiveFlag: data.HRMDES_ActiveFlag,
        designationlList: [],
        retrunMsg: 'string',
        roleId: data.roleId || 30,
        DesignationDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterDesignationResponse>('hrms', url, requestBody);
        console.log('🟢 [API] Toggle response:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        return response;
    } catch (error: any) {
        console.log('🔴 [API] Toggle error:', error);
        throw error;
    }
}

export async function getOnloadDesignationDetails(roleId: number) {
    const url = '/api/MasterDesignationFacade/onloadgetdetails';
    const requestBody: OnloadGetDesignationDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMDES_Id: 0,
        MI_Id: 30,
        HRMDES_DesignationName: 'string',
        HRMDES_BasicAmount: 0,
        HRMDES_SanctionedSeats: 0,
        HRMDES_DisplaySanctionedSeatsFlag: true,
        HRMDES_Order: 0,
        HRMDES_ActiveFlag: true,
        designationlList: [],
        retrunMsg: 'string',
        roleId,
        DesignationDTO: []
    };
    return await api.post<MasterDesignationResponse>('hrms', url, requestBody);
}

export async function getDesignationById(id: number) {
    const url = `/api/MasterDesignationFacade/getRecordById/${id}`;
    return await api.get<MasterDesignationResponse>('hrms', url);
}

export async function getOnchangeDesignationDetails(designationId: number, roleId: number) {
    const url = '/api/MasterDesignationFacade/Onchangedetails';
    const requestBody: OnloadGetDesignationDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMDES_Id: designationId,
        MI_Id: 30,
        HRMDES_DesignationName: 'string',
        HRMDES_BasicAmount: 0,
        HRMDES_SanctionedSeats: 0,
        HRMDES_DisplaySanctionedSeatsFlag: true,
        HRMDES_Order: 0,
        HRMDES_ActiveFlag: true,
        designationlList: [],
        retrunMsg: 'string',
        roleId,
        DesignationDTO: []
    };
    return await api.post<MasterDesignationResponse>('hrms', url, requestBody);
}

export async function saveMasterDesignationOrder(designations: DesignationDetail[]) {
    console.log('🟠 [API] saveMasterDesignationOrder called');
    console.log('🟠 [API] Number of designations to update:', designations.length);
    
    const url = '/api/MasterDesignationFacade';
    const now = new Date().toISOString();
    
    // Use designationlList array (same as save endpoint)
    const requestBody: SaveDesignationRequest = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMDES_Id: 0,
        MI_Id: 30,
        HRMDES_DesignationName: 'string',
        HRMDES_BasicAmount: 0,
        HRMDES_SanctionedSeats: 0,
        HRMDES_DisplaySanctionedSeatsFlag: false,
        HRMDES_Order: 0,
        HRMDES_ActiveFlag: true,
        designationlList: designations.map((des) => ({
            CreatedDate: des.CreatedDate || now,
            UpdatedDate: now,
            HRMDES_Id: des.HRMDES_Id,
            MI_Id: des.MI_Id || 30,
            HRMDES_DesignationName: des.HRMDES_DesignationName,
            HRMDES_BasicAmount: des.HRMDES_BasicAmount,
            HRMDES_SanctionedSeats: des.HRMDES_SanctionedSeats,
            HRMDES_DisplaySanctionedSeatsFlag: des.HRMDES_DisplaySanctionedSeatsFlag,
            HRMDES_Order: des.HRMDES_Order ?? 0,
            HRMDES_ActiveFlag: des.HRMDES_ActiveFlag
        })),
        retrunMsg: 'string',
        roleId: 30,
        DesignationDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] designationlList count:', requestBody.designationlList.length);
    
    try {
        const response = await api.post<MasterDesignationResponse>('hrms', url, requestBody);
        console.log('🟢 [API] saveMasterDesignationOrder success');
        return response;
    } catch (error: any) {
        console.log('🔴 [API] saveMasterDesignationOrder error:', error);
        throw error;
    }
}
