import { ADMISSION_QUERY_KEYS, PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getMonthEndReport,
    getPreAdmissionEmailSmsReport,
    getPreAdmissionMonthEndReport,
    getPreAdmissionRegistrationReport,
    getStudentTcReport,
    getStudyCertficateReport
} from '@/server/admission/preadmission/reports/report';
import { addOrUpdateStudentCountReport, getParentDashboardDetails } from '@/server/admission/preadmission/reports/student_count_report';
import {
    type ElectiveItem,
    GetClassTeacherReport,
    GetStudentYearlyAttendance,
    getTotalStrengthReport
} from '@/server/admission/preadmission/reports/student_yearly_attendance';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useStudentCountReport = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.STUDENT_COUNT_REPORT, searchParams ?? {}],
            queryFn: async () => addOrUpdateStudentCountReport(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.STUDENT_COUNT_REPORT]
            });
        }
    };
};

export const useParentDashboard = (asmay_id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.PARENTS_DASHBOARD, asmay_id],
            queryFn: async () => getParentDashboardDetails(asmay_id),
            staleTime: 0,
            enabled: !!asmay_id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.PARENTS_DASHBOARD]
            });
        }
    };
};
export const useStudentTcReport = (data: any, searchParams: ApiSearchparams, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.STUDENT_TC_REPORT, data, searchParams],
            queryFn: async () => getStudentTcReport(data, searchParams),
            staleTime: 0,
            enabled: enabled && !!data,
            refetchOnWindowFocus: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.STUDENT_TC_REPORT]
            });
        }
    };
};
export const useMonthEndReport = (data: any, searchParams: ApiSearchparams, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.MONTH_END_REPORT, data, searchParams],
            queryFn: async () => getMonthEndReport(data, searchParams),
            staleTime: 0,
            enabled: enabled && !!data,
            refetchOnWindowFocus: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.MONTH_END_REPORT]
            });
        }
    };
};
export const usePreAdmissionMonthEndReport = (data: any, searchParams: ApiSearchparams, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.PRE_ADMISSION_MONTH_END_REPORT, data, searchParams],
            queryFn: async () => getPreAdmissionMonthEndReport(data, searchParams),
            staleTime: 0,
            enabled: enabled && !!data,
            refetchOnWindowFocus: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.PRE_ADMISSION_MONTH_END_REPORT]
            });
        }
    };
};
export const usePreAdmissionRegistrationReport = (
    academicIdParam: number,
    fromDateParam: string | null,
    toDateParam: string | null,
    searchParams?: ApiSearchparams
) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [
                ADMISSION_QUERY_KEYS.PRE_ADMISSION_REGISTRATION_REPORT,
                academicIdParam,
                fromDateParam,
                toDateParam,
                searchParams ?? {}
            ],
            queryFn: async () =>
                getPreAdmissionRegistrationReport(
                    {
                        academicYearId: academicIdParam,
                        fromDate: fromDateParam,
                        toDate: toDateParam
                    },
                    searchParams
                ),
            staleTime: 0,
            refetchOnWindowFocus: false
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.PRE_ADMISSION_REGISTRATION_REPORT]
            })
    };
};
export const usePreAdmissionEmailSmsReport = (
    academicIdParam: number,
    fromDateParam: string | null,
    toDateParam: string | null,
    searchParams?: ApiSearchparams
) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [
                ADMISSION_QUERY_KEYS.PRE_ADMISSION_REGISTRATION_REPORT,
                academicIdParam,
                fromDateParam,
                toDateParam,
                searchParams ?? {}
            ],
            queryFn: async () =>
                getPreAdmissionEmailSmsReport(
                    {
                        academicYearId: academicIdParam,
                        fromDate: fromDateParam,
                        toDate: toDateParam
                    },
                    searchParams
                ),
            staleTime: 0,
            refetchOnWindowFocus: false
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.PRE_ADMISSION_REGISTRATION_REPORT]
            })
    };
};
export const useStudentYearlyAttendance = (ASMAY_Id: number, ASMCL_Id: number, ASMS_Id: number, searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_STUDENT_LISTS, ASMAY_Id, ASMCL_Id, ASMS_Id, searchParams ?? {}],
            queryFn: async () => GetStudentYearlyAttendance(ASMAY_Id, ASMCL_Id, ASMS_Id, searchParams),
            staleTime: 0,
            enabled: !!ASMAY_Id && !!ASMS_Id && ASMCL_Id !== undefined
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_STUDENT_LISTS]
            });
        }
    };
};

export const useClassTeacherReport = (ASMAY_Id: number, flag: number, searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_CLASS_TEACHER_REPORT, ASMAY_Id, flag, searchParams ?? {}],
            queryFn: async () => GetClassTeacherReport(ASMAY_Id, flag, searchParams),
            staleTime: 0,
            enabled: !!ASMAY_Id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_CLASS_TEACHER_REPORT]
            });
        }
    };
};

export const useTotalStrengthReport = (
    asmay_Id: number,
    asmcL_Id: number,
    amC_Id: number,
    statusFlag: string,
    amsT_SOL: string,
    withtc: string,
    withdeactive: string,
    electivearray: ElectiveItem[]
) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [
                ADMISSION_QUERY_KEYS.TOTAL_STRENGTH_REPORT,
                asmay_Id,
                asmcL_Id,
                amC_Id,
                statusFlag,
                amsT_SOL,
                withtc,
                withdeactive,
                electivearray
            ],
            queryFn: () => getTotalStrengthReport(asmay_Id, asmcL_Id, amC_Id, statusFlag, amsT_SOL, withtc, withdeactive, electivearray),
            enabled: asmay_Id > 0 && statusFlag !== '' && amsT_SOL !== '' && withtc !== '' && withdeactive !== '',
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.TOTAL_STRENGTH_REPORT]
            });
        }
    };
};
export const useStudyCertificateReport = (data: any, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, data],
            queryFn: async () => getStudyCertficateReport(data),
            staleTime: 0,
            enabled: enabled && !!data,
            refetchOnWindowFocus: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT]
            });
        }
    };
};
