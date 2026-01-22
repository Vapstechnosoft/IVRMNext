export interface IRackReportInitialData {
    lib_list: Array<{
        lmaL_Id: number;
        lmaL_LibraryName: string;
    }>;
    racklist: Array<{
        lmrA_Id: number;
        lmrA_RackName: string;
        lmrA_FloorName?: string; // Optional based on usage
    }>;
    floorlist?: Array<any>; // Kept for consistency if API returns it, though unused in JS logic for filtering
}

export interface IRackReportRequest {
    LMAL_Id: number;
    LMRA_RackName: string; // JS passes string name, not ID
}

export interface IRackReportGridData {
    lmbano_AccessionNo: string;
    lmb_BookTitle: string;
    rack_Name: string;
    lmra_FloorName: string;
    lmb_BookType: string;
    rack_Location: string;
    lmbano_AvialableStatus: string;
}

export interface IRackReportResponse {
    reportlist: IRackReportGridData[];
}
