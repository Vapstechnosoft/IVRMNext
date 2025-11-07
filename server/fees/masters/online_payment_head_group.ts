'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterClassYearlyList } from '@/types/fees/masters/masters';

export async function getAcademicYearDropdown() {
    const url = '/fee_class_category/academicyearlist/30';
    return await api.get<IMasterClassYearlyList[]>('fees', url);
}

export async function getOnlinePaymentHeadGroupInstallment(academicYears?: number) {
    const url = `/OnlinePaymentHeadGroupMapping/fee_installment_yearlly_drop_down_list/30/${academicYears}`;
    return await api.get<IMasterClassYearlyList[]>('fees', url);
}

export async function getClassDropDownList(academicYears?: number) {
    //   const urlParams = getSearchParamsUrl(academicYears ?? {}, "asmaY_Id");
    const url = `/OnlinePaymentHeadGroupMapping/class_drop_down_list/30/${academicYears}`;
    return await api.get<IMasterClassYearlyList[]>('fees', url);
}

export async function getSubMerchantDropDownList(academicYears?: number) {
    //   const urlParams = getSearchParamsUrl(academicYears ?? {}, "asmaY_Id");
    const url = `/OnlinePaymentHeadGroupMapping/sub_merchant_drop_down_list/30/${academicYears}`;
    return await api.get<IMasterClassYearlyList[]>('fees', url);
}

export async function getGroupNameDropDownList(academicYears?: number) {
    //   const urlParams = getSearchParamsUrl(academicYears ?? {}, "asmaY_Id");
    const url = `/OnlinePaymentHeadGroupMapping/groupName_drop_down_list/30/${academicYears}`;
    return await api.get<IMasterClassYearlyList[]>('fees', url);
}

export async function getHeadNameDropDownList(academicYears?: number, groupName?: number) {
    //   const urlParams = getSearchParamsUrl(academicYears ?? {}, "asmaY_Id");
    const url = `/OnlinePaymentHeadGroupMapping/headname_drop_down_list/30/${academicYears}/${groupName}`;
    return await api.get<IMasterClassYearlyList[]>('fees', url);
}

export async function getFeeOnlinePaymentHeadGroupTable(searchParams?: ApiSearchparams) {
    console.info('OnlinePaymentHeadGroupMapping params:', searchParams);
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'asmcL_ClassName');
    const url = `/OnlinePaymentHeadGroupMapping/OnlinePaymentHeadGroupMappingList/30?${urlParams}`;
    return await api.get<IMasterClassYearlyList[]>('fees', url);
}

export async function addMasterOnlinePaymentHeadGroup(data: any) {
    const url = '/OnlinePaymentHeadGroupMapping/AddOrUpdateOnlinePaymentHeadGroupMapping';
    return await api.post<any>('fees', url, data);
}

export async function getOnlinePaymentHeadGroupEdit(fopM_Id: number) {
    const url = `/OnlinePaymentHeadGroupMapping/edit/${fopM_Id}`;
    return await api.get<{
        length: number;
        success: boolean;
        message: string;
        data: Array<{
            fopM_Id: number;
            mI_Id: number;
            fmH_Id: number;
            createdDate: string;
            updatedDate: string;
            fpgd_id: number;
            fmg_id: number;
            fti_id: number;
            fmt_id: number;
            asmcL_Id: number;
            preAdmFlag: boolean;
        }>;
    }>('fees', url);
}
