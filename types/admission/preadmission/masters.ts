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
