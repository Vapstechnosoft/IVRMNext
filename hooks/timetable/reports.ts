import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import { getClassDetails, getSectionDetailsTT } from '@/server/timetable/reports/classwisett';
import {
    getAcademicYear,
    getDeputationReportDetails,
    getDeputationReportLoadData
} from '@/server/timetable/reports/deputationreport';
import { getstaffdropdowndatattstaffreport } from '@/server/timetable/reports/staffwisett';

import type { ApiSearchparams } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useSectionDropDown = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_SECTIONREPORT, searchParams ?? {}],
            queryFn: async () => getSectionDetailsTT(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_SECTIONREPORT]
            });
        }
    };
};

export const staffdropdowndatattstaffreport = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.STAFF_DROPDOWN_STAFFREPORT, searchParams ?? {}],
            queryFn: async () => getstaffdropdowndatattstaffreport(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.STAFF_DROPDOWN_STAFFREPORT]
            });
        }
    };
};
export const useClassDetails = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_CLASSDROPDOWN, searchParams ?? {}],
            queryFn: async () => getClassDetails(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_CLASSDROPDOWN]
            });
        }
    };
};

export const useDeputationAcademicYear = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();


    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.DEPUTATION_ACADEMIC_YEAR, searchParams ?? {}],
            queryFn: async () => getAcademicYear(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.DEPUTATION_ACADEMIC_YEAR]
            });
        }
    };
};

export const useDeputationReportLoadData = () => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.DEPUTATION_MASTERS],
        queryFn: getDeputationReportLoadData
    });
};

export const useDeputationReportDetails = () => {
    return useMutation({
        mutationFn: (data: any) => getDeputationReportDetails(data)
    });
};