export interface IReligionDropdown {
    ivrmmR_Id: number;
    ivrmmR_Name: string;
}
export interface ICasteDropdown {
    imC_Id: number;
    imC_CasteName: string;
}
export interface ICountryDropdown {
    ivrmmC_Id: number;
    ivrmmC_CountryName: string;
}
export interface IStateDropdown {
    ivrmmS_Id: number;
    ivrmmS_Name: string;
}
export interface IGenderDropdown {
    ivrmmG_Id: number;
    ivrmmG_GenderName: string;
}
export interface ISourceDropdown {
    pamS_Id: number;
    pamS_SourceName: string;
}
export interface IReferenceDropdown {
    pamR_Id: number;
    pamR_ReferenceName: string;
}
export interface IPreadmissionDocumentDropdown {
    amsmD_Id: number;
    amsmD_DocumentName: string;
    amsmD_FLAG: boolean;
}
export interface IPreadmissionClassDropdown {
    asmcL_Id: number;
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
}
