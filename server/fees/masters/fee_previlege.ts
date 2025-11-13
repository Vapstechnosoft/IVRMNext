'use server';

import { api } from '@/lib/apiService';
// import type { ApiSearchparams } from '@/types';
import type { IMasterFeePrevilegeList, IMasterGroupDropdown, IMasterRoleDropdown } from '@/types/fees/masters/masters';

export async function getGroupsDropdown() {
    const url = '/fee_class_category/academicyearlist/30';
    return await api.get<IMasterGroupDropdown[]>('fees', url);
}
export async function getRolesDropdown() {
    const url = '/fee_class_category/academicyearlist/30';
    return await api.get<IMasterRoleDropdown[]>('fees', url);
}

export async function addOrUpdateFeePrivilege(data: any) {
    const url = '/FeePaymentGatewayDetailsFacade';
    return await api.post<any>('fees', url, data);
}

export async function getFeePrevilegeList() {
    const url = '/FeePrevilege/GetMasterFeePreviledgeList?mi_Id=30';
    return await api.get<IMasterFeePrevilegeList[]>('fees', url);
}
