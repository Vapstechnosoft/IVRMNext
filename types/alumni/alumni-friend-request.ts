export interface IAlumniFriendRequest {
    ALMST_Id: number;
    studentname: string;
    ASMAY_Year: string;
    ALSFRND_RequestDate: string | null;
    ALSFRND_AcceptedDate: string | null;
    ALSFRND_AcceptFlag: 'ACCEPT' | 'REJECT' | null;
    checktru?: boolean;
    selected?: boolean;
}

export interface IAlumniProfile {
    ALMST_Id: number;
    alumniname: string;
    ASMAY_Year: string;
    ALMST_MobileNo: string;
    ALMST_emailId: string;
    ALMST_StudentPhoto: string;
}

export interface IAlumniFriendRequestLoadResponse {
    searchResult: IAlumniFriendRequest[];
    friendrequest: any[]; // List of existing requests
}

export interface IAlumniProfileResponse {
    almst_profile: IAlumniProfile[];
}
