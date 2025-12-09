'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    FeeConcessionTermDropdown,
    IFeeConcessionAcademicyearDropDownList,
    IFeeConcessionCategoryDropDownList,
    IFeeConcessionClassDropDownList,
    IFeeConcessionHeadList,
    IFeeConcessionStudentConcessionGrid,
    IFeeConcessionStudentList
} from '@/types/fees/transactions/transactions';

export async function getConcessionTermDropdownData(mi_id: number) {
    const url = `FeeConcessionFacade/getterms/${mi_id || 30}`;
    return await api.get<FeeConcessionTermDropdown[]>('fees', url);
}

export async function getConcessionAcademicDropdownData(mi_Id: number) {
    const url = `FeeConcessionFacade/getacademicyears/${mi_Id || 30}`;
    return await api.get<IFeeConcessionAcademicyearDropDownList[]>('fees', url);
}

export async function getConcessionClassesDropdownData(mi_Id: number) {
    const url = `FeeConcessionFacade/getclasses/${mi_Id || 30}`;
    return await api.get<IFeeConcessionClassDropDownList[]>('fees', url);
}

export async function getConcessionCategoryDropdownData(mi_Id: number) {
    const url = `FeeConcessionFacade/getfeeconcessioncategories/${mi_Id || 30}`;
    return await api.get<IFeeConcessionCategoryDropDownList[]>('fees', url);
}

export async function getConcessionHeadList(mi_Id: number, asmaY_Id: number, asmcL_Id: number) {
    const url = `FeeConcessionFacade/Getfee-heads?MiId=${mi_Id || 30}&AsmayId=${asmaY_Id || 0}&AsmclId=${asmcL_Id || 0}`;
    return await api.get<IFeeConcessionHeadList[]>('fees', url);
}

export async function getConcessionStudentList(
    radiobtnvalue: string,
    asmaY_Id: number,
    asmcL_Id: number,
    amcId: number,
    fmccId: number,
    searchParams?: ApiSearchparams
) {
    const url = `FeeConcessionFacade/student-list?radiobtnvalue=${radiobtnvalue}&asmayId=${asmaY_Id || 0}&asmclId=${asmcL_Id || 0}&amcId=${amcId || 0}&fmccId=${fmccId || 0}`;
    return await api.get<IFeeConcessionStudentList[]>('fees', url);
}

export async function getConcessionStudentConcessionGrid(
    mi_Id: number,
    asmaY_Id: number,
    asmcL_Id: number,
    searchParams?: ApiSearchparams
) {
    const url = `FeeConcessionFacade/getstudentconcessions?MiId=${mi_Id || 30}&AsmayId=${asmaY_Id || 0}&AsmclId=${asmcL_Id || 0}`;
    return await api.get<IFeeConcessionStudentConcessionGrid[]>('fees', url);
}
export async function saveFeeHead(data: any) {
    const url = 'FeeConcessionFacade/save-fee-concession';
    return await api.post<any>('fees', url, data);
}

export async function deleteFeeConcession(fsC_Id: number) {
    const url = `/FeeConcessionFacade/deletefeeconcession/${fsC_Id}`;
    return await api.delete<any>('fees', url);
}

export async function getConcessionHeadDetailsList(asmaY_Id: number, amsT_Id: number, fmT_Id: number, configSet: string) {
    const url = `FeeConcessionFacade/head-details?asmayId=${asmaY_Id || 0}&amstId=${amsT_Id || 0}&fmtId=${fmT_Id}&configSet=${configSet || 0}`;
    return await api.get<IFeeConcessionHeadList[]>('fees', url);
}
