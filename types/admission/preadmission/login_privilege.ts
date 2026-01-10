export interface ILoginPrivilege {
    lp_id: number;
    lp_role: string;
    lp_year: string;
    lp_staff_name: string;
    lp_classes: string;
    lp_sections: string;
    lp_subjects: string;
    lp_active_flag: boolean;
    hrmE_Id: number;
    asmaY_Id: number;
}

export interface ILoginPrivilegeDTO {
    asalU_Id: number;
    asalU_EntryTypeFlag: number;
    asmaY_Id: number;
    hrmE_Id: number;
    mI_Id: number;
    classSections: {
        asmcL_Id: number;
        asmC_Id: number;
    }[];
    classSectionSubjects: {
        asmcL_Id: number;
        asmC_Id: number;
        subjectIds: number[];
    }[];
    // Keep internal logic properties if needed or just use these
}
