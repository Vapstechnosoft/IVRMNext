'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { ensureArray } from '@/lib/utils';
import type { ApiSearchparams } from '@/types';
import type { BookRegisterInitialData, BookRegisterPayload } from '@/types/library/masters/bookRegister';

const BASE_URL = 'BookRegister/';

export async function getBookRegisterList(params?: ApiSearchparams | { searchParams?: ApiSearchparams }) {
    try {
        const url = 'BookTransaction/Get_Student_Details1';
        let response: any;
        try {
            response = await api.post<any>('library', url, {});
        } catch {
            response = await api.get<any>('library', url);
        }
        return response;
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch book register data', data: [] };
    }
}

export async function saveBookRegister(data: BookRegisterPayload) {
    return saveBookRegisterTable3(data);
}

export async function saveBookRegisterTable1(data: BookRegisterPayload) {
    try {
        let entryDateIso = new Date().toISOString();
        if (data.lmB_EntryDate) {
            try {
                const d = new Date(data.lmB_EntryDate);
                if (!isNaN(d.getTime())) {
                    entryDateIso = d.toISOString();
                }
            } catch {
                entryDateIso = new Date().toISOString();
            }
        }

        const payload = {
            LMB_Id: Number(data.lmB_Id || (data as any).LMB_Id || 0),
            LMB_BookTitle: String(data.lmB_BookTitle || (data as any).LMB_BookTitle || '').trim(),
            MB_Subtitle: String(data.mB_Subtitle || (data as any).MB_Subtitle || '').trim(),
            LMC_Id: Number(data.lmC_Id || (data as any).LMC_Id || 0),
            LMB_BookType: String(data.lmB_BookType || (data as any).LMB_BookType || '').trim(),
            LMS_Id: Number(data.lmS_Id || (data as any).LMS_Id || 0),
            LMD_Id: Number(data.lmD_Id || (data as any).LMD_Id || 0),
            Binding_Type: String(data.binding_Type || (data as any).Binding_Type || '').trim(),
            LMB_Edition: String(data.lmB_Edition || (data as any).LMB_Edition || '').trim(),
            LMB_PublishedYear: String(data.lmB_PublishedYear || (data as any).LMB_PublishedYear || '').trim(),
            LMB_EntryDate: entryDateIso,
            MB_Call_No: String(data.mB_Call_No || (data as any).MB_Call_No || '').trim(),
            LMB_ISBNNo: String(data.lmB_ISBNNo || (data as any).LMB_ISBNNo || '').trim(),
            LMB_ClassNo: String(data.lmB_ClassNo || (data as any).LMB_ClassNo || '').trim(),
            LMB_VolNo: String(data.lmB_VolNo || (data as any).LMB_VolNo || '').trim(),
            MB_Pages: Number(data.mB_Pages || (data as any).MB_Pages || 0),
            LMB_BillNo: String(data.lmB_BillNo || (data as any).LMB_BillNo || '').trim(),
            Book_Image: String(data.lmB_StudentPhoto || (data as any).Book_Image || (data as any).book_Image || '').trim(),
            LMB_BookNo: String(data.lmB_BookNo || (data as any).LMB_BookNo || '').trim(),
            LMBKF_KeyFactor: String(data.lmBkf_KeyFactor || (data as any).LMBKF_KeyFactor || '').trim(),
            LMBKF_PageNo: String(data.lmBkf_PageNo !== undefined && data.lmBkf_PageNo !== null ? data.lmBkf_PageNo : (data as any).LMBKF_PageNo || ''),
            LMAL_Id: Number(data.lmAL_Id || (data as any).LMAL_Id || (data as any).lmaL_Id || 0)
        };

        const response = await api.post<any>('library', `${BASE_URL}Table1Savedata`, payload);
        return response;
    } catch (error: any) {
        console.error('Error in saveBookRegisterTable1:', error);
        return { success: false, message: error?.message || 'Failed to save first tab details' };
    }
}

export async function saveBookRegisterTable2(data: BookRegisterPayload) {
    try {
        const purchaseTypeMap: Record<string, string> = {
            Purchased: 'Purchased',
            Donated: 'Donated',
            Specimen: 'Specimen',
            P: 'Purchased',
            D: 'Donated',
            S: 'Specimen'
        };
        const purchaseType = String(data.lmB_PurOrDonated || (data as any).LMB_PurOrDonated || '').trim();
        const mappedPurchaseType = purchaseTypeMap[purchaseType] || 'Purchased';

        let purchaseDateIso = new Date().toISOString();
        if (data.purchase_Date) {
            try {
                const d = new Date(data.purchase_Date);
                if (!isNaN(d.getTime())) {
                    purchaseDateIso = d.toISOString();
                }
            } catch {
                purchaseDateIso = new Date().toISOString();
            }
        }

        const payload = {
            LMB_Id: Number(data.lmB_Id || (data as any).LMB_Id || 0),
            LMB_PublishedYear: String(data.lmB_PublishedYear || (data as any).LMB_PublishedYear || '').trim(),
            With_Accessories: !!(data.with_Accessories || (data as any).With_Accessories),
            Purchase_Date: purchaseDateIso,
            LML_Id: Number(data.lmL_Id || (data as any).LML_Id || 0),
            LMB_BillNo: String(data.lmB_BillNo || (data as any).LMB_BillNo || '').trim(),
            Voucher_No: String(data.voucher_No || (data as any).Voucher_No || '').trim(),
            Donor_Id: (data.donor_Id || (data as any).Donor_Id) ? String(data.donor_Id || (data as any).Donor_Id).trim() : null,
            CurrencyType: String(data.currencyType || (data as any).CurrencyType || 'INR').trim(),
            LMB_NetPrice: Number(data.lmB_NetPrice || (data as any).LMB_NetPrice || 0),
            MB_Keywords: String(data.mB_Keywords || (data as any).MB_Keywords || '').trim(),
            AuthFlag: !!((data as any).AuthFlag || (data as any).authFlag),
            LMP_Id: Number(data.lmP_Id || (data as any).LMP_Id || 0),
            LMP_PublisherName: (data as any).LMP_PublisherName ? String((data as any).LMP_PublisherName).trim() : null,
            LMP_Address: (data as any).LMP_Address ? String((data as any).LMP_Address).trim() : null,
            LMP_EMailId: (data as any).LMP_EMailId ? String((data as any).LMP_EMailId).trim() : null,
            LMP_PhoneNo: (data as any).LMP_PhoneNo ? String((data as any).LMP_PhoneNo).trim() : null,
            LMP_MobileNo: (data as any).LMP_MobileNo ? String((data as any).LMP_MobileNo).trim() : null,
            MB_Remarks: String(data.mB_Remarks || (data as any).MB_Remarks || '').trim(),
            Bibliography_Page: data.bibliography_Page !== undefined && data.bibliography_Page !== null && data.bibliography_Page !== ''
                ? String(data.bibliography_Page).trim()
                : '',
            Index_Page: data.index_Page !== undefined && data.index_Page !== null && data.index_Page !== ''
                ? String(data.index_Page).trim()
                : '',
            LMB_PurOrDonated: mappedPurchaseType,
            LMB_DonorAddress: (data.lmB_DonorAddress || (data as any).LMB_DonorAddress) ? String(data.lmB_DonorAddress || (data as any).LMB_DonorAddress).trim() : null,
            LMV_Id: Number(data.lmV_Id || (data as any).LMV_Id || 0),
            LMAL_Id: Number(data.lmAL_Id || (data as any).LMAL_Id || 0)
        };

        const response = await api.post<any>('library', `${BASE_URL}Table2Savedata`, payload);
        return response;
    } catch (error: any) {
        console.error('Error in saveBookRegisterTable2:', error);
        return { success: false, message: error?.message || 'Failed to save second tab details' };
    }
}

export async function saveBookRegisterTable3(data: BookRegisterPayload) {
    try {
        const purchaseTypeMap: Record<string, string> = {
            Purchased: 'Purchased',
            Donated: 'Donated',
            Specimen: 'Specimen',
            P: 'Purchased',
            D: 'Donated',
            S: 'Specimen'
        };
        const purchaseType = String(data.lmB_PurOrDonated || (data as any).LMB_PurOrDonated || '').trim();
        const mappedPurchaseType = purchaseTypeMap[purchaseType] || 'Purchased';

        let purchaseDateIso = new Date().toISOString();
        if (data.purchase_Date) {
            try {
                const d = new Date(data.purchase_Date);
                if (!isNaN(d.getTime())) {
                    purchaseDateIso = d.toISOString();
                }
            } catch {
                purchaseDateIso = new Date().toISOString();
            }
        }

        const payload = {
            LMB_Id: Number(data.lmB_Id || (data as any).LMB_Id || 0),
            LMB_PublishedYear: String(data.lmB_PublishedYear || (data as any).LMB_PublishedYear || '').trim(),
            With_Accessories: !!(data.with_Accessories || (data as any).With_Accessories),
            Purchase_Date: purchaseDateIso,
            LML_Id: Number(data.lmL_Id || (data as any).LML_Id || 0),
            LMP_Id: Number(data.lmP_Id || (data as any).LMP_Id || 0),
            LMB_BillNo: String(data.lmB_BillNo || (data as any).LMB_BillNo || '').trim(),
            Voucher_No: String(data.voucher_No || (data as any).Voucher_No || '').trim(),
            CurrencyType: String(data.currencyType || (data as any).CurrencyType || 'INR').trim(),
            LMB_NetPrice: Number(data.lmB_NetPrice || (data as any).LMB_NetPrice || data.lmB_Price || 0),
            MB_Keywords: String(data.mB_Keywords || (data as any).MB_Keywords || '').trim(),
            MB_Remarks: String(data.mB_Remarks || (data as any).MB_Remarks || '').trim(),
            Bibliography_Page:
                typeof data.bibliography_Page === 'boolean'
                    ? data.bibliography_Page
                    : data.bibliography_Page === 'true' || (data as any).Bibliography_Page === true
                      ? true
                      : !!data.bibliography_Page,
            Index_Page:
                typeof data.index_Page === 'boolean'
                    ? data.index_Page
                    : data.index_Page === 'true' || (data as any).Index_Page === true
                      ? true
                      : !!data.index_Page,
            LMB_PurOrDonated: mappedPurchaseType,
            LMBA_Id: Number(data.lmAU_Id || (data as any).LMBA_Id || (data as any).lmba_Id || 0),
            LMBA_AuthorFirstName: String(data.lmB_AuthorFirstName || (data as any).LMBA_AuthorFirstName || (data as any).lmaU_AuthorFirstName || '').trim(),
            LMBA_AuthorLastName: String(data.lmB_AuthorLastName || (data as any).LMBA_AuthorLastName || (data as any).lmaU_AuthorLastName || '').trim(),
            LMBA_AuthorMiddleName: String(data.lmB_AuthorMiddleName || (data as any).LMBA_AuthorMiddleName || (data as any).lmaU_AuthorMiddleName || '').trim(),
            LMV_Id: Number(data.lmV_Id || (data as any).LMV_Id || 0),
            LMAL_Id: Number(data.lmAL_Id || (data as any).LMAL_Id || 0)
        };

        const response = await api.post<any>('library', `${BASE_URL}Table3Savedata`, payload);
        return response;
    } catch (error: any) {
        console.error('Error in saveBookRegisterTable3:', error);
        return { success: false, message: error?.message || 'Failed to save third tab details' };
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

function extractDataArray(res: any, fallbackKey?: string): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.data?.$values)) return res.data.$values;
    if (Array.isArray(res?.$values)) return res.$values;

    // Check case-insensitive key matches
    const searchInObject = (obj: any): any[] | null => {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;

        if (fallbackKey) {
            const cleanFallback = fallbackKey.toLowerCase().replace(/[^a-z0-9]/g, '');
            for (const key of Object.keys(obj)) {
                const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (cleanKey === cleanFallback || cleanKey.includes(cleanFallback) || cleanFallback.includes(cleanKey)) {
                    const val = obj[key];
                    if (Array.isArray(val)) return val;
                    if (Array.isArray(val?.$values)) return val.$values;
                    if (Array.isArray(val?.data)) return val.data;
                }
            }
        }

        // Check common array container properties
        for (const [key, val] of Object.entries(obj)) {
            if (Array.isArray(val) && val.length > 0) return val;
            if (val && typeof val === 'object' && Array.isArray((val as any).$values)) return (val as any).$values;
        }

        return null;
    };

    const foundDirect = searchInObject(res);
    if (foundDirect) return foundDirect;

    if (res?.data && typeof res.data === 'object') {
        const foundInData = searchInObject(res.data);
        if (foundInData) return foundInData;
    }

    const raw = res?.data !== undefined && res?.data !== null ? res.data : res;
    return ensureArray(raw);
}

// 1. Category Dropdown: api/BookRegister/category-dropdown
export async function getCategoryDropdown() {
    try {
        const url = 'BookRegister/category-dropdown';
        const response = await api.get<any>('library', url);
        return extractDataArray(response, 'categorylist');
    } catch (error) {
        console.warn('GET BookRegister/category-dropdown error:', error);
        return [];
    }
}

// 2. Department Dropdown: api/BookRegister/department-dropdown
export async function getDepartmentDropdown() {
    try {
        const url = 'BookRegister/department-dropdown';
        const response = await api.get<any>('library', url);
        return extractDataArray(response, 'deptlist');
    } catch (error) {
        console.warn('GET BookRegister/department-dropdown error:', error);
        return [];
    }
}

// 3. Subject Dropdown: api/BookRegister/book-regester-subject-dropdown
export async function getSubjectDropdown() {
    try {
        const url = 'BookRegister/book-regester-subject-dropdown';
        const response = await api.get<any>('library', url);
        return extractDataArray(response, 'subjectlist');
    } catch (error) {
        console.warn('GET BookRegister/book-regester-subject-dropdown error:', error);
        return [];
    }
}

// 4. Library Dropdown: api/BookRegister/library-dropdown
export async function getLibraryDropdown() {
    try {
        const url = 'BookRegister/library-dropdown';
        const response = await api.get<any>('library', url);
        return extractDataArray(response, 'liblist');
    } catch (error) {
        console.warn('GET BookRegister/library-dropdown error:', error);
        return [];
    }
}

// 5. Author Dropdown: api/BookRegister/author-dropdown
export async function getAuthorDropdown() {
    try {
        const url = 'BookRegister/author-dropdown';
        const response = await api.get<any>('library', url);
        return extractDataArray(response, 'authorlist');
    } catch (error) {
        console.warn('GET BookRegister/author-dropdown error:', error);
        return [];
    }
}

// 6. Publisher Dropdown: api/BookRegister/publisher-dropdown
export async function getPublisherDropdown() {
    try {
        const url = 'BookRegister/publisher-dropdown';
        const response = await api.get<any>('library', url);
        return extractDataArray(response, 'publisherlist');
    } catch (error) {
        console.warn('GET BookRegister/publisher-dropdown error:', error);
        return [];
    }
}

// 7. Rack Dropdown: api/BookRegister/rack-dropdown
export async function getRackDropdown() {
    try {
        const url = 'BookRegister/rack-dropdown';
        const response = await api.get<any>('library', url);
        return extractDataArray(response, 'racklist');
    } catch (error) {
        console.warn('GET BookRegister/rack-dropdown error:', error);
        return [];
    }
}

// 8. Language Dropdown: api/BookRegister/language-dropdown
export async function getLanguageDropdown() {
    try {
        const url = 'BookRegister/language-dropdown';
        const response = await api.get<any>('library', url);
        return extractDataArray(response, 'langlist');
    } catch (error) {
        console.warn('GET BookRegister/language-dropdown error:', error);
        return [];
    }
}

// 9. Vendor Dropdown: api/BookRegister/vendor-dropdown
export async function getVendorDropdown() {
    try {
        const url = 'BookRegister/vendor-dropdown';
        const response = await api.get<any>('library', url);
        return extractDataArray(response, 'vendorlist');
    } catch (error) {
        console.warn('GET BookRegister/vendor-dropdown error:', error);
        return [];
    }
}

export async function getInitialData(): Promise<BookRegisterInitialData> {
    try {
        const [
            categoryRes,
            departmentRes,
            subjectRes,
            libraryRes,
            authorRes,
            publisherRes,
            rackRes,
            languageRes,
            vendorRes,
            mainLoadRes
        ] = await Promise.allSettled([
            api.get<any>('library', 'BookRegister/category-dropdown'),
            api.get<any>('library', 'BookRegister/department-dropdown'),
            api.get<any>('library', 'BookRegister/book-regester-subject-dropdown'),
            api.get<any>('library', 'BookRegister/library-dropdown'),
            api.get<any>('library', 'BookRegister/author-dropdown'),
            api.get<any>('library', 'BookRegister/publisher-dropdown'),
            api.get<any>('library', 'BookRegister/rack-dropdown'),
            api.get<any>('library', 'BookRegister/language-dropdown'),
            api.get<any>('library', 'BookRegister/vendor-dropdown'),
            api.post<any>('library', 'BookTransaction/Get_Student_Details1', {})
        ]);

        const categoryData = categoryRes.status === 'fulfilled' ? extractDataArray(categoryRes.value, 'categorylist') : [];
        const departmentData = departmentRes.status === 'fulfilled' ? extractDataArray(departmentRes.value, 'deptlist') : [];
        const subjectData = subjectRes.status === 'fulfilled' ? extractDataArray(subjectRes.value, 'subjectlist') : [];
        const libraryData = libraryRes.status === 'fulfilled' ? extractDataArray(libraryRes.value, 'liblist') : [];
        const authorData = authorRes.status === 'fulfilled' ? extractDataArray(authorRes.value, 'authorlist') : [];
        const publisherData = publisherRes.status === 'fulfilled' ? extractDataArray(publisherRes.value, 'publisherlist') : [];
        const rackData = rackRes.status === 'fulfilled' ? extractDataArray(rackRes.value, 'racklist') : [];
        const languageData = languageRes.status === 'fulfilled' ? extractDataArray(languageRes.value, 'langlist') : [];
        const vendorData = vendorRes.status === 'fulfilled' ? extractDataArray(vendorRes.value, 'vendorlist') : [];

        const mainLoadRaw = mainLoadRes.status === 'fulfilled' ? mainLoadRes.value : null;
        const mainLoadData = (mainLoadRaw && typeof mainLoadRaw === 'object' && !Array.isArray(mainLoadRaw)) ? (mainLoadRaw.data && typeof mainLoadRaw.data === 'object' && !Array.isArray(mainLoadRaw.data) ? mainLoadRaw.data : mainLoadRaw) : {};

        // Fallback to mainLoad lists if individual endpoints returned empty
        const finalCategory = categoryData.length > 0 ? categoryData : extractDataArray(mainLoadData?.categorylist || mainLoadData?.categoryList || mainLoadData?.m_categorylist, 'categorylist');
        const finalDept = departmentData.length > 0 ? departmentData : extractDataArray(mainLoadData?.deptlist || mainLoadData?.deptList || mainLoadData?.departmentlist || mainLoadData?.filldepartment, 'deptlist');
        const finalSubject = subjectData.length > 0 ? subjectData : extractDataArray(mainLoadData?.subjectlist || mainLoadData?.subjectList || mainLoadData?.mstersubjectlist, 'subjectlist');
        const finalLib = libraryData.length > 0 ? libraryData : extractDataArray(mainLoadData?.liblist || mainLoadData?.libList || mainLoadData?.librarylist || mainLoadData?.msterliblist, 'liblist');
        const finalAuthor = authorData.length > 0 ? authorData : extractDataArray(mainLoadData?.authorlist || mainLoadData?.authorList || mainLoadData?.authorname, 'authorlist');
        const finalPublisher = publisherData.length > 0 ? publisherData : extractDataArray(mainLoadData?.publisherlist || mainLoadData?.publisherList, 'publisherlist');
        const finalRack = rackData.length > 0 ? rackData : extractDataArray(mainLoadData?.racklist || mainLoadData?.rackList, 'racklist');
        const finalLang = languageData.length > 0 ? languageData : extractDataArray(mainLoadData?.langlist || mainLoadData?.langList || mainLoadData?.languagelist, 'langlist');
        const finalVendor = vendorData.length > 0 ? vendorData : extractDataArray(mainLoadData?.vendorlist || mainLoadData?.vendorList, 'vendorlist');

        const finalAccessories = extractDataArray(mainLoadData?.accessorieslist || mainLoadData?.accessoriesList, 'accessorieslist');

        return {
            success: true,
            categorylist: finalCategory,
            categoryList: finalCategory,
            deptlist: finalDept,
            deptList: finalDept,
            subjectlist: finalSubject,
            subjectList: finalSubject,
            liblist: finalLib,
            libList: finalLib,
            authorlist: finalAuthor,
            authorList: finalAuthor,
            publisherlist: finalPublisher,
            publisherList: finalPublisher,
            racklist: finalRack,
            rackList: finalRack,
            langlist: finalLang,
            langList: finalLang,
            vendorlist: finalVendor,
            vendorList: finalVendor,
            accessorieslist: finalAccessories,
            accessoriesList: finalAccessories
        };
    } catch (error) {
        console.error('Failed to fetch initial data for book register:', error);
        return { success: false, message: 'Failed to fetch initial data' };
    }
}
