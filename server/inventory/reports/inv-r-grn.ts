
'use server';

import { api } from '@/lib/apiService';
import { IInvRGRNLoadData, IInvRGRNPayload, IInvRGRNReportData } from '@/types/inventory/reports/inv-r-grn';

// Mock Data for development
const MOCK_GRNS = [
    { invmgrN_Id: 1, invmgrN_GRNNo: 'GRN001', checked: false },
    { invmgrN_Id: 2, invmgrN_GRNNo: 'GRN002', checked: false },
    { invmgrN_Id: 3, invmgrN_GRNNo: 'GRN003', checked: false },
];

const MOCK_ITEMS = [
    { invmI_Id: 101, invmI_ItemName: 'Textbook Math', checked: false, invmI_ItemCode: 'ITM101' },
    { invmI_Id: 102, invmI_ItemName: 'Notebook A4', checked: false, invmI_ItemCode: 'ITM102' },
    { invmI_Id: 103, invmI_ItemName: 'Pen Blue', checked: false, invmI_ItemCode: 'ITM103' },
];

const MOCK_SUPPLIERS = [
    { invmS_Id: 201, invmS_SupplierName: 'ABC stationery', checked: false, invmS_SupplierCode: 'SUP201', invmS_SupplierConatctNo: '9876543210', invmS_EmailId: 'abc@example.com' },
    { invmS_Id: 202, invmS_SupplierName: 'XYZ Books', checked: false, invmS_SupplierCode: 'SUP202', invmS_SupplierConatctNo: '1234567890', invmS_EmailId: 'xyz@example.com' },
];

const MOCK_REPORT_DATA: IInvRGRNReportData[] = [
    {
        invmgrN_PurchaseDate: '2023-10-01',
        invmgrN_GRNNo: 'GRN001',
        invmS_SupplierName: 'ABC stationery',
        invmI_ItemName: 'Textbook Math',
        invmuoM_UOMName: 'Nos',
        invtgrN_Qty: 100,
        invtgrN_PurchaseRate: 250,
        invtgrN_MRP: 300,
        invtgrN_SalesPrice: 280,
        invtgrN_DiscountAmt: 500,
        invtgrN_TaxAmt: 1250,
        invtgrN_Amount: 25750,
        invtgrN_BatchNo: 'B001',
        // Overall fields
        grnQuantity: 100,
        grnRate: 250,
        grnMRP: 300,
        grnSalePrice: 280,
        grnDiscount: 500,
        grnTax: 1250,
        grnAmount: 25750,
        invmI_ItemCode: 'ITM101',
        invmS_SupplierCode: 'SUP201',
        invmS_SupplierConatctNo: '9876543210',
        invmS_EmailId: 'abc@example.com'
    },
    {
        invmgrN_PurchaseDate: '2023-10-05',
        invmgrN_GRNNo: 'GRN002',
        invmS_SupplierName: 'XYZ Books',
        invmI_ItemName: 'Notebook A4',
        invmuoM_UOMName: 'Nos',
        invtgrN_Qty: 500,
        invtgrN_PurchaseRate: 40,
        invtgrN_MRP: 50,
        invtgrN_SalesPrice: 45,
        invtgrN_DiscountAmt: 200,
        invtgrN_TaxAmt: 1000,
        invtgrN_Amount: 20800,
        invtgrN_BatchNo: 'B002',
        // Overall fields
        grnQuantity: 500,
        grnRate: 40,
        grnMRP: 50,
        grnSalePrice: 45,
        grnDiscount: 200,
        grnTax: 1000,
        grnAmount: 20800,
        invmI_ItemCode: 'ITM102',
        invmS_SupplierCode: 'SUP202',
        invmS_SupplierConatctNo: '1234567890',
        invmS_EmailId: 'xyz@example.com'
    }
];


const extractData = (res: any, key?: string) => {
    if (!res) return [];
    const data = res.data ?? res;
    if (key && data[key]) {
        if (Array.isArray(data[key])) return data[key];
        if (data[key].$values) return data[key].$values;
    }
    if (Array.isArray(data)) return data;
    if (data.$values) return data.$values;
    return [];
};

export async function getInvRGRNLoadData(optionflag: string) {
    if (!optionflag) return { success: true, data: { get_grn_item_supplier: [], get_grnreport: [] } };

    const url = `/INV_R_GRNFacade/getloaddata?flg=${optionflag}`;

    try {
        // Using POST as per C# [HttpPost] attribute
        const response = await api.post<any>('inventory', url, {});
        const rawData = extractData(response, 'data');

        let mappedData: any[] = [];

        if (optionflag === 'Item_1') {
            mappedData = rawData.map((item: any) => ({
                invmI_Id: item.id,
                invmI_ItemName: item.name,
                invmI_ItemCode: item.code, // Potential extra field
                ...item
            }));
        } else if (optionflag === 'Supplier') {
            mappedData = rawData.map((item: any) => ({
                invmS_Id: item.id,
                invmS_SupplierName: item.name,
                invmS_SupplierCode: item.code,
                ...item
            }));
        } else if (optionflag === 'Individual_1') {
            // Assuming similar pattern for GRN
            mappedData = rawData.map((item: any) => ({
                invmgrN_Id: item.id,
                invmgrN_GRNNo: item.name,
                ...item
            }));
        } else {
            mappedData = rawData;
        }

        return {
            success: true,
            data: {
                get_grn_item_supplier: mappedData,
                get_grnreport: []
            },
            message: 'Data loaded successfully'
        };
    } catch (error) {
        console.error("Error loading GRN data:", error);
        return {
            success: false,
            data: {
                get_grn_item_supplier: [],
                get_grnreport: []
            },
            message: 'Failed to load data'
        };
    }
}

import { getSearchParamsUrl } from '@/lib/apiService';
import { ApiSearchparams } from '@/types';

export async function getInvRGRNReport(payload: IInvRGRNPayload, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_R_GRNFacade/onreport?${urlParams}`;

    try {
        const response = await api.post<any>('inventory', url, payload);
        return {
            success: response.success ?? true,
            data: {
                get_grnreport: extractData(response, 'data'),
                get_grn_item_supplier: []
            },
            total: response.total ?? 0,
            page: response.page ?? 1,
            page_size: response.page_size ?? 10,
            message: response.message || 'Report generated successfully'
        };
    } catch (error: any) {
        console.error("Error generating GRN Report:", error);
        return {
            success: false,
            data: {
                get_grnreport: [],
                get_grn_item_supplier: []
            },
            total: 0,
            message: error.response?.data?.message || error.message || 'Failed to generate report'
        };
    }
}
