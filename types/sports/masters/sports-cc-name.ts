export interface SportsCCNameDTO {
    SPCCMSCC_Id: number;
    SPCCMSCCG_Id: number;
    groupName?: string; // For display
    SPCCMSCC_SportsCCName: string;
    SPCCMSCC_SportsCCDesc: string;
    SPCCMSCC_SGFlag: string;
    SPCCMSCC_NoOfMembers: number;
    SPCCMSCC_RecHighLowFlag: string;
    SPCCMSCC_RecInfo?: string;
    SPCCMSCC_MultiAttemptFlg: boolean;
    SPCCMSCC_NoOfAttempts?: number | null;
    spccmscC_ActiveFlag?: boolean;
    tempDatas?: SportsCCNameSubEventDTO[];
}

export interface SportsCCNameSubEventDTO {
    SPCCMSCCG_Id?: number; // Primary key for sub-event mapping if exists
    SPCCMSCCG_UnderEvent: string;
}

export interface SportsCCNameGroupDTO {
    spccmsccG_Id: number;
    spccmsccG_SportsCCGroupName: string;
}

export interface SportsCCNameMasterDataDTO {
    gropList: SportsCCNameGroupDTO[];
}
