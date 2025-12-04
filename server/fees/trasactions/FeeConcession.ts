'use server';

import { api } from '@/lib/apiService';
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
    const url = `/FeeConcessionFacade/getacademicyears/${mi_Id || 30}`;
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

export async function getConcessionStudentList(mi_Id: number, asmaY_Id: number, asmcL_Id: number) {
    const url = `FeeConcessionFacade/getdashboard/students?MiId=${mi_Id || 30}&AsmayId=${asmaY_Id || 0}&AsmclId=${asmcL_Id || 0}`;
    return await api.get<IFeeConcessionStudentList[]>('fees', url);
}

export async function getConcessionStudentConcessionGrid(mi_Id: number, asmaY_Id: number, asmcL_Id: number) {
    const url = `FeeConcessionFacade/getstudentconcessions?MiId=${mi_Id || 30}&AsmayId=${asmaY_Id || 0}&AsmclId=${asmcL_Id || 0}`;
    return await api.get<IFeeConcessionStudentConcessionGrid[]>('fees', url);
}
