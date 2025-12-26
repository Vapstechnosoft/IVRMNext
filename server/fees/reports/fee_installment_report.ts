'use server';

import { api } from '@/lib/apiService';
import type {
    IInstallmentReportFeeBusRoutrDropdownList,
    IInstallmentReportFeeCategoryDropdownList,
    IInstallmentReportFeeTermDropdownList,
    InstallmentReportGroupDropdownList,
    InstallmentReportHeadDropdownList,
    InstallmentReportInstallemntDropdownList
} from '@/types/fees/reports/reports';

export async function getFeeInstallmentReportTermDropdown() {
    const url = '/FeesCommon/fee-term-details';
    return await api.get<IInstallmentReportFeeTermDropdownList[]>('fees', url);
}

export async function getFeeInstallmentReportCategoryDropdown() {
    const url = '/FeeInstallmentReport/category-dropdown';
    return await api.get<IInstallmentReportFeeCategoryDropdownList[]>('fees', url);
}

export async function getInstallemntReportInstallmentDropdownData(asmaY_Id: number) {
    const url = `/FeeInstallmentReport/installment-dropdown?asmay_id=${asmaY_Id}`;

    console.info('getInstallmentDropdownData url:', url);
    return await api.get<InstallmentReportInstallemntDropdownList[]>('fees', url);
}

export async function getFeeInstallmentReportGropDropdown() {
    const url = '/FeeInstallmentReport/group-dropdown';
    return await api.get<InstallmentReportGroupDropdownList[]>('fees', url);
}

export async function getFeeInstallmentReportBusRouteDropdown() {
    const url = '/FeeInstallmentReport/bus-route-dropdown';
    return await api.get<IInstallmentReportFeeBusRoutrDropdownList[]>('fees', url);
}

export async function getFeeInstallmentReportHeadDropdown(asmay_Id: number, fmg_Id: number) {
    const url = `/FeeInstallmentReport/head-by-group?fmgId=${fmg_Id}&asmayId=${asmay_Id}`;

    console.info('getFeeInstallmentReportHeadDropdown url:', url);
    return await api.get<InstallmentReportHeadDropdownList[]>('fees', url);
}
