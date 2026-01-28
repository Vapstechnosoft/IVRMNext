export interface HouseInchargeReportData {
    id: number;
    // ASMAY_Year: string; // Not shown in grid cols but in data
    SPCCMH_HouseName: string;
    EmpName: string;
    HRME_EmployeeCode: string;
    HRMD_DepartmentName: string;
    HRMDES_DesignationName: string;
    HRME_MobileNo: string;
    HRME_EmailId: string;
}

export interface HouseInchargeReportProps {
    searchParams: { [key: string]: string | string[] | undefined };
}
