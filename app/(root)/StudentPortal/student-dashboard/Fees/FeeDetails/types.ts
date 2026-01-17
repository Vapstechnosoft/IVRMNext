export interface AcademicYear {
    ASMAY_Id: number;
    ASMAY_Year: string;
    ASMCL_ClassName?: string;
    ASMC_SectionName?: string;
}

export interface FeeHeadData {
    FEE_HEAD: string;
    RECEIVABLE: number;
    CONCESSION: number;
    COLLECTION: number;
    ADJUSTMENT: number;
    BALANCE: number;
    FMH_Id?: number;
}

// Legacy API response structure often uses PascalCase or mixed case, matching the user's provided code
export interface FeeDetailsOverallData {
    Receivable: number;
    Concession: number;
    Collectionamount: number;
    Adjusted: number;
    Balance: number;
}

export interface FeeDetailsLoadData {
    yearclsList: AcademicYear[];
    feecurrentyear: AcademicYear[];
}

export interface FeeDetailsRequest {
    ASMAY_Id: number;
    type: "overall" | "detailed";
}

export interface FeeDetailsResponse {
    getfeedetails: (FeeHeadData & FeeDetailsOverallData)[]; // The API seems to return a mixed object or different objects based on type
}
