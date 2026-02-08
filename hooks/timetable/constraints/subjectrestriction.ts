import { TIMETABLE_QUERY_KEYS } from "@/constants/Timetable-query-keys";
import {
    getSubjectRestrictionDayPeriodGridData,
    getSubjectRestrictionDaySubjectGridData,
    getSubjectRestrictionDayStaffGridData,
    getSubjectRestrictionPeriodStaffGridData,
    getSubjectRestrictionPeriodSubjectGridData,

} from "@/server/timetable/constraints/subjectrestriction";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface SubjectRestrictionParams {
    ASMAY_Id: number;
    TTMC_Id: number;
    [key: string]: any; // Allow for generic search/pagination params
}

export const useSubjectRestrictionDayPeriodGridData = (params: SubjectRestrictionParams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_DAY_PERIOD_GRID, params],
            queryFn: async () => {
                return await getSubjectRestrictionDayPeriodGridData(params);
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_DAY_PERIOD_GRID]
            });
        }
    };
};

export const useSubjectRestrictionDaySubjectGridData = (params: SubjectRestrictionParams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_DAY_SUBJECT_GRID, params],
            queryFn: async () => {
                return await getSubjectRestrictionDaySubjectGridData(params);
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_DAY_SUBJECT_GRID]
            });
        }
    };
};

export const useSubjectRestrictionDayStaffGridData = (params: SubjectRestrictionParams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_DAY_STAFF_GRID, params],
            queryFn: async () => {
                return await getSubjectRestrictionDayStaffGridData(params);
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_DAY_STAFF_GRID]
            });
        }
    };
};

export const useSubjectRestrictionPeriodStaffGridData = (params: SubjectRestrictionParams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_PERIOD_STAFF_GRID, params],
            queryFn: async () => {
                return await getSubjectRestrictionPeriodStaffGridData(params);
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_PERIOD_STAFF_GRID]
            });
        }
    };
};

export const useSubjectRestrictionPeriodSubjectGridData = (params: SubjectRestrictionParams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_PERIOD_SUBJECT_GRID, params],
            queryFn: async () => {
                return await getSubjectRestrictionPeriodSubjectGridData(params);
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_PERIOD_SUBJECT_GRID]
            });
        }
    };
};

