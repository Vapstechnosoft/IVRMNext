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
    lp_role: string;
    asmaY_Id: number;
    hrmE_Id: number;
    details: {
        asmcL_Id: number;
        asmS_Id: number;
        ismS_Id?: number; // Optional subject
    }[];
}
