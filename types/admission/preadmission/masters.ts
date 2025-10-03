export interface IMasterClassList {
    asmcL_Id: number;
    mI_Id: number;
    asmcL_ClassCode: string;
    asmcL_ClassName: string;
    asmcL_Order: number;
    asmcL_MinAgeYear: number;
    asmcL_MinAgeMonth: number;
    asmcL_MinAgeDays: number;
    asmcL_MaxAgeYear: number;
    asmcL_MaxAgeMonth: number;
    asmcL_MaxAgeDays: number;
    asmcL_MaxCapacity: number;
    asmcL_PreadmFlag: number;
    asmcL_ActiveFlag: boolean;
}
export interface IMasterCategoryList {
    amC_Id: number;
    mI_Id: number;
    amC_Name: string;
    amC_Address: string;
    amC_Type: string;
    amC_ActiveFlag: number;
    amC_PAApplicationName: string;
    createdDate: string;
    updatedDate: string;
}
export interface IMasterSectionList {
    asmS_Id: number;
    mI_Id: number;
    asmC_SectionCode: string;
    asmC_SectionName: string;
    asmC_Order: number;
    asmC_MaxCapacity: number;
    asmC_ActiveFlag: number;
    createdDate: string;
    updatedDate: string;
}
export interface IMasterReligionList {
    ivrmmR_Id: number;
    ivrmmR_Name: string;
    is_Active: boolean;
    createdDate: string;
    updatedDate: string;
}
export interface IMasterClassCategoryList {
    asmcC_Id: number;
    asmaY_Year: string;
    amC_Name: string;
    asmcL_ClassName: string;
    is_Active: number;
}
export interface IAcademicYearDropDown {
    asmaY_Id: number;
    asmaY_Year: string;
    asmaY_Order: number;
}
export interface IMasterCategoryDropDown {
    amC_Id: number;
    amC_Name: string;
}
export interface IMasterClassDropDown {
    asmcL_Id: number;
    asmcL_ClassCode: string;
    asmcL_ClassName: string;
    asmcL_Order: number;
}
export interface IMasterSectionDropDown {
    asmS_Id: number;
    asmC_SectionCode: string;
    asmC_SectionName: string;
    asmC_Order: number;
}
