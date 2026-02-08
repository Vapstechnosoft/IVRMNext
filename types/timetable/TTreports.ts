export interface IstaffLoadDataTTStaffReport {
    ttlAB_Id: number;
    ASMAYYear: string;
    CategoryName: string;
    TTLAB_LABLIBName: string;
    TTLAB_ActiveFlag: boolean;
}

export interface ISectionDropdown {
    asmS_Id: number;
    mI_Id: number;
    asmC_SectionName: string;
    asmC_SectionCode: string;
    asmC_Order: number;
    asmC_ActiveFlag: number;
    asmC_MaxCapacity: number;
    createdDate: string; // ISO date string
    updatedDate: string; // ISO date string
}
