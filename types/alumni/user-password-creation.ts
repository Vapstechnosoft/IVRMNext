export interface IUserPasswordCreationInitialData {
    yearList: IYear[];
    classlist: IClass[];
    sectionlist: ISection[];
}

export interface IYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface IClass {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

export interface ISection {
    asmS_Id: number;
    asmC_SectionName: string;
}

export interface IStudent {
    studentname: string;
    amsT_AdmNo: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    amsT_Id: number;
    selected?: boolean;
}

export interface IUserPasswordCreationReportResponse {
    success: boolean;
    message: string;
    messagelist: IStudent[];
}
