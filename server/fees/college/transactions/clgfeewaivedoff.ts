'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    ICollegeBranch,
    ICollegeCourse,
    ICollegeFeeGroup,
    ICollegeFeeHeadItem,
    ICollegeFeeWaivedOffAllDetailsResponse,
    ICollegeFeeWaivedOffEditDetails,
    ICollegeFeeWaivedOffSavePayload,
    ICollegeSemester,
    ICollegeStudent
} from '@/types/fees/college/transactions/clgfeewaivedoff';

// 1. Grid & Initial Details: Academic Years and Saved Waived Off Grid -> /CLGFeeWaivedOffFacade/getalldetails
export async function getCollegeFeeWaivedOffAllDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'amcsT_FirstName,fmH_FeeName,ftI_Name,fcswO_WaivedOffAmount,fcswO_Date');
    const url = `/CLGFeeWaivedOffFacade/getalldetails?${urlParams}`;
    return await api.get<ICollegeFeeWaivedOffAllDetailsResponse>('fees', url);
}

// 2. Dropdown: Courses by Academic Year -> /CLGFeeOpeningBalanceFacade/get_courses
export async function getCollegeCourses(asmaY_Id: number) {
    const url = '/CLGFeeOpeningBalanceFacade/get_courses';
    return await api.post<{ courselist?: ICollegeCourse[] } | ICollegeCourse[]>('fees', url, {
        ASMAY_Id: asmaY_Id,
        asmaY_Id: asmaY_Id
    });
}

// 3. Dropdown: Branches by Course -> /CLGFeeOpeningBalanceFacade/get_branches
export async function getCollegeBranches(asmaY_Id: number, amcO_Id: number) {
    const url = '/CLGFeeOpeningBalanceFacade/get_branches';
    return await api.post<{ branchlist?: ICollegeBranch[] } | ICollegeBranch[]>('fees', url, {
        ASMAY_Id: asmaY_Id,
        asmaY_Id: asmaY_Id,
        AMCO_Id: amcO_Id,
        amcO_Id: amcO_Id
    });
}

// 4. Dropdown: Semesters by Branch -> /CLGFeeOpeningBalanceFacade/get_semisters
export async function getCollegeSemesters(asmaY_Id: number, amcO_Id: number, amB_Id: number) {
    const url = '/CLGFeeOpeningBalanceFacade/get_semisters';
    return await api.post<{ semisterlist?: ICollegeSemester[] } | ICollegeSemester[]>('fees', url, {
        ASMAY_Id: asmaY_Id,
        asmaY_Id: asmaY_Id,
        AMCO_Id: amcO_Id,
        amcO_Id: amcO_Id,
        AMB_Id: amB_Id,
        amB_Id: amB_Id
    });
}

// 5. Dropdown: Students by Semester -> /CLGFeeWaivedOffFacade/get_students
export async function getCollegeStudents(asmaY_Id: number, amcO_Id: number, amB_Id: number, amsE_Id: number) {
    const url = '/CLGFeeWaivedOffFacade/get_students';
    return await api.post<{ studentlist?: ICollegeStudent[] } | ICollegeStudent[]>('fees', url, {
        ASMAY_Id: asmaY_Id,
        asmaY_Id: asmaY_Id,
        AMCO_Id: amcO_Id,
        amcO_Id: amcO_Id,
        AMB_Id: amB_Id,
        amB_Id: amB_Id,
        AMSE_Id: amsE_Id,
        amsE_Id: amsE_Id
    });
}

// 6. Groups List: Groups by Student & Refundable Filter -> /CLGFeeWaivedOffFacade/get_groups
export async function getCollegeGroups(payload: { asmaY_Id: number; amcsT_Id: number; filterrefund: string }) {
    const url = '/CLGFeeWaivedOffFacade/get_groups';
    return await api.post<{ grouplist?: ICollegeFeeGroup[] } | ICollegeFeeGroup[]>('fees', url, {
        asmaY_Id: payload.asmaY_Id,
        ASMAY_Id: payload.asmaY_Id,
        amcsT_Id: payload.amcsT_Id,
        AMCST_Id: payload.amcsT_Id,
        filterrefund: payload.filterrefund
    });
}

// 7. Fee Heads Table: Fee Heads by Groups -> /CLGFeeWaivedOffFacade/get_heads
export async function getCollegeHeads(payload: {
    ASMAY_Id: number;
    AMCST_Id: number;
    filterrefund: string;
    multiplegroup: string;
}) {
    const url = '/CLGFeeWaivedOffFacade/get_heads';
    return await api.post<{ headlist?: ICollegeFeeHeadItem[] } | ICollegeFeeHeadItem[]>('fees', url, {
        ASMAY_Id: payload.ASMAY_Id,
        asmaY_Id: payload.ASMAY_Id,
        AMCST_Id: payload.AMCST_Id,
        amcsT_Id: payload.AMCST_Id,
        filterrefund: payload.filterrefund,
        multiplegroup: payload.multiplegroup
    });
}

// 8. Save / Update -> /CLGFeeWaivedOffFacade/savedata or /CLGFeeWaivedOffFacade/savadata
export async function saveCollegeFeeWaivedOff(data: ICollegeFeeWaivedOffSavePayload) {
    const url = '/CLGFeeWaivedOffFacade/savedata';
    return await api.post<any>('fees', url, data);
}

// 9. Edit Details: Get by ID -> /CLGFeeWaivedOffFacade/EditDetails/{fcswO_Id}
export async function getCollegeFeeWaivedOffEditDetails(fcswO_Id: number) {
    const url = `/CLGFeeWaivedOffFacade/EditDetails/${fcswO_Id}`;
    return await api.get<ICollegeFeeWaivedOffEditDetails>('fees', url);
}

// 10. Delete Record: Delete by ID -> /CLGFeeWaivedOffFacade/DeletRecord/{fcswO_Id}
export async function deleteCollegeFeeWaivedOff(fcswO_Id: number) {
    const url = `/CLGFeeWaivedOffFacade/DeletRecord/${fcswO_Id}`;
    return await api.delete<any>('fees', url);
}
