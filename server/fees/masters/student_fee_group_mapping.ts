'use server';
import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IMasterAdmClassCategoryMappingList,
    IMasterClassYearlyList,
    IMasterFeeBusRoutingMappingList,
    IMasterFeeCasteCategoryMappingList,
    IMasterFeeClassDropDownList,
    IMasterFeeGroupHeadMappinList,
    IMasterFeeGroupList,
    IMasterFeeHeadList,
    IMasterFeeInstallmentList,
    IMasterFeeSectionDropDownList,
    IMasterStudentClassMappingList,
    IMasterStudentFeeGroupMappingList,
    StudentFeeGroupSummaryById
} from '@/types/fees/masters/masters';

export async function getStudentFeeGroupMapping(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/StudentFeeGroupMappingFacade/getalldetails?${urlParams}`;
    return await api.get<IMasterStudentFeeGroupMappingList[]>('fees', url);
}

export async function deleteStudentFeeGroupMapping(AMST_Id: number, FMG_Id: number, FMSG_Id: number) {
    const url = `/StudentFeeGroupMappingFacade/deleteStudentFeeGroupMapping?MI_Id=30&AMST_Id=${AMST_Id}&ASMAY_Id=15877&FMG_Id=${FMG_Id}&FMSG_Id=${FMSG_Id}`;
    return await api.delete('fees', url);
}

export async function getStudentFeeGroupMappingAcademicYearDropdown() {
    const url = '/fee_class_category/academicyearlist/30';
    return await api.get<IMasterClassYearlyList[]>('fees', url);
}

export async function getAdmClassCategorydropdown() {
    const url = '/StudentFeeGroupMappingFacade/getAdmissionCategories?MI_Id=30';
    return await api.get<IMasterAdmClassCategoryMappingList[]>('fees', url);
}

export async function getFeeClassCategorydropdown() {
    const url = '/StudentFeeGroupMappingFacade/getAdmissionCategories?MI_Id=30';
    return await api.get<IMasterAdmClassCategoryMappingList[]>('fees', url);
}

export async function getclassdropdown() {
    const url = '/FeeStudentTransaction/class-details';
    return await api.get<IMasterFeeClassDropDownList[]>('fees', url);
}

export async function getSectionropdown() {
    const url = '/FeeStudentTransaction/section-details';
    return await api.get<IMasterFeeSectionDropDownList[]>('fees', url);
}

export async function getFeeBusRoutingdropdown() {
    const url = 'StudentFeeGroupMappingFacade/getBusRoutes?MI_Id=30';
    return await api.get<IMasterFeeBusRoutingMappingList[]>('fees', url);
}

export async function getFeeCasteCategorydropdown() {
    const url = 'StudentFeeGroupMappingFacade/getCasteList';
    return await api.get<IMasterFeeCasteCategoryMappingList[]>('fees', url);
}

export async function getStudentClassMapping(academicYear: number, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/StudentFeeGroupMappingFacade/getStudentClassMapping?MIId=30&AcademicYearId=${academicYear}&${urlParams}`;
    return await api.get<IMasterStudentClassMappingList[]>('fees', url);
}

export async function getStudentFeeGroupList() {
    const url = '/StudentFeeGroupMappingFacade/getGroupMappingList?asmay_id=231';
    return await api.get<IMasterFeeGroupList[]>('fees', url);
}

export async function getStudentFeeHeadList(groupId: any) {
    const url = '/StudentFeeGroupMappingFacade/getHeadMappingList?asmay_id=231';
    return await api.post<IMasterFeeHeadList[]>('fees', url, groupId);
}

export async function getStudentFeeInstallmentList(groupId: any) {
    const url = '/StudentFeeGroupMappingFacade/getInstallmentMappingList?asmay_id=231';
    return await api.post<IMasterFeeInstallmentList[]>('fees', url, groupId);
}

export async function getStudentFeeGeoupHeadMapping() {
    const url = '/StudentFeeGroupMappingFacade/getFeeMappingSummaryById?MI_Id=30&ASMAY_Id=231';
    return await api.get<IMasterFeeGroupHeadMappinList[]>('fees', url);
}

export async function getStudentFeeSummaryById(academicId: number, studentId: number): Promise<StudentFeeGroupSummaryById[]> {
    const url = `/StudentFeeGroupMappingFacade/getFeeMappingSummaryById?MI_Id=30&ASMAY_Id=${academicId}&AMST_Id=${studentId}`;
    const response = await api.get<any>('fees', url);
    return response.data?.feeGroups ?? [];
}

export async function getStudentFeeSave(palyload: any) {
    const url = '/StudentFeeGroupMappingFacade/saveStudentFeeMappings';
    return await api.post<any>('fees', url, palyload);
}
