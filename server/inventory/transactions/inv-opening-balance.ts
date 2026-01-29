
'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IInvOpeningBalanceLoadData, IInvOpeningBalance } from '@/types/inventory/transactions/inv-opening-balance';

// Mock Data
const MOCK_STORES = [
    { invmsT_Id: 1, invmS_StoreName: 'Main Store' },
    { invmsT_Id: 2, invmS_StoreName: 'Sub Store' },
];

const MOCK_ITEMS = [
    { invmI_Id: 1, invmI_ItemName: 'Textbook - Math' },
    { invmI_Id: 2, invmI_ItemName: 'Notebook - Ruled' },
    { invmI_Id: 3, invmI_ItemName: 'Pen - Blue' },
];

const MOCK_OBS: IInvOpeningBalance[] = Array.from({ length: 25 }, (_, i) => ({
    invoB_Id: i + 1,
    invmsT_Id: i % 2 === 0 ? 1 : 2,
    invmS_StoreName: i % 2 === 0 ? 'Main Store' : 'Sub Store',
    invmI_Id: (i % 3) + 1,
    invmI_ItemName: MOCK_ITEMS[(i % 3)].invmI_ItemName,
    invmuoM_Id: 1,
    invmuoM_UOMName: 'Nos',
    invoB_BatchNo: `BATCH-${2024000 + i}`,
    invoB_PurchaseDate: new Date(2024, 0, i + 1).toISOString(),
    invoB_Qty: 10 + (i * 2),
    invoB_PurchaseRate: 50 + i,
    invoB_SaleRate: 70 + i,
    invoB_TAmount: (10 + (i * 2)) * (50 + i),
    invoB_Naration: `Opening Balance for ${MOCK_ITEMS[(i % 3)].invmI_ItemName}`,
    invoB_ActiveFlg: i % 5 !== 0,
}));

export async function getInvOpeningBalanceLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/api/INV_OpeningBalance/getloaddata?${urlParams}`;

    try {
        const response = await api.get<any>('inventory', url);

        const extractData = (res: any, key?: string) => {
            if (!res) return [];
            if (key && res.data?.[key] && Array.isArray(res.data[key])) return res.data[key];
            if (key && res[key] && Array.isArray(res[key])) return res[key];
            if (Array.isArray(res.data)) return res.data;
            if (Array.isArray(res)) return res;
            if (res.data?.$values) return res.data.$values;
            if (res.$values) return res.$values;
            if (key && res.data?.[key]?.$values) return res.data[key].$values;
            return [];
        };

        const rawOBs = extractData(response, 'get_openingbalance');
        const obList = rawOBs.map((item: any) => ({
            ...item,
            invoB_ActiveFlg: !!(item.invoB_ActiveFlg ?? item.INVOB_ActiveFlg ?? item.invob_activeflg)
        }));

        return {
            success: true,
            data: {
                get_openingbalance: obList,
                total: response.total || obList.length,
                get_Store: extractData(response, 'get_Store'),
                get_item: extractData(response, 'get_item')
            }
        };

    } catch (error) {
        console.error('Error fetching Opening Balance data:', error);
        return {
            success: false,
            data: {
                get_Store: [],
                get_item: [],
                get_openingbalance: [],
                total: 0,
            }
        };
    }
}

export async function saveInvOpeningBalance(data: any) {
    const url = `/INV_OpeningBalance/savedetails`;
    // return await api.post<any>('inventory', url, data);
    return {
        success: true,
        message: 'Record Saved Successfully (Mock)',
        returnval: true
    };
}

export async function deactiveInvOpeningBalance(data: any) {
    const url = `/INV_OpeningBalance/deactive`;
    // return await api.post<any>('inventory', url, data);
    return {
        success: true,
        message: 'Record Status Changed Successfully (Mock)',
        returnval: true
    };
}

export async function getSelectionItemDetails(data: { INVMI_Id: number }) {
    // Replicating "INV_T_GRN/getitemDetail" logic
    // Mock response
    return {
        get_itemDetail: [
            {
                invmuoM_Id: 1,
                invmuoM_UOMName: 'Nos', // Default mock UOM
            }
        ]
    };
}

export async function getOpeningBalanceDetails(data: { INVOB_Id: number }) {
    const ob = MOCK_OBS.find(o => o.invoB_Id === data.INVOB_Id);
    if (ob) {
        return {
            get_obdetails: [
                {
                    ...ob,
                    invstO_PurchaseRate: ob.invoB_PurchaseRate, // Mapping for form
                    invstO_SalesRate: ob.invoB_SaleRate,
                    qty: ob.invoB_Qty,
                }
            ]
        }
    }
    return { get_obdetails: [] };
}
