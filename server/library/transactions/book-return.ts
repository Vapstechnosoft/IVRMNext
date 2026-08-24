'use server';

import { api } from '@/lib/apiService';
import type {
    BookCategory,
    BookType,
    IBookAvailability,
    IBookDetails,
    IBookTransactionInitialData,
    IIssueBookRequest,
    IRenewalBookRequest,
    IReturnBookRequest,
    IStaffDetails,
    IStudentDetails,
    MemberType
} from '@/types/library/transactions/book-transaction';

const FACADE = 'BookTransactionFacade';

// Get initial data for the page
export async function getBookTransactionDetails(data: {
    booktype: BookType;
    issuertype: MemberType;
    bookcat_type: BookCategory;
    LMAL_Id?: number;
    ASMAY_Id?: number;
    ASMCL_Id?: number;
    ASMS_Id?: number;
}) {
    const url = `BookTransaction/Get_Student_Details1`;
    return await api.post<IBookTransactionInitialData>('library', url, data);
}

// Issue a book
export async function issueBook(data: IIssueBookRequest) {
    const url = `${FACADE}/Savedata`;
    return await api.post<{ returnval: boolean; duplicate: boolean; maxmsg: string }>('library', url, data);
}

// Return a book
export async function returnBook(data: IReturnBookRequest) {
    const url = `${FACADE}/returndata`;
    return await api.post<{ returnval: boolean }>('library', url, data);
}

// Renew a book
export async function renewBook(data: IRenewalBookRequest) {
    const url = `${FACADE}/renewaldata`;
    return await api.post<{ returnval: boolean; duplicate: boolean; renew: boolean }>('library', url, data);
}

// Get student details
export async function getStudentDetailsById(data: {
    ASMAY_Id?: number;
    AMST_Id: number;
    LMBANO_Id?: number;
    LMB_Id?: number;
    booktype: BookType;
    issuertype: MemberType;
    bookcat_type: BookCategory;
    FODM_Id?: number;
}) {
    const url = `${FACADE}/studentdetails`;
    return await api.post<{
        studentdata: IStudentDetails[];
        alldata: any[]; // Contains issued books
        circularparamdetails: Array<{
            max_Issue_Days: number;
            max_No_Renewals: number;
            max_Issue_Items: number;
        }>;
    }>('library', url, data);
}

// Get staff details
export async function getStaffDetails(data: {
    LMBANO_Id?: number;
    HRME_Id: number;
    LMB_Id?: number;
    booktype: BookType;
    issuertype: MemberType;
    bookcat_type: BookCategory;
    FODM_Id?: number;
}) {
    const url = `${FACADE}/studentdetails`;
    return await api.post<{
        selctstaffdata: IStaffDetails[];
        alldata: any[]; // Contains issued books
        circularparamdetails: Array<{
            max_Issue_Days: number;
            max_No_Renewals: number;
            max_Issue_Items: number;
        }>;
    }>('library', url, data);
}

// Get department details (circular parameters)
export async function getDepartmentDetails(data: {
    LMBANO_Id?: number;
    HRMD_Id: number;
    LMB_Id?: number;
    booktype: BookType;
    issuertype: MemberType;
    bookcat_type: BookCategory;
    FODM_Id?: number;
}) {
    const url = `${FACADE}/studentdetails`;
    return await api.post<{
        circularparamdetails: Array<{
            max_Issue_Days: number;
            max_No_Renewals: number;
            max_Issue_Items: number;
        }>;
    }>('library', url, data);
}

// Get book details
export async function getBookDetails(data: {
    LMBANO_Id: number;
    LMB_Id: number;
    booktype: BookType;
    issuertype: MemberType;
    bookcat_type: BookCategory;
    FODM_Id?: number;
}) {
    const url = `${FACADE}/get_bookdetails`;
    return await api.post<{
        bookdetails: IBookDetails[];
        circularparamdetails: Array<{
            max_Issue_Days: number;
            max_No_Renewals: number;
            max_Issue_Items: number;
        }>;
    }>('library', url, data);
}

// Show fine details
export async function showFine(data: {
    Book_Trans_Id: number;
    issuertype: MemberType;
    FODM_Id?: number;
}) {
    const url = `${FACADE}/showfine`;
    return await api.post<{
        fine_Amount: number;
        finecollected: number;
    }>('library', url, data);
}

// Calculate due date considering holidays
export async function calculateDueDateWithHolidays(data: {
    Return_Date: string;
    Issue_Date: string;
    difftotaldays: number;
}) {
    const url = `${FACADE}/ShowDiffrentDays`;
    return await api.post<{
        configdata: Array<{ Holidays: string }>;
    }>('library', url, data);
}

// Search books
export async function searchBooks(data: {
    searchfilter: string;
    booktype: BookType;
    issuertype: MemberType;
    bookcat_type: BookCategory;
    LMAL_Id?: number;
    FODM_Id?: number;
}) {
    const url = `${FACADE}/searchfilter`;
    return await api.post<{
        booktitle: Array<{
            lmB_Id: number;
            lmbanO_Id: number;
            lmB_BookTitle: string;
            lmbanO_AccessionNo: string;
            amsT_FirstName?: string;
        }>;
    }>('library', url, data);
}

// Barcode search for issue
export async function searchByBarcode(data: {
    searchfilter: string;
    booktype: BookType;
    issuertype: MemberType;
    bookcat_type: BookCategory;
    LMAL_Id?: number;
    FODM_Id?: number;
}) {
    const url = `${FACADE}/searchfilterbarcode`;
    return await api.post<{
        booktitle: Array<{
            lmB_Id: number;
            lmbanO_Id: number;
            lmB_BookTitle: string;
            lmbanO_AccessionNo: string;
        }>;
    }>('library', url, data);
}

// Barcode search for return/renewal
export async function searchByBarcodeForReturn(data: {
    searchfilter: string;
    booktype: BookType;
    issuertype: MemberType;
    bookcat_type: BookCategory;
    LMAL_Id?: number;
    FODM_Id?: number;
}) {
    const url = `${FACADE}/searchfilterbarcode1`;
    return await api.post<{
        getalldata: any[];
    }>('library', url, data);
}

// Get students by class/section
export async function getStudentsByClassSection(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    FODM_Id?: number;
}) {
    const url = `${FACADE}/GetStudentDetails1`;
    return await api.post<{
        studentCount: number;
        studentlist: Array<{
            amsT_Id: number;
            amsT_FirstName: string;
            amsT_AdmNo: string;
        }>;
    }>('library', url, data);
}

// Get staff by department/designation
export async function getStaffByDepartment(data: {
    HRMDES_Id: number;
    HRMD_Id: number;
    FODM_Id?: number;
}) {
    const url = `${FACADE}/get_staff1`;
    return await api.post<{
        stafftlist: Array<{
            hrmE_Id: number;
            hrmE_EmployeeFirstName: string;
        }>;
    }>('library', url, data);
}

// Get designations by department
export async function getDesignationsByDepartment(data: {
    HRMD_Id: number;
    FODM_Id?: number;
}) {
    const url = `${FACADE}/getdepchange`;
    return await api.post<{
        filldesignation: Array<{
            hrmdeS_Id: number;
            hrmdeS_DesignationName: string;
        }>;
    }>('library', url, data);
}

// Search in transaction grid
export async function searchTransactionGrid(data: {
    searctype: string;
    searchfilter?: string;
    booktype: BookType;
    issuertype: MemberType;
    bookcat_type: BookCategory;
    LMAL_Id?: number;
    ASMCL_Id?: number;
    ASMS_Id?: number;
    Issue_Date?: string;
    FODM_Id?: number;
}) {
    const url = `${FACADE}/stdSearch_Grid`;
    return await api.post<{
        getalldata: any[];
    }>('library', url, data);
}

// Load available books
export async function loadAvailableBooks(data: {
    LMAL_Id?: number;
    FODM_Id?: number;
}) {
    const url = `${FACADE}/loadbookavail`;
    return await api.post<{
        avilbooktitle: Array<{
            lmB_Id: number;
            lmbanO_Id: number;
            lmB_BookTitle: string;
            lmbanO_AccessionNo: string;
        }>;
    }>('library', url, data);
}

// Get book availability details
export async function getBookAvailabilityDetails(data: {
    LMBANO_Id: number;
    LMB_Id: number;
    FODM_Id?: number;
}) {
    const url = `${FACADE}/availget_bookdetails`;
    return await api.post<{
        avilbookdetails: IBookAvailability[];
    }>('library', url, data);
}

// Edit transaction data (for return/renewal)
export async function editTransactionData(data: {
    Book_Trans_Id: number;
    ASMCL_Id?: number;
    AMST_Id?: number;
    HRMGT_Id?: number;
    HRME_Id?: number;
    HRMD_Id?: number;
    issuertype: MemberType;
    booktype: BookType;
    bookcat_type: BookCategory;
}) {
    const url = `${FACADE}/Editdata`;
    return await api.post<{
        booktitle: any[];
        editlist: any[];
        circularparamdetails: Array<{
            max_Issue_Days: number;
            max_No_Renewals: number;
            max_Issue_Items: number;
        }>;
        fine_Amount: number;
        finecollected: number;
    }>('library', url, data);
}

// Lost Book
export async function lostBook(data: {
    Book_Trans_Id: number;
    LMBANO_Id: number;
    LMB_Id: number;
    issuertype: MemberType;
    bookcat_type: BookCategory;
    LMB_BookTitle: string;
    LBTR_FineCollected: number;
    LBTR_TotalFine: number;
}) {
    const url = `${FACADE}/LostBook`;
    return await api.post<{ returnval: boolean }>('library', url, data);
}

// Get Book Details on Load (No Payload)
export async function getBookDetailsOnLoad() {
    try {
        const url = 'BookTransaction/get-book-details';
        const response = await api.get<any>('library', url);
        return response;
    } catch (error: any) {
        console.error('Error fetching book details on load:', error);
        return {
            success: false,
            message: error?.message || 'Failed to fetch book details',
            data: null
        };
    }
}

