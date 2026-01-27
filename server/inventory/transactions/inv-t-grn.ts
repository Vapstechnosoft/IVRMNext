'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IInvTGRNLoadData } from '@/types/inventory/transactions/inv-t-grn';

export async function getInvTGRNLoadData(searchParams?: ApiSearchparams) {
    console.log("getInvTGRNLoadData: TRIGGERED (POST Mode).");
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const grnUrl = `/api/INV_T_GRNFacade/getloaddata?${urlParams}`;

    // Dropdown URLs
    const itemUrl = `/api/INV_MasterItemFacade/getloaddata`;
    const storeUrl = `/api/INV_MasterStoreFacade/GetStoreList`;
    const supplierUrl = `/api/INV_MasterSupplierFacade/getloaddata`;
    const taxUrl = `/api/INV_MasterItemFacade/get_taxlist`;

    try {
        console.log(`getInvTGRNLoadData: Fetching GRN from ${grnUrl} (GET)`);

        const [grnRes, itemRes, storeRes, supplierRes, taxRes] = await Promise.all([
            api.get<any>('inventory', grnUrl),
            api.post<any>('inventory', itemUrl, {}).catch(e => { console.error("Item fetch failed", e); return { data: [] }; }),
            api.post<any>('inventory', storeUrl, {}).catch(e => { console.error("Store fetch failed", e); return { data: [] }; }),
            api.post<any>('inventory', supplierUrl, {}).catch(e => { console.error("Supplier fetch failed", e); return { data: [] }; }),
            api.post<any>('inventory', taxUrl, {}).catch(e => { console.error("Tax fetch failed", e); return { data: [] }; })
        ]);

        const extractData = (res: any, key?: string) => {
            if (!res) return [];
            // Handle specific key in .data
            if (key && res.data?.[key] && Array.isArray(res.data[key])) return res.data[key];
            // Handle specific key in root
            if (key && res[key] && Array.isArray(res[key])) return res[key];
            // Handle 'data' is array
            if (Array.isArray(res.data)) return res.data;
            // Handle root is array
            if (Array.isArray(res)) return res;
            // Handle $values
            if (res.data?.$values) return res.data.$values;
            if (res.$values) return res.$values;
            // Handle specific key $values
            if (key && res.data?.[key]?.$values) return res.data[key].$values;

            return [];
        };

        const rawGRNs = extractData(grnRes, 'get_GRN') || extractData(grnRes);
        console.log(`getInvTGRNLoadData: Loaded ${rawGRNs.length} GRN records`);

        const grnList = rawGRNs.map((item: any) => ({
            invmgrN_Id: item.invmgrN_Id || item.INVMGRN_Id || 0,
            invmgrN_GRNNo: item.invmgrN_GRNNo || item.INVMGRN_GRNNo || '',
            invmgrN_InvoiceNo: item.invmgrN_InvoiceNo || item.INVMGRN_InvoiceNo || '',
            invmgrN_PurchaseDate: item.invmgrN_PurchaseDate || item.INVMGRN_PurchaseDate || new Date().toISOString(),
            invmgrN_PurchaseValue: item.invmgrN_PurchaseValue || item.INVMGRN_PurchaseValue || 0,
            invmgrN_TotDiscount: item.invmgrN_TotDiscount || item.INVMGRN_TotDiscount || 0,
            invmgrN_TotTaxAmt: item.invmgrN_TotTaxAmt || item.INVMGRN_TotTaxAmt || 0,
            invmgrN_TotalAmount: item.invmgrN_TotalAmount || item.INVMGRN_TotalAmount || 0,
            invmgrN_Remarks: item.invmgrN_Remarks || item.INVMGRN_Remarks || '',
            invmgrN_ReturnFlg: !!(item.invmgrN_ReturnFlg ?? item.INVMGRN_ReturnFlg),
            invmgrN_PaidFlg: !!(item.invmgrN_PaidFlg ?? item.INVMGRN_PaidFlg),
            invmgrN_CreditFlg: !!(item.invmgrN_CreditFlg ?? item.INVMGRN_CreditFlg),
            invmsT_Id: item.invmsT_Id || item.INVMST_Id || 0,
            invmS_Id: item.invmS_Id || item.INVMS_Id || 0,
            invmgrN_POReference: item.invmgrN_POReference || item.INVMGRN_POReference || '',
            invmgrN_EWayBillRef: item.invmgrN_EWayBillRef || item.INVMGRN_EWayBillRef || '',
            invmgrN_TowardsProjects: item.invmgrN_TowardsProjects || item.INVMGRN_TowardsProjects || '',
            invmgrN_PODate: item.invmgrN_PODate || item.INVMGRN_PODate,
            invmgrN_Prepared: item.invmgrN_Prepared || item.INVMGRN_Prepared || '',
            invmgrN_SignedBy: item.invmgrN_SignedBy || item.INVMGRN_SignedBy || '',
            invmgrN_ChallanNo: item.invmgrN_ChallanNo || item.INVMGRN_ChallanNo || '',
            invmgrN_Challandate: item.invmgrN_Challandate || item.INVMGRN_Challandate,
            invmgrN_Challanverfied: item.invmgrN_Challanverfied || item.INVMGRN_Challanverfied || '',
            invmgrN_KitNo: item.invmgrN_KitNo || item.INVMGRN_KitNo || '',
            invmgrN_ActiveFlg: !!(item.invmgrN_ActiveFlg ?? item.INVMGRN_ActiveFlg ?? item.INVTGRN_ActiveFlg ?? item.invtgrN_ActiveFlg ?? item.invtgrn_activeflg),
            invtgrN_ActiveFlg: !!(item.invmgrN_ActiveFlg ?? item.INVMGRN_ActiveFlg ?? item.INVTGRN_ActiveFlg ?? item.invtgrN_ActiveFlg ?? item.invtgrn_activeflg),
            invmS_StoreName: item.invmS_StoreName || item.INVMS_StoreName || '',
            invmS_SupplierName: item.invmS_SupplierName || item.INVMS_SupplierName || ''
        }));

        return {
            success: true,
            data: {
                get_GRN: grnList,
                get_item: extractData(itemRes, 'get_item'),
                get_Store: extractData(storeRes, 'get_store') || extractData(storeRes, 'get_Store'),
                get_supplier: extractData(supplierRes, 'get_supplier'),
                get_tax: extractData(taxRes, 'get_taxlist'),
                total: grnRes.total || grnList.length
            }
        } as any;

    } catch (error: any) {
        console.error('getInvTGRNLoadData: FAILED', error);
        return {
            success: false,
            data: {
                get_GRN: [],
                get_item: [],
                get_Store: [],
                get_supplier: [],
                get_tax: [],
                total: 0
            }
        };
    }
}

export async function saveInvTGRNDetails(data: any) {
    const url = `/api/INV_T_GRNFacade/savegrn`;

    // Transform data to match DTO properties (PascalCase)
    const payload = {
        INVMGRN_Id: data.invmgrN_Id,
        INVMGRN_GRNNo: data.invmgrN_GRNNo,
        INVMGRN_InvoiceNo: data.invmgrN_InvoiceNo,
        INVMGRN_PurchaseDate: data.invmgrN_PurchaseDate,
        INVMGRN_PurchaseValue: data.invmgrN_PurchaseValue,
        INVMGRN_TotDiscount: data.invmgrN_TotDiscount,
        INVMGRN_TotTaxAmt: data.invmgrN_TotTaxAmt,
        INVMGRN_TotalAmount: data.invmgrN_TotalAmount,
        INVMGRN_Remarks: data.invmgrN_Remarks,
        INVMGRN_ReturnFlg: data.invmgrN_ReturnFlg,
        INVMGRN_PaidFlg: data.invmgrN_PaidFlg,
        INVMGRN_CreditFlg: data.invmgrN_CreditFlg,
        INVMST_Id: data.invmsT_Id,
        INVMS_Id: data.invmS_Id,
        INVMGRN_POReference: data.invmgrN_POReference,
        INVMGRN_EWayBillRef: data.invmgrN_EWayBillRef,
        INVMGRN_TowardsProjects: data.invmgrN_TowardsProjects,
        INVMGRN_PODate: data.invmgrN_PODate,
        INVMGRN_Prepared: data.invmgrN_Prepared,
        INVMGRN_SignedBy: data.invmgrN_SignedBy,
        INVMGRN_ChallanNo: data.invmgrN_ChallanNo,
        INVMGRN_Challandate: data.invmgrN_Challandate,
        INVMGRN_Challanverfied: data.invmgrN_Challanverfied,
        INVMGRN_KitNo: data.invmgrN_KitNo,
        trans_id: data.invmgrN_GRNNo, // Map GRNNo to trans_id as requested by backend logic

        // Map Items
        GRNItem: data.GRNItem?.map((item: any) => ({
            INVTGRN_Id: item.invtgrN_Id,
            INVMGRN_Id: item.invmgrN_Id,
            INVMI_Id: item.invmI_Id,
            INVMUOM_Id: item.invmuoM_Id,
            INVTGRN_BatchNo: item.invtgrN_BatchNo,
            INVTGRN_Qty: item.invtgrN_Qty,
            INVTGRN_MfgDate: item.invtgrN_MfgDate,
            INVTGRN_ExpDate: item.invtgrN_ExpDate,
            INVTGRN_PurchaseRate: item.invtgrN_PurchaseRate,
            INVTGRN_MRP: item.invtgrN_MRP,
            INVTGRN_DiscountAmt: item.invtgrN_DiscountAmt,
            INVTGRN_SalesPrice: item.invtgrN_SalesPrice,
            INVTGRN_Amount: item.invtgrN_Amount,
            INVTGRN_Naration: item.invtgrN_Naration,
            INVTGRN_TaxAmt: item.invtgrN_TaxAmt,
            INVTGRN_ActiveFlg: true,

            // Map Taxes within Item
            GRNItemTax: item.GRNItemTax?.map((tax: any) => ({
                INVTGRNT_Id: tax.invtgrnT_Id,
                INVTGRN_Id: tax.invtgrN_Id,
                INVMT_Id: tax.invmT_Id,
                INVTGRNT_TaxPer: tax.invtgrnT_TaxPer,
                INVTGRNT_TaxAmt: tax.invtgrnT_TaxAmt,
                INVTGRNT_ActiveFlg: true
            })) || []
        })) || []
    };

    return await api.get<any>('inventory', url, { params: payload });
}

export async function deleteInvTGRN(data: any) {
    const url = `/api/INV_T_GRNFacade/GRN_Delete`;
    return await api.post<any>('inventory', url, data);
}

export async function toggleInvTGRNActive(data: any) {
    const id = data.invmgrN_Id || data.INVMGRN_Id;
    const url = `/api/INV_T_GRNFacade/deactive?id=${id}`;
    return await api.post<any>('inventory', url, {});
}

export async function getInvTGRNItemTax(invtgrN_Id: number) {
    const data = { INVTGRN_Id: invtgrN_Id };
    const url = `/api/INV_T_GRNFacade/get_itemtax`;
    return await api.post<any>('inventory', url, data);
}

export async function getInvTGRNItemDetails(invmgrN_Id: number) {
    const data = { INVMGRN_Id: invmgrN_Id };
    const url = `/api/INV_T_GRNFacade/get_GRNitemDetails`;
    return await api.post<any>('inventory', url, data);
}

export async function getInvTGRNEditDetails(invmgrN_Id: number) {
    const data = { INVMGRN_Id: invmgrN_Id };
    const url = `/api/INV_T_GRNFacade/Edit_GRN_details`;
    return await api.post<any>('inventory', url, data);
}

export async function getInvTGRNItemTaxDetail(id: number) {
    const url = `/api/INV_T_GRNFacade/getItemTaxDetail?id=${id}`;
    return await api.get<any>('inventory', url);
}
