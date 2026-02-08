'use server';

import { api } from '@/lib/apiService';

// Matches: apiService.getURI("INV_MasterProduct/getloaddata", pageid)
export async function getInvMasterProductLoadData(page: number = 1) {
    const url = `/INV_MasterProductFacade/GetProductList?page=${page}&page_size=10`;

    try {
        const loadDataResponse = await api.get<any>('inventory', url);
        const loadData = loadDataResponse || {};

        return {
            ...loadData
        };
    } catch (error) {
        console.error("Error loading product data", error);
        return {};
    }
}

export async function getInvMasterProductList() {
    const url = `/INV_MasterProductFacade/LoadProductList`;
    return await api.get<any>('inventory', url);
}

export async function getInvMasterItemList() {
    const url = `/INV_MasterProductFacade/LoadItemList`;
    return await api.get<any>('inventory', url);
}

export async function getInvMasterProductItemList(page: number = 1) {
    const url = `/INV_MasterProductFacade/GetProductItemList?page=${page}&page_size=10`;
    return await api.get<any>('inventory', url);
}

export async function saveInvMasterProduct(data: any) {
    const url = `/INV_MasterProductFacade/SaveProductDetails`;
    return await api.post<any>('inventory', url, data);
}

export async function saveInvMasterProductQty(data: any) {
    const url = `/INV_MasterProductFacade/SaveProductItemQtyDetails`;
    return await api.post<any>('inventory', url, data);
}

export async function deactiveInvMasterProduct(data: any) {
    const url = `/INV_MasterProduct/deactive`;
    return await api.post<any>('inventory', url, data);
}

export async function deactiveInvMasterProductQty(data: any) {
    const url = `/INV_MasterProduct/deactiveQty`;
    return await api.post<any>('inventory', url, data);
}

export async function getInvMasterProductTax(data: { INVMP_Id: number }) {
    const url = `/INV_MasterProduct/productTax`;
    return await api.post<any>('inventory', url, data);
}

export async function deactiveInvMasterProductTax(data: any) {
    const url = `/INV_MasterProduct/deactiveptax`;
    return await api.post<any>('inventory', url, data);
}

export async function getInvMasterTaxList() {
    const url = `/INV_MasterItemFacade/get_taxlist`;
    return await api.post<any>('inventory', url, {});
}
