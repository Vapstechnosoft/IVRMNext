
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
    const url = `/INV_OpeningBalance/getloaddata?${urlParams}`;

    try {
        // Commenting out real API call for now to use mock data
        // const response = await api.get<IInvOpeningBalanceLoadData>('inventory', url);

        const page = Number(searchParams?.page) || 1;
        const pageSize = Number(searchParams?.page_size) || 10;
        const total = MOCK_OBS.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedData = MOCK_OBS.slice(start, end);

        return {
            success: true,
            message: 'Data fetched successfully (Mock)',
            data: {
                get_Store: MOCK_STORES,
                get_item: MOCK_ITEMS,
                get_openingbalance: paginatedData,
                total: total,
            }
        };

    } catch (error) {
        console.error('Error fetching Opening Balance data:', error);
        return {
            success: false,
            message: 'Failed to fetch data',
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
