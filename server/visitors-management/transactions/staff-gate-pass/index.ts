'use server';
import type { ApiResponse } from '@/lib/apiService';
import type { StaffGatePassInitialData } from '@/types/visitors-management/transactions';

export async function getStaffGatePassData(): Promise<ApiResponse<StaffGatePassInitialData>> {
    const mockData: StaffGatePassInitialData = {
        emplist: [
            { hrmE_Id: 101, empname: 'John Staff', hrmD_Id: 1, hrmdeS_Id: 2 },
            { hrmE_Id: 102, empname: 'Jane Teacher', hrmD_Id: 2, hrmdeS_Id: 3 }
        ],
        filldepartment: [
            { hrmD_Id: 1, hrmD_DepartmentName: 'Administration' },
            { hrmD_Id: 2, hrmD_DepartmentName: 'Teaching' }
        ],
        filldesignation: [
            { hrmdeS_Id: 2, hrmdeS_DesignationName: 'Admin Officer' },
            { hrmdeS_Id: 3, hrmdeS_DesignationName: 'Senior Teacher' }
        ],
        alldata: [
            {
                gphsT_Id: 1,
                hrmE_Id: 101,
                empname: 'John Staff',
                hrmD_DepartmentName: 'Administration',
                hrmdeS_DesignationName: 'Admin Officer',
                gphsT_GatePassNo: 'GP-2023-001',
                gphsT_DateTime: new Date().toISOString(),
                gphsT_OutTime: '14:30',
                gphsT_Remarks: 'Going to bank',
                gphsT_ActiveFlg: true,
                hrmD_Id: 1,
                hrmdeS_Id: 2
            }
        ]
    };

    return {
        success: true,
        message: 'Data fetched successfully',
        data: mockData
    };
}

export async function saveStaffGatePass(data: any): Promise<ApiResponse<any>> {
    console.log('Saving Staff Gate Pass:', data);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
        success: true,
        message: 'Gate Pass Generated Successfully!!!',
        data: null
    };
}

export async function deactivateStaffGatePass(gphsT_Id: number): Promise<ApiResponse<any>> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
        success: true,
        message: 'Status Changed Successfully!!!',
        data: null
    };
}
