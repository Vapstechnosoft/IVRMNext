'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    ICollegeAcademicYear,
    ICollegeFeeGroup,
    ICollegeFeeHead,
    ICollegeFeePrevilegeAllDetails,
    ICollegeFeeUser
} from '@/types/fees/college/masters/masterclgfeeprevilege';

export async function getCollegeFeePrivilegeAcademicYears() {
    const url = '/MasterClgFeePrevilegeFacade/getacademicyears';
    return await api.get<{ adcyear: ICollegeAcademicYear[] } | ICollegeAcademicYear[]>('fees', url);
}

export async function getCollegeFeePrivilegeFeeGroups() {
    const url = '/MasterClgFeePrevilegeFacade/getfeegroups';
    return await api.get<{ group: ICollegeFeeGroup[] } | ICollegeFeeGroup[]>('fees', url);
}

export async function getCollegeFeePrivilegeFeeHeads() {
    const url = '/MasterClgFeePrevilegeFacade/getfeeheads';
    return await api.get<{ head: ICollegeFeeHead[]; feeheads?: ICollegeFeeHead[] } | ICollegeFeeHead[]>('fees', url);
}

export async function getCollegeFeePrivilegeUsersByRole(roleId: number) {
    const url = '/MasterClgFeePrevilegeFacade/getusername';
    return await api.post<{ usnam?: ICollegeFeeUser[]; userlist?: ICollegeFeeUser[] } | ICollegeFeeUser[]>('fees', url, {
        ivrmrT_Id: Number(roleId)
    });
}

export async function getCollegeFeePrivilegeList(searchParams?: ApiSearchparams) {
    const url = '/MasterClgFeePrevilegeFacade/getpagedetails';
    return await api.post<ICollegeFeePrevilegeAllDetails>('fees', url);
}

export async function saveCollegeFeePrivilege(data: any) {
    const url = '/MasterClgFeePrevilegeFacade/savedetail';
    return await api.post<any>('fees', url, data);
}

export async function deleteCollegeFeePrivilege(fglId: number) {
    const url = `/MasterClgFeePrevilegeFacade/delete/${fglId}`;
    return await api.get<any>('fees', url);
}
