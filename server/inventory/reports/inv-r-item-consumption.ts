
'use server';

import { api } from '@/lib/apiService';
import { IInvRItemConsumptionPayload, IInvRItemConsumptionReportData } from '@/types/inventory/reports/inv-r-item-consumption';

// MOCK DATA

const MOCK_ITEMS = [
    { invmI_Id: 101, invmI_ItemName: 'A4 Paper', invmI_ItemCode: 'PAP001' },
    { invmI_Id: 102, invmI_ItemName: 'Marker Pen', invmI_ItemCode: 'MAR002' },
];

const MOCK_STAFF = [
    { hrmE_Id: 201, employeename: 'Alice Teacher', hrmE_EmployeeCode: 'TC001' },
    { hrmE_Id: 202, employeename: 'Bob Admin', hrmE_EmployeeCode: 'AD002' },
];

const MOCK_DEPARTMENTS = [
    { hrmD_Id: 301, hrmD_DepartmentName: 'Science Dept' },
    { hrmD_Id: 302, hrmD_DepartmentName: 'Admin Dept' },
];

const MOCK_STUDENTS = [
    { amsT_Id: 401, studentname: 'Charlie Student', amsT_AdmNo: 'ST001' },
    { amsT_Id: 402, studentname: 'David Student', amsT_AdmNo: 'ST002' },
];

const MOCK_REPORT_DATA_ALL: IInvRItemConsumptionReportData[] = [
    { invmI_ItemName: 'A4 Paper', invmUOM_UOMName: 'Ream', invmiC_ICDate: '2023-11-01', invtiC_ICQty: 5, invtiC_Naration: 'Exam Printing' },
    { invmI_ItemName: 'Marker Pen', invmUOM_UOMName: 'Box', invmiC_ICDate: '2023-11-05', invtiC_ICQty: 2, invtiC_Naration: 'Classroom Use' },
];

const MOCK_REPORT_DATA_OVERALL_ITEM: IInvRItemConsumptionReportData[] = [
    { invmI_ItemName: 'A4 Paper', invmI_ItemCode: 'PAP001', icQty: 50 },
    { invmI_ItemName: 'Marker Pen', invmI_ItemCode: 'MAR002', icQty: 20 },
];

export async function getInvRItemConsumptionLoadData(optionflag: string) {
    // const response = await api.create('INV_ItemConsumptionReport/getloaddata', { optionflag });

    // Angular code reloads data based on optionflag changes mainly to populate the specific list?
    // Actually, Angular's loaddata() just fetches 'get_ICreportdetails'. 
    // The backend likely returns different list based on optionflag.

    let data: any[] = [];

    if (optionflag === 'Item') data = MOCK_ITEMS;
    else if (optionflag === 'Staff') data = MOCK_STAFF;
    else if (optionflag === 'Department') data = MOCK_DEPARTMENTS;
    else if (optionflag === 'Student') data = MOCK_STUDENTS;
    else {
        // All might return items? or nothing? Code says:
        // ng-init="typeflag='All'" -> defaults.
        // The UI doesn't show any list when 'All' is selected. 
        // Only when Overall/Detailed is selected, the sub-radios appear.
        data = [];
    }

    return {
        success: true,
        data: {
            get_ICreportdetails: data
        }
    };
}

export async function getInvRItemConsumptionReport(payload: IInvRItemConsumptionPayload) {
    // const response = await api.create('INV_ItemConsumptionReport/onreport', payload);

    // Return different mock data based on payload for demo purposes
    let reportData = MOCK_REPORT_DATA_ALL;
    if (payload.typeflag === 'Overall' && payload.optionflag === 'Item') {
        reportData = MOCK_REPORT_DATA_OVERALL_ITEM;
    }

    return {
        success: true,
        data: {
            get_ICReport: reportData
        },
        message: 'Report generated successfully'
    };
}
