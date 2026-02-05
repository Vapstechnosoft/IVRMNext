/**
 * Master Leave API Types
 * Types for the Master Leave Management API endpoints
 */

/**
 * Request payload for GetLeave endpoint
 * POST /api/MasterLeaveWrapperFacade/GetLeave
 */
export interface MasterLeaveGetRequest {
    MI_Id: number;
    HRML_Id: number;
}

/**
 * Leave Type dropdown item from master_eventlist
 */
export interface LeaveTypeDropdownItem {
    value: string;
    label: string;
    [key: string]: any;
}

/**
 * Leave Order dropdown item from leaveorderlist
 */
export interface LeaveOrderDropdownItem {
    value: number;
    label: string;
    [key: string]: any;
}

/**
 * Response data structure from GetLeave endpoint
 */
export interface MasterLeaveGetResponseData {
    edit_m_event: any | null;
    leaveData: any | null;
    dupr: boolean;
    selected_master_event: any | null;
    returnduplicatestatus: any | null;
    returnval_Update: boolean;
    returnval_add: boolean;
    retrunMsg: string | null;
    returnval: boolean;
    HRML_Id: number;
    MI_Id: number;
    HRML_LeaveName: string | null;
    HRML_LeaveCode: string | null;
    HRML_LeaveDetails: string | null;
    master_eventlist: LeaveTypeDropdownItem[] | any[] | null;
    HRML_LeaveCreditFlg: boolean;
    HRML_LeaveType: string | null;
    message: string | null;
    HRML_LateDeductFlag: boolean;
    GridviewDetails: any | null;
    leavelistedit: any | null;
    HRML_LateDeductOrder: number;
    SelectedRowDetails: any | null;
    MasterLeaveDTOO: any | null;
    leaveorderlist: LeaveOrderDropdownItem[] | any[] | null;
    CreatedDate: string | null;
    UpdatedDate: string | null;
}

/**
 * Full API response structure
 */
export interface MasterLeaveGetResponse {
    success: boolean;
    message: string;
    data: MasterLeaveGetResponseData;
    total: number | null;
    page: number | null;
    page_size: number | null;
}

/**
 * Request payload for Save/Update Leave endpoint
 * POST /api/MasterLeaveWrapperFacade/SaveLeave (or similar)
 */
export interface MasterLeaveSaveRequest {
    MI_Id: number;
    HRML_Id: number;
    HRML_LeaveName: string;
    HRML_LeaveCode: string;
    HRML_LeaveDetails: string;
    HRML_LeaveCreditFlg: boolean;
    HRML_LeaveType: string;
    HRML_LateDeductFlag: boolean;
    HRML_LateDeductOrder: number;
    CreatedDate?: string;
    UpdatedDate?: string;
}

/**
 * Response from Save/Update Leave endpoint
 */
export interface MasterLeaveSaveResponse {
    success: boolean;
    message: string;
    data: MasterLeaveGetResponseData | null;
    retrunMsg?: string;
    returnval?: boolean;
    returnval_add?: boolean;
    returnval_Update?: boolean;
}

/**
 * Master Leave DTO for validation
 */
export interface MasterLeaveDTOO {
    MI_Id: number;
    HRML_Id: number;
}

/**
 * Request payload for ValidateOrderNumber endpoint
 * POST /api/MasterLeaveWrapperFacade/ValidateOrderNumber
 */
export interface MasterLeaveValidateOrderRequest {
    MasterLeaveDTOO: MasterLeaveDTOO[];
}

/**
 * Response from ValidateOrderNumber endpoint
 */
export interface MasterLeaveValidateOrderResponse {
    success: boolean;
    message: string;
    data: any;
    retrunMsg?: string;
    returnval?: boolean;
}

/**
 * Request payload for DeletePages endpoint
 * POST /api/MasterLeaveWrapperFacade/DeletePages
 */
export interface MasterLeaveDeleteRequest {
    HRML_Id: number;
}

/**
 * Response from DeletePages endpoint
 */
export interface MasterLeaveDeleteResponse {
    success: boolean;
    message: string;
    data: any;
    retrunMsg?: string;
    returnval?: boolean;
}

