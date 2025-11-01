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
    const url = '/api/MasterDesignationFacade';
    const requestBody: SaveDesignationRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMDES_Id: data.HRMDES_Id || 0,
        MI_Id: 30,
        HRMDES_DesignationName: data.HRMDES_DesignationName,
        HRMDES_BasicAmount: data.HRMDES_BasicAmount,
        HRMDES_SanctionedSeats: data.HRMDES_SanctionedSeats,
        HRMDES_DisplaySanctionedSeatsFlag: data.HRMDES_DisplaySanctionedSeatsFlag,
        HRMDES_Order: data.HRMDES_Order || 0,
        HRMDES_ActiveFlag: data.HRMDES_ActiveFlag,
        designationlList: [],
        retrunMsg: 'string',
        roleId: data.MI_Id || 0,
        DesignationDTO: []
    };
    return await api.post<MasterDesignationResponse>('hrms', url, requestBody);
}

export async function activateDeactivateMasterDesignation(data: {
    HRMDES_Id: number;
    HRMDES_ActiveFlag: boolean;
    roleId?: number;
}) {
    const url = '/api/MasterDesignationFacade/deactivateRecordById';
    const requestBody: SaveDesignationRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
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
        roleId: data.roleId || 0,
        DesignationDTO: []
    };
    return await api.post<MasterDesignationResponse>('hrms', url, requestBody);
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
    const url = '/api/MasterDesignationFacade';
    const requestBody: SaveDesignationRequest = {
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
        roleId: 0,
        DesignationDTO: designations.map((des) => des.HRMDES_DesignationName)
    };
    return await api.post<MasterDesignationResponse>('hrms', url, requestBody);
}
