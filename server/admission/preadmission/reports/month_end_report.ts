'use server';

import { getSearchParamsUrl } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { ApiSearchparams } from '@/types';
import axios from 'axios';
import { format } from 'date-fns';
const formatDate = (date?: Date | null) => (date ? format(date, 'yyyy-MM-dd') : undefined);

export interface ElectiveItem {
    ismS_Id: number;
    ismS_SubjectName: string;
}

export async function getExcelAdmissionRegistrationReport(
    ASMAY_Id: number,
    AttendanceType: number,
    payload?: any,
    searchParams?: ApiSearchparams
) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});

    const baseUrl = process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const url = `${baseUrl}/AdmissionRegister/ExportAdmissionRegisterReportToExcel?ASMAY_Id=${ASMAY_Id}&AttendanceType=${AttendanceType}&TempararyArrayListclass=${encodeURIComponent(JSON.stringify(payload.tempararyArrayListclass))}&TempararyArrayListcoloumn=${encodeURIComponent(JSON.stringify(payload.tempararyArrayListcoloumn))}&${urlParams}`;

    try {
        const session = await auth();

        const response = await axios.post(url, null, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        // Convert to regular Array to be serializable across server/client boundary
        const uint8Array = new Uint8Array(response.data);
        return Array.from(uint8Array);
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}

export async function getExcelMonthEndReport(data: {
    ASMAY_Id: number;
    month: string;
    year: number;
}) {
    const baseUrl = process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const url = `${baseUrl}/monthendreport/ExportMonthEndReportToExcel?AcayId=${data.ASMAY_Id}&Month=${data.month}&Year=${data.year}`;

    try {
        const session = await auth();

        const response = await axios.post(url, null, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        // Convert to regular Array to be serializable across server/client boundary
        const uint8Array = new Uint8Array(response.data);
        return Array.from(uint8Array);
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}
export async function getExcelClassTeacherReport(ASMAY_Id: number, flag: number, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});

    const baseUrl = process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const url = `${baseUrl}/ClassTeacherReportAttendance/ExportClassTeacherReportAttendanceToExcel?ASMAY_Id=${ASMAY_Id}&flag=${flag}&${urlParams}`;

    try {
        const session = await auth();

        const response = await axios.post(url, null, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        // Convert to regular Array to be serializable across server/client boundary
        const uint8Array = new Uint8Array(response.data);
        return Array.from(uint8Array);
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}

export async function getExcelStudentYearlyReport(
    academicYearId: number,
    classId: number,
    sectionId: number,
    searchParams?: ApiSearchparams
) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});

    const baseUrl = process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const url = `${baseUrl}/StudentYearlyAttendance/ExportStudentYearlyAttendanceToExcel?AcayId=${academicYearId}&ClassId=${classId}&SectionId=${sectionId}&AllOrIndiFlag=${'all'}&${urlParams}`;

    try {
        const session = await auth();

        const response = await axios.post(url, null, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        // Convert to regular Array to be serializable across server/client boundary
        const uint8Array = new Uint8Array(response.data);
        return Array.from(uint8Array);
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}

export async function getExcelStudentTcReport(requestData: any) {
    const baseUrl = process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';

    const url = `${baseUrl}/StudentTcReport/ExportAdmissionTcReportToExcel`;

    try {
        const session = await auth();

        const response = await axios.post(url, requestData, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        // Make it serializable
        return Array.from(new Uint8Array(response.data));
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}

export async function getExcelClassWiseStudentReport(
    ASMAY_Id: number,
    studentScope: number,
    fmcC_Id: number,
    payload: any,
    searchParams?: ApiSearchparams
) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});

    const baseUrl = process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';

    const url = `${baseUrl}/Classwisestudentdetails/ExportClasswiseStudentDetailsToExcel?ASMAY_Id=${ASMAY_Id}
    &AMST_Id=0
    &flag=${studentScope}
    &Concession_Id=${fmcC_Id}
    &classdetailsdata=${encodeURIComponent(JSON.stringify(payload.classdetailsdata))}
    &sectionsdetailsdata=${encodeURIComponent(JSON.stringify(payload.sectionsdetailsdata))}
    &TempararyArrayheadList=${encodeURIComponent(JSON.stringify(payload.TempararyArrayheadList))}
    &${urlParams}`;

    try {
        const session = await auth();

        const response = await axios.post(url, null, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${session?.token || ''}`
            }
        });

        return Array.from(new Uint8Array(response.data));
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}

export async function getExcelTotalStrengthReport(data: {
    asmay_Id: number;
    asmcL_Id: number;
    amC_Id: number;
    statusFlag: string;
    amsT_SOL: string;
    withtc: string;
    withdeactive: string;
    electivearray: ElectiveItem[];
}) {
    const baseUrl = process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const url = `${baseUrl}/TotalStrengthReport/ExportTotalStrengthReportToExcel?ASMAY_Id=${data.asmay_Id}&AMST_SOL=${data.amsT_SOL}&Status_Flag=${data.statusFlag}&withtc=${data.withtc}&withdeactive=${data.withdeactive}&ASMCL_Id=${data.asmcL_Id}&AMC_Id=${data.amC_Id}&electivearray=${encodeURIComponent(JSON.stringify(data.electivearray))}`;

    try {
        const session = await auth();

        const response = await axios.post(url, null, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        // Convert to regular Array to be serializable across server/client boundary
        const uint8Array = new Uint8Array(response.data);
        return Array.from(uint8Array);
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}

export async function getExcelAttendanceAbsentSmsReport(
    ASMAY_Id: number,
    from_date: string,
    frequency: string,
    searchParams?: ApiSearchparams
) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'AMST_FirstName');

    const baseUrl = process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const url = `${baseUrl}/OveralldailyattendanceabsentsmsFacade/ExportOverallDailyAttendanceToExcel?${urlParams}&ASMAY_Id=${ASMAY_Id}&FromDate=${from_date}&Flag=${frequency}`;

    try {
        const session = await auth();

        const response = await axios.post(url, null, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        // Convert to regular Array to be serializable across server/client boundary
        const uint8Array = new Uint8Array(response.data);
        return Array.from(uint8Array);
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}

export async function getExcelStudyCertificateReport(data: any) {
    const baseUrl = process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const url = `${baseUrl}/StudyCertificateReport/ExportStudyCertificateReportToExcel?&ASMAY_Id=${data.ASMAY_Id}&AllOrInd=${data.AllOrInd}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&AMST_Id=${data.AMST_Id}`;

    try {
        const session = await auth();

        const response = await axios.post(url, null, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        // Convert to regular Array to be serializable across server/client boundary
        const uint8Array = new Uint8Array(response.data);
        return Array.from(uint8Array);
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}

export async function getExcelOverallAttendanceReport(
    ASMAY_Id: number,
    from_date: string,
    frequency: string,
    searchParams?: ApiSearchparams
) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'AMST_FirstName');
    const formattedDate = formatDate(new Date(from_date));

    const baseUrl = process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    let url = `${baseUrl}/OverallAttendance/ExportOverallDailyAttendanceSimpleToExcel?ASMAY_Id=${ASMAY_Id}&FromDate=${formattedDate}&Flag=${frequency}&ASMCL_Ids=&ASMS_Ids=`;
    if (urlParams) {
        url += `&${urlParams}`;
    }

    try {
        const session = await auth();

        const response = await axios.post(url, null, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        // Convert to regular Array to be serializable across server/client boundary
        const uint8Array = new Uint8Array(response.data);
        return Array.from(uint8Array);
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}

export async function getExcelStudentAttendanceReport(
    ASMAY_Id: number,
    ASMCL_Id: number, // Section ID?
    ASMS_Id: number, // Class ID?
    AMST_Id: number | undefined,
    monthId: number | undefined,
    monthDateWise: number | undefined,
    fromDate: Date | null | undefined,
    toDate: Date | null | undefined,
    dailyDate: Date | null | undefined,
    selectionMode: number,
    studentStatus: number,
    searchParams?: ApiSearchparams
) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'AMST_FirstName');

    const baseUrl = process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    let url = `${baseUrl}/StudentAttendanceReport/ExportAttendanceMonthwiseToExcel?ASMAY_Id=${ASMAY_Id}&ASMCL_Id=${ASMCL_Id}&ASMS_Id=${ASMS_Id}&RadioType=${studentStatus}&Type=${selectionMode}`;

    if (selectionMode === 1 && AMST_Id) {
        url += `&AMST_Id=${AMST_Id}`;
    }

    if (studentStatus === 1) {
        url += `&MonthId=${monthId}&DateWise=${monthDateWise}`;
    }

    if (studentStatus === 2 && fromDate && toDate) {
        url += `&FromDate=${formatDate(fromDate)}&ToDate=${formatDate(toDate)}`;
    }

    if (studentStatus === 3 && dailyDate) {
        url += `&DailyDate=${formatDate(dailyDate)}`;
    }

    const finalUrl = `${url}&${urlParams}`;

    try {
        const session = await auth();

        const response = await axios.post(finalUrl, null, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        const uint8Array = new Uint8Array(response.data);
        return Array.from(uint8Array);
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}
export async function getExcelRegistrationReport(
    academicIdParam: number,
    fromDateParam: string | null,
    toDateParam: string | null,
    searchParams?: ApiSearchparams
) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});

    const baseUrl = process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    let url = `${baseUrl}/RegistrationReport/ExportRegistrationReportToExcel?${urlParams}`;

    // YEAR WISE
    if (academicIdParam) {
        url += `&ASMAY_Id=${academicIdParam}`;
    }

    // BETWEEN DATES — pass each date if available
    if (fromDateParam !== null && fromDateParam !== undefined) {
        url += `&From_Date=${fromDateParam}`;
    }

    if (toDateParam !== null && toDateParam !== undefined) {
        url += `&To_Date=${toDateParam}`;
    }

    try {
        const session = await auth();

        const response = await axios.post(url, null, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        // Convert to regular Array to be serializable across server/client boundary
        const uint8Array = new Uint8Array(response.data);
        return Array.from(uint8Array);
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}
export async function getExcelEmailSmsReport(
    academicIdParam: number,
    fromDateParam: string | null,
    toDateParam: string | null,
    searchParams?: ApiSearchparams
) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});

    const baseUrl = process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    let url = `${baseUrl}/EmailSmsReport/ExportSMSEmailReportToExcel?${urlParams}`;

    // YEAR WISE
    if (academicIdParam) {
        url += `&ASMAY_Id=${academicIdParam}`;
    }

    // BETWEEN DATES — pass each date if available
    if (fromDateParam !== null && fromDateParam !== undefined) {
        url += `&From_Date=${fromDateParam}`;
    }

    if (toDateParam !== null && toDateParam !== undefined) {
        url += `&To_Date=${toDateParam}`;
    }

    try {
        const session = await auth();

        const response = await axios.post(url, null, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        // Convert to regular Array to be serializable across server/client boundary
        const uint8Array = new Uint8Array(response.data);
        return Array.from(uint8Array);
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}
export async function getExcelPreAdmissionMonthEndReport(data: {
    amay: string;
    month: string;
    year: string;
}) {
    const baseUrl = process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const url = `${baseUrl}/PreAdmissionMonthEndReport/ExportPreAdmissionMonthEndReportToExcel`;

    try {
        const session = await auth();

        const response = await axios.post(url, data, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        // Convert to regular Array to be serializable across server/client boundary
        const uint8Array = new Uint8Array(response.data);
        return Array.from(uint8Array);
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}

export async function getExcelDOBReport(
    ASMAY_Id: number,
    ASMCL_Id: number,
    ASMS_Id: number,
    AMST_Id: number,
    searchParams?: ApiSearchparams
) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});

    const baseUrl = process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const url = `${baseUrl}/DOBcertificate/ExportAdmDobCertificateToExcel?ASMAY_Id=${ASMAY_Id}&ASMCL_Id=${ASMCL_Id}&ASMS_Id=${ASMS_Id}&AMST_Id=${AMST_Id}&${urlParams}`;

    try {
        const session = await auth();

        const response = await axios.post(url, null, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        // Convert to regular Array to be serializable across server/client boundary
        const uint8Array = new Uint8Array(response.data);
        return Array.from(uint8Array);
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}
