'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    ICollegeAcademicYear,
    ICollegeFeeGroup,
    ICollegeFeeHead,
    ICollegeFeePrevilegeAllDetails,
    ICollegeFeeRole,
    ICollegeFeeUser
} from '@/types/fees/college/masters/masterclgfeeprevilege';

// 1. Dropdown: Academic Years -> /CommonCollegeFee/getacademicyears
export async function getCollegeFeePrivilegeAcademicYears() {
    const url = '/CommonCollegeFee/getacademicyears';
    return await api.get<{ adcyear?: ICollegeAcademicYear[]; yearlist?: ICollegeAcademicYear[] } | ICollegeAcademicYear[]>('fees', url);
}

// 2. Dropdown: Roles -> /CommonCollegeFee/getroles
export async function getCollegeFeePrivilegeRoles() {
    const url = '/CommonCollegeFee/getroles';
    return await api.get<{ role?: ICollegeFeeRole[]; rolelist?: ICollegeFeeRole[]; roles?: ICollegeFeeRole[] } | ICollegeFeeRole[]>('fees', url);
}

// 3. Dropdown: Fee Groups -> /CommonCollegeFee/getfeegroups
export async function getCollegeFeePrivilegeFeeGroups() {
    const url = '/CommonCollegeFee/getfeegroups';
    return await api.get<{ group?: ICollegeFeeGroup[]; grouplist?: ICollegeFeeGroup[] } | ICollegeFeeGroup[]>('fees', url);
}

// 4. Dropdown: Fee Heads -> /CommonCollegeFee/getfeeheads
export async function getCollegeFeePrivilegeFeeHeads() {
    const url = '/CommonCollegeFee/getfeeheads';
    return await api.get<{ head?: ICollegeFeeHead[]; feeheads?: ICollegeFeeHead[] } | ICollegeFeeHead[]>('fees', url);
}

// 5. Dropdown: Users by Role -> /MasterClgFeePrevilegeFacade/getusername?IVRMRT_Id=1
export async function getCollegeFeePrivilegeUsersByRole(roleId: number) {
    const url = `/MasterClgFeePrevilegeFacade/getusername?IVRMRT_Id=${roleId}`;
    return await api.get<{ usnam?: ICollegeFeeUser[]; userlist?: ICollegeFeeUser[] } | ICollegeFeeUser[]>('fees', url);
}

// 6. Grid: Page Details with Search, Sort, and Pagination -> /MasterClgFeePrevilegeFacade/getpagedetails
export async function getCollegeFeePrivilegeList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'NormalizedUserName,FMG_GroupName,FMH_FeeName,IVRMRT_Role');
    const url = `/MasterClgFeePrevilegeFacade/getpagedetails?${urlParams}`;
    return await api.get<ICollegeFeePrevilegeAllDetails>('fees', url);
}

// 7. Edit: Edit by ID -> /MasterClgFeePrevilegeFacade/edit/{FGL_Id}
export async function getCollegeFeePrivilegeEdit(fglId: number) {
    const url = `/MasterClgFeePrevilegeFacade/edit/${fglId}`;
    return await api.get<any>('fees', url);
}

// 8. Save: Save / Update -> /MasterClgFeePrevilegeFacade/savedetail
export async function saveCollegeFeePrivilege(data: any) {
    const url = '/MasterClgFeePrevilegeFacade/savedetail';
    return await api.post<any>('fees', url, data);
}

// 9. Delete: Delete by ID -> /MasterClgFeePrevilegeFacade/delete/{FGL_Id}
export async function deleteCollegeFeePrivilege(fglId: number) {
    const url = `/MasterClgFeePrevilegeFacade/delete/${fglId}`;
    return await api.delete<any>('fees', url);
}
