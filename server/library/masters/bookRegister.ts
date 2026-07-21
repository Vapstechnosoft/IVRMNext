'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { bookRegisterSchema } from '@/schemas/library/bookRegister';
import type { ApiSearchparams } from '@/types';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import type { IBookRegisterList } from '@/types/library/transactions/transactions';
import { ensureArray } from '@/lib/utils';

const BASE_URL = 'BookRegister/';

export async function getBookRegisterList(data: { IVRMUL_Id: number; searchParams?: ApiSearchparams }) {
    try {
        const urlParams = getSearchParamsUrl(data.searchParams ?? {}, 'lmB_BookTitle');
        const url = `/BookRegister/book-register-main-load/${data.IVRMUL_Id}?${urlParams}`;
        return await api.get<any>('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch book register data', data: [] };
    }
}

export async function saveBookRegister(data: BookRegisterPayload) {
    return saveBookRegisterTable1(data);
}

export async function saveBookRegisterTable1(data: BookRegisterPayload) {
    try {
        const purchaseTypeMap: Record<string, string> = {
            'Purchased': 'P',
            'Donated': 'D',
            'Specimen': 'S',
            'P': 'P',
            'D': 'D',
            'S': 'S'
        };
        const mappedPurchaseType = purchaseTypeMap[data.lmB_PurOrDonated] || purchaseTypeMap[(data as any).LMB_PurOrDonated] || 'P';

        const payload = {
            LMB_Id: Number(data.lmB_Id || (data as any).LMB_Id || 0),
            LMB_BookTitle: data.lmB_BookTitle || (data as any).LMB_BookTitle || "",
            MB_Subtitle: data.mB_Subtitle || (data as any).MB_Subtitle || "",
            LMC_Id: Number(data.lmC_Id || (data as any).LMC_Id || 0),
            LMB_BookType: data.lmB_BookType || (data as any).LMB_BookType || "",
            LMS_Id: Number(data.lmS_Id || (data as any).LMS_Id || 0),
            LMD_Id: Number(data.lmD_Id || (data as any).LMD_Id || 0),
            Binding_Type: data.binding_Type || (data as any).Binding_Type || "",
            LMB_Edition: data.lmB_Edition || (data as any).LMB_Edition || "",
            LMB_PublishedYear: String(data.lmB_PublishedYear || (data as any).LMB_PublishedYear || ""),
            LMB_EntryDate: data.lmB_EntryDate ? new Date(data.lmB_EntryDate).toISOString() : new Date().toISOString(),
            MB_Call_No: data.mB_Call_No || (data as any).MB_Call_No || "",
            LMB_ISBNNo: data.lmB_ISBNNo || (data as any).LMB_ISBNNo || "",
            LMB_ClassNo: data.lmB_ClassNo || (data as any).LMB_ClassNo || "",
            LMB_VolNo: data.lmB_VolNo || (data as any).LMB_VolNo || "",
            MB_Pages: Number(data.mB_Pages || (data as any).MB_Pages || 0),
            Book_Image: data.lmB_StudentPhoto || (data as any).Book_Image || "",
            LMB_BookNo: data.lmB_BookNo || (data as any).LMB_BookNo || "",
            Purchase_Date: data.purchase_Date ? new Date(data.purchase_Date).toISOString() : new Date().toISOString(),
            LML_Id: Number(data.lmL_Id || (data as any).LML_Id || 0),
            LMB_BillNo: data.lmB_BillNo || (data as any).LMB_BillNo || "",
            Voucher_No: data.voucher_No || (data as any).Voucher_No || "",
            Donor_Id: data.donor_Id || (data as any).Donor_Id || "",
            CurrencyType: data.currencyType || (data as any).CurrencyType || "",
            MB_Keywords: data.mB_Keywords || (data as any).MB_Keywords || "",
            MB_Remarks: data.mB_Remarks || (data as any).MB_Remarks || "",
            Bibliography_Page: data.bibliography_Page || (data as any).Bibliography_Page || "",
            Index_Page: data.index_Page || (data as any).Index_Page || "",
            LMB_PurOrDonated: mappedPurchaseType,
            LMB_DonorAddress: data.lmB_DonorAddress || (data as any).LMB_DonorAddress || "",
            LMBKF_KeyFactor: data.lmBkf_KeyFactor || (data as any).LMBKF_KeyFactor || "",
            LMBKF_PageNo: data.lmBkf_PageNo || (data as any).LMBKF_PageNo || "",
            LMAL_Id: Number(data.lmAL_Id || (data as any).LMAL_Id || 0),
            LMV_Id: Number(data.lmV_Id || (data as any).LMV_Id || 0),
            LMP_Id: Number(data.lmP_Id || (data as any).LMP_Id || 0),
            AuthFlag: (data as any).AuthFlag || (data as any).authFlag || false,
            LMP_PublisherName: (data as any).LMP_PublisherName || "",
            LMP_Address: (data as any).LMP_Address || "",
            LMP_EMailId: (data as any).LMP_EMailId || "",
            LMP_PhoneNo: (data as any).LMP_PhoneNo || "",
            LMP_MobileNo: (data as any).LMP_MobileNo || "",
            UserId: 1
        };

        const response = await api.post<any>('library', `${BASE_URL}Table1Savedata`, payload);
        return response;
    } catch (error) {
        return { success: false, message: 'Failed to save first tab details' };
    }
}

export async function saveBookRegisterTable2(data: BookRegisterPayload) {
    try {
        const purchaseTypeMap: Record<string, string> = {
            'Purchased': 'Purchased',
            'Donated': 'Donated',
            'Specimen': 'Specimen',
            'P': 'Purchased',
            'D': 'Donated',
            'S': 'Specimen'
        };
        const mappedPurchaseType = purchaseTypeMap[data.lmB_PurOrDonated] || purchaseTypeMap[(data as any).LMB_PurOrDonated] || 'Purchased';

        const payload = {
            LMB_Id: Number(data.lmB_Id || (data as any).LMB_Id || 0),
            LMB_PublishedYear: String(data.lmB_PublishedYear || (data as any).LMB_PublishedYear || ""),
            With_Accessories: typeof data.with_Accessories === 'boolean' ? data.with_Accessories : 
                              typeof (data as any).With_Accessories === 'boolean' ? (data as any).With_Accessories : false,
            Purchase_Date: data.purchase_Date ? new Date(data.purchase_Date).toISOString() : new Date().toISOString(),
            LML_Id: Number(data.lmL_Id || (data as any).LML_Id || 0),
            LMB_BillNo: data.lmB_BillNo || (data as any).LMB_BillNo || "",
            Voucher_No: data.voucher_No || (data as any).Voucher_No || "",
            Donor_Id: data.donor_Id || (data as any).Donor_Id || "",
            CurrencyType: data.currencyType || (data as any).CurrencyType || "",
            LMB_NetPrice: Number(data.lmB_NetPrice || (data as any).LMB_NetPrice || 0),
            MB_Keywords: data.mB_Keywords || (data as any).MB_Keywords || "",
            LMP_Id: Number(data.lmP_Id || (data as any).LMP_Id || 0),
            MB_Remarks: data.mB_Remarks || (data as any).MB_Remarks || "",
            Bibliography_Page: typeof data.bibliography_Page === 'boolean' ? data.bibliography_Page :
                               data.bibliography_Page === 'true' || (data as any).Bibliography_Page === true || false,
            Index_Page: typeof data.index_Page === 'boolean' ? data.index_Page :
                        data.index_Page === 'true' || (data as any).Index_Page === true || false,
            LMB_PurOrDonated: mappedPurchaseType,
            LMB_DonorAddress: data.lmB_DonorAddress || (data as any).LMB_DonorAddress || "",
            LMV_Id: Number(data.lmV_Id || (data as any).LMV_Id || 0),
            LMAL_Id: Number(data.lmAL_Id || (data as any).LMAL_Id || 0)
        };

        const response = await api.post<any>('library', `${BASE_URL}Table2Savedata`, payload);
        return response;
    } catch (error) {
        return { success: false, message: 'Failed to save second tab details' };
    }
}

export async function deactivateBookRegister(data: { LMBANO_Id?: number; LMB_Id?: number; LMB_BookTitle?: string }) {
    try {
        const payload = {
            LMBANO_Id: Number(data.LMBANO_Id || (data as any).lmbanO_Id || data.LMB_Id)
        };
        const response = await api.post<any>('library', `/BookRegister/deactiveY`, payload);
        return response;
    } catch (error) {
        return { success: false, message: 'Failed to toggle status' };
    }
}

export async function getLanguageDropdown() {
    try {
        const url = 'BookRegister/language-dropdown';
        const response = await api.get<any>('library', url);
        return response?.data || response;
    } catch (error) {
        return [];
    }
}

export async function getInitialData() {
    try {
        // Fetch main load data (contains most dropdowns)
        const mainLoadUrl = 'BookRegister/book-register-main-load/21602';
        const mainLoadResponse = await api.get<any>('library', mainLoadUrl);

        // Fetch category list specifically as it seems to be missing from main-load
        const categoryUrl = 'MasterCategory/master-books-category-list';
        const categoryResponse = await api.get<any>('library', categoryUrl);

        // Fetch subject list
        const subjectUrl = 'BookRegister/book-regester-subject-dropdown';
        const subjectResponse = await api.get<any>('library', subjectUrl);

        // Fetch department list
        const departmentUrl = 'BookRegister/department-dropdown';
        const departmentResponse = await api.get<any>('library', departmentUrl);

        // Fetch library list
        const libraryUrl = 'BookRegister/library-dropdown';
        const libraryResponse = await api.get<any>('library', libraryUrl);

        // Fetch author list
        const authorUrl = 'BookRegister/author-dropdown';
        const authorResponse = await api.get<any>('library', authorUrl);

        // Fetch publisher list
        const publisherUrl = 'BookRegister/publisher-dropdown';
        const publisherResponse = await api.get<any>('library', publisherUrl);

        // Fetch rack list
        const rackUrl = 'BookRegister/rack-dropdown';
        const rackResponse = await api.get<any>('library', rackUrl);

        // Fetch language list
        const languageResponse = await getLanguageDropdown();

        // Safely extract raw list data supporting nested properties
        const mainLoadData = mainLoadResponse?.data || mainLoadResponse || {};
        const categoryData = categoryResponse?.data?.data || categoryResponse?.data || categoryResponse;
        const subjectData = subjectResponse?.data?.data || subjectResponse?.data || subjectResponse;
        const departmentData = departmentResponse?.data?.data || departmentResponse?.data || departmentResponse;
        const libraryData = libraryResponse?.data?.data || libraryResponse?.data || libraryResponse;
        const authorData = authorResponse?.data?.data || authorResponse?.data || authorResponse;
        const publisherData = publisherResponse?.data?.data || publisherResponse?.data || publisherResponse;
        const rackData = rackResponse?.data?.data || rackResponse?.data || rackResponse;
        const languageData = languageResponse?.data?.data || languageResponse?.data || languageResponse;

        return {
            ...mainLoadData,
            categorylist: ensureArray(categoryData),
            categoryList: ensureArray(categoryData),
            subjectlist: ensureArray(subjectData),
            subjectList: ensureArray(subjectData),
            deptlist: ensureArray(departmentData),
            deptList: ensureArray(departmentData),
            liblist: ensureArray(libraryData),
            libList: ensureArray(libraryData),
            authorlist: ensureArray(authorData),
            authorList: ensureArray(authorData),
            publisherlist: ensureArray(publisherData),
            publisherList: ensureArray(publisherData),
            racklist: ensureArray(rackData),
            rackList: ensureArray(rackData),
            langlist: ensureArray(languageData),
            langList: ensureArray(languageData),
            vendorlist: ensureArray(mainLoadData?.vendorlist || mainLoadData?.vendorList),
            vendorList: ensureArray(mainLoadData?.vendorlist || mainLoadData?.vendorList),
            accessorieslist: ensureArray(mainLoadData?.accessorieslist || mainLoadData?.accessoriesList),
            accessoriesList: ensureArray(mainLoadData?.accessorieslist || mainLoadData?.accessoriesList)
        };
    } catch (error) {
        return { success: false, message: 'Failed to fetch initial data' };
    }
}
