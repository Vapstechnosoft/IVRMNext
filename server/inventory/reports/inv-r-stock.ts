
'use server';

import { api } from '@/lib/apiService';
import { IInvRStockPayload, IInvRStockReportData } from '@/types/inventory/reports/inv-r-stock';

// MOCK DATA

const MOCK_ITEMS = [
    { invmI_Id: 101, invmI_ItemName: 'Notebook', invmI_ItemCode: 'NB001' },
    { invmI_Id: 102, invmI_ItemName: 'Pen', invmI_ItemCode: 'PE002' },
    { invmI_Id: 103, invmI_ItemName: 'Eraser', invmI_ItemCode: 'ER003' },
];

const MOCK_STORES = [
    { invmsT_Id: 201, invmS_StoreName: 'Main Store' },
    { invmsT_Id: 202, invmS_StoreName: 'Stationery Store' },
];

const MOCK_GROUPS = [
    { invmG_Id: 301, invmG_GroupName: 'Consumables' },
    { invmG_Id: 302, invmG_GroupName: 'Assets' },
];

const MOCK_STOCK_REPORT: IInvRStockReportData[] = [
    {
        invmI_ItemName: 'Notebook',
        purOBQty: 100,
        invstO_PurchaseRate: 15,
        obAmount: 1500,
        salesQty: 20,
        invstO_ItemConQty: 5,
        invstO_CheckedOutQty: 0,
        invstO_PhyPlusQty: 2,
        invstO_PhyMinQty: 0,
        invstO_AvaiableStock: 77
    },
    {
        invmI_ItemName: 'Pen',
        purOBQty: 200,
        invstO_PurchaseRate: 5,
        obAmount: 1000,
        salesQty: 50,
        invstO_ItemConQty: 10,
        invstO_CheckedOutQty: 0,
        invstO_PhyPlusQty: 0,
        invstO_PhyMinQty: 5,
        invstO_AvaiableStock: 135
    }
];

export async function getInvRStockDetails(optionflag: string) {
    // const response = await api.create('INV_R_Stock/getloaddata', { optionflag });

    let data: any[] = [];

    if (optionflag === 'Item') data = MOCK_ITEMS;
    else if (optionflag === 'Store') data = MOCK_STORES;
    else if (optionflag === 'Group') data = MOCK_GROUPS;
    // If 'All', maybe return nothing or a summary? Angular calls it with All initially but doesn't seem to use the 'get_stockdetails' unless an option is clicked for filtering?
    // Actually, the Angular code toggles visibility. If All, filter dropdowns are hidden or user can just run report.

    return {
        success: true,
        data: {
            get_stockdetails: data
        }
    };
}

export async function getInvRStockReport(payload: IInvRStockPayload) {
    // const response = await api.create('INV_R_Stock/onreport', payload);
    return {
        success: true,
        data: {
            get_StockReport: MOCK_STOCK_REPORT
        },
        message: 'Report generated successfully'
    };
}
