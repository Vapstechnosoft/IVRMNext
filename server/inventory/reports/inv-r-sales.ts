
'use server';

import { api } from '@/lib/apiService';
import { IInvRSalesEntity, IInvRSalesPayload, IInvRSalesReportData } from '@/types/inventory/reports/inv-r-sales';

// MOCK DATA

const MOCK_SALES_NO = [
    { invmsL_Id: 1, invmsL_SalesNo: 'SALE001' },
    { invmsL_Id: 2, invmsL_SalesNo: 'SALE002' },
];

const MOCK_ITEMS = [
    { invmI_Id: 101, invmI_ItemName: 'Notebook' },
    { invmI_Id: 102, invmI_ItemName: 'Pencil Box' },
];

const MOCK_CUSTOMERS = [
    { invmC_Id: 201, invmC_CustomerName: 'Walk-in Customer' },
    { invmC_Id: 202, invmC_CustomerName: 'Registered Parent' },
];

const MOCK_STAFF = [
    { hrmE_Id: 301, employeename: 'Teacher A' },
    { hrmE_Id: 302, employeename: 'Admin Staff B' },
];

const MOCK_STUDENTS_ALL = [
    { amsT_Id: 401, studentname: 'John Doe', amsT_AdmNo: 'ADM001' },
    { amsT_Id: 402, studentname: 'Jane Smith', amsT_AdmNo: 'ADM002' },
];

const MOCK_CLASSES = [
    { asmcL_Id: 1, asmcL_ClassName: 'Class 1' },
    { asmcL_Id: 2, asmcL_ClassName: 'Class 2' },
];

const MOCK_SECTIONS = [
    { asmS_Id: 1, asmC_SectionName: 'A' },
    { asmS_Id: 2, asmC_SectionName: 'B' },
];

const MOCK_STUDENTS_IN_CLASS = [
    { amsT_Id: 401, studentname: 'John Doe', amsT_AdmNo: 'ADM001', asmcL_Id: 1, asmS_Id: 1 },
    { amsT_Id: 402, studentname: 'Jane Smith', amsT_AdmNo: 'ADM002', asmcL_Id: 1, asmS_Id: 2 },
];

const MOCK_REPORT_DATA: IInvRSalesReportData[] = [
    {
        rowNumber: 1, invmsL_SalesNo: 'SALE001', invmsL_SalesDate: '2023-11-01', invmI_ItemName: 'Notebook',
        invtsL_SalesQty: 2, invtsL_SalesPrice: 50, invtsL_DiscountAmt: 0, invtsL_TaxAmt: 5, invtsL_Amount: 105,
        membername: 'John Doe', amsT_AdmNo: 'ADM001',
        saleQty: 2, salePrice: 50, saleDiscount: 0, saleTax: 5, saleAmount: 105
    },
    {
        rowNumber: 2, invmsL_SalesNo: 'SALE002', invmsL_SalesDate: '2023-11-02', invmI_ItemName: 'Pencil Box',
        invtsL_SalesQty: 1, invtsL_SalesPrice: 100, invtsL_DiscountAmt: 10, invtsL_TaxAmt: 10, invtsL_Amount: 100,
        membername: 'Jane Smith', amsT_AdmNo: 'ADM002',
        saleQty: 1, salePrice: 100, saleDiscount: 10, saleTax: 10, saleAmount: 100
    }
];

export async function getInvRSalesLoadData() {
    // const response = await api.get('INV_R_Sales/getloaddata/2');
    return {
        success: true,
        data: {
            get_salesno: MOCK_SALES_NO
        }
    };
}

export async function getInvRSalesDetails(optionflag: string) {
    // const response = await api.post('INV_R_Sales/mainradiochange', { type: optionflag });
    let data: any = [];

    if (optionflag === 'Item') data = MOCK_ITEMS;
    else if (optionflag === 'Staff') data = MOCK_STAFF;
    else if (optionflag === 'Customer') data = MOCK_CUSTOMERS;
    else if (optionflag === 'Student') data = MOCK_STUDENTS_ALL; // For ui-select
    else if (optionflag === 'Saleno') data = MOCK_SALES_NO;

    return {
        success: true,
        data: {
            get_salesdetails: data
        }
    };
}

export async function getInvRSalesClassData() {
    // const response = await api.post('INV_R_Sales/radiochange', { type: individualflag }); 
    // Usually individualflag is passed, but mock just returns classes
    return {
        success: true,
        data: {
            get_class: MOCK_CLASSES
        }
    };
}

export async function getInvRSalesStudentList(payload: any) {
    // Payload has ASMCL_Id, type, potentially ASMS_Id
    // const response = await api.post('INV_R_Sales/getStudentlist', payload);

    if (payload.type === 'CS' && !payload.ASMS_Id) {
        // Return sections for the class
        return {
            success: true,
            data: {
                get_Section: MOCK_SECTIONS,
                get_Studentlist: []
            }
        };
    } else {
        // Return students
        return {
            success: true,
            data: {
                get_Section: [],
                get_Studentlist: MOCK_STUDENTS_IN_CLASS
            }
        };
    }
}

export async function getInvRSalesReport(payload: IInvRSalesPayload) {
    // const response = await api.post('INV_R_Sales/onreport', payload);
    return {
        success: true,
        data: {
            get_SalesReport: MOCK_REPORT_DATA
        },
        message: 'Report Generated Successfully'
    };
}
