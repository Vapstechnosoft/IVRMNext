'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterpaymentGatewayDropdownList } from '@/types/fees/masters/masters';
import type {
    IFeeAcademicyearDropDownList,
    IFeeClassCategoryDropDownList,
    IFeeGroupDropDownList,
    IFeePreAdmissionStudentInformation,
    IFeePreAdmissionStudentTermsDetails,
    IFeePreAdmissionStudentsDropDownList,
    IFeePreAdmissionTransactionDetails,
    IFeeTransactionApiResponse,
    IMasterAmountEntryDetails
} from '@/types/fees/transactions/transactions';

export async function getFeePreadmissionTransactionList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'modeOfPayment,paidAmount,paidDate,receiptNo,studentEmail,studentMobile,studentRegNo,studentName'
    );
    const url = '/FeePreadmission/gettransactionlist?MI_Id=30&ASMAY_Id=231';
    console.info('preadmissiontransactiondetials api', url);
    return await api.get<IFeePreAdmissionTransactionDetails[]>('fees', url);
}

export async function getPreadmissionStudentDropdownData(
    searchText: string,
    radiovalue: string
): Promise<IFeePreAdmissionStudentsDropDownList[]> {
    const url = `/FeePreadmission/getstudents?MI_Id=30&ASMAY_Id=231&SearchText=${searchText}&filterinitialdata=${radiovalue}`;
    console.info('preadmissiontransactiondetials api', url);
    const res = await api.get<IFeePreAdmissionStudentsDropDownList[]>('fees', url);
    return res.data ?? [];
}

export async function getPreadmissionStudentInformation(
    studentId: number,
    searchText: string
): Promise<IFeePreAdmissionStudentInformation[]> {
    const url = `/FeePreadmission/getStudentInfo?studentId=${studentId}&miId=30&asmayId=231&filterType=${searchText}`;
    console.info('preadmissiontransactiondetials api', url);
    const res = await api.get<IFeePreAdmissionStudentInformation[]>('fees', url);
    console.info('preadmissiontransactiondetials api', res);
    return res.data ?? []; // null;
}

export async function getPreadmissionStudentTermsData(studentId: number): Promise<IFeePreAdmissionStudentTermsDetails[]> {
    const url = `/FeePreadmission/terms?MI_Id=30&AMST_Id=${studentId}`;
    const res = await api.get<IFeePreAdmissionStudentTermsDetails[]>('fees', url);

    // Always return an array (never null)
    return res.data ?? [];
}

export async function getPreadmissionStudentTrasactionData(
    studentId: number,
    academicYear: number
): Promise<IFeePreAdmissionTransactionDetails[]> {
    const url = `FeePreadmission/feedashboard?MIId=30&ASMAY_Id=${academicYear}&StudentId=${studentId}`;

    console.info('Requesting preadmission transaction details:', { baseUrlKey: 'fees', url });

    // 👇 Don't wrap in <IFeeTransactionApiResponse> unless api.get() returns that shape directly
    const res = (await api.get('fees', url)) as IFeeTransactionApiResponse;

    console.info('Full preadmission transaction API response:', JSON.stringify(res, null, 2));

    // ✅ Safely extract feeTransactions
    const transactions = res?.data?.feeTransactions ?? [];

    console.info('Extracted transactions:', transactions);

    return transactions;
}

export async function addOrUpdateAmountEntry(data: any) {
    const url = '/fee_amount_entry';
    return await api.post<any>('fees', url, data);
}

export async function deleteAmountEntry(mi_id: number, asmay_id: number, id: number) {
    const url = `/fee_amount_entry/deletedetails/30/${asmay_id}/${id}`;
    console.info(url);
    return await api.put('fees', url);
}

export async function getCategorydrodowndata(academicYear_Id: number) {
    const url = `fee_amount_entry/getclass_categorylist?mi_id=30&asmay_id=${academicYear_Id}`;
    console.info(url);
    return await api.post<IFeeClassCategoryDropDownList>('fees', url);
}

export async function getgroupdrodown(academicYear_Id: number) {
    //const url = `fee_amount_entry/fee_grouplist?mi_id=30&asmay_id=${academicYear_Id}`;

    const url = 'fee_amount_entry/fee_grouplist?mi_id=30&asmay_id=231';
    return await api.post<IFeeGroupDropDownList>('fees', url);
}

export async function getAcademicYearDropdownData() {
    const url = '/fee_class_category/academicyearlist/30';
    return await api.get<IFeeAcademicyearDropDownList[]>('fees', url);
}

export async function addOrUpdatepaymentgatewaydetails(data: any) {
    const url = '/FeePaymentGatewayDetailsFacade';
    return await api.post<any>('fees', url, data);
}

export async function togglepaymentgatewaydetails(mi_id: number, id: number) {
    const url = `/FeePaymentGatewayDetailsFacade/deletePaymentGatewayDetails/${id}`;
    return await api.put('fees', url);
}

export async function getpaymentgateway_dropdown(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeePaymentGatewayDetailsFacade/paymentgatewaylist/30?${urlParams}`;
    return await api.get<IMasterpaymentGatewayDropdownList[]>('fees', url);
}

export async function getAmountentrydetails(mi_id: number, asmay_id: number, fmcC_id: number, fmG_id: number) {
    const url = `/fee_amount_entry/getgroupmappedheads/${mi_id}/${asmay_id}/${fmcC_id}/${fmG_id}`;
    return await api.get<IMasterAmountEntryDetails[]>('fees', url);
}
