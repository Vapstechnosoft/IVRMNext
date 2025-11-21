export interface MasterCourseResponse {
    success?: boolean;
    message?: string;
    data?: CourseDetail[] | {
        CourseList: CourseDetail[];
    };
    CourseList?: CourseDetail[];
    retrunMsg?: string;
    total?: number;
    page?: number;
    page_size?: number;
}

export interface CourseDetail {
    HRMC_Id: number;
    MI_Id: number;
    HRMC_QulaificationName: string;
    HRMC_QualificationDesc: string;
    HRMC_Order: number;
    HRMC_ActiveFlag: boolean;
    HRMC_DefaultQualFag: boolean;
    HRMC_SpecialisationFlag: boolean;
    CreatedDate: string;
    UpdatedDate: string;
}

export interface MasterCourseInput {
    HRMC_Id?: number;
    MI_Id: number;
    HRMC_QulaificationName: string;
    HRMC_QualificationDesc: string;
    HRMC_Order?: number;
    HRMC_ActiveFlag: boolean;
    HRMC_DefaultQualFag: boolean;
    HRMC_SpecialisationFlag: boolean;
}
