export interface SportHouseReportData {
    id: number;
    SPCCMH_HouseName: string;
    AMST_Name: string;
    AMST_AdmNo: string;
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    AMST_MobileNo: string;
    AMST_emailId: string;
}

export interface SportHouseReportProps {
    searchParams: { [key: string]: string | string[] | undefined };
}
