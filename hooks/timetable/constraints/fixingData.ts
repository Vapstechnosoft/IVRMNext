import { TIMETABLE_QUERY_KEYS } from "@/constants/Timetable-query-keys";
import { getFixingDayPeriodGridData, getFixingDaySubjectGridData, getFixingPeriodSubjectGridData, getFixingPeriodStaffGridData, getFixingDayStaffGridData } from "@/server/timetable/constraints/fixing";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useDayStaffGridData = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.FIXING_DAY_STAFF_GRID, 'grid'],
            queryFn: async () => getFixingDayStaffGridData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.FIXING_DAY_STAFF_GRID]
            });
        }
    };
};

export const useFixingDayPeriodGridData = (searchParams?: any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.FIXING_DAY_PERIOD_GRID, 'grid', searchParams],
            queryFn: async () => getFixingDayPeriodGridData(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.FIXING_DAY_PERIOD_GRID]
            });
        }
    };
};


export const useDaySubjectGridData = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.FIXING_DAY_SUBJECT_GRID, 'grid'],
            queryFn: async () => getFixingDaySubjectGridData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.FIXING_DAY_SUBJECT_GRID]
            });
        }
    };
};

export const usePeriodSubjectGridData = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.FIXING_PERIOD_SUBJECT_GRID, 'grid'],
            queryFn: async () => getFixingPeriodSubjectGridData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.FIXING_PERIOD_SUBJECT_GRID]
            });
        }
    };
};

export const usePeriodStaffGridData = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.FIXING_PERIOD_STAFF_GRID, 'grid'],
            queryFn: async () => getFixingPeriodStaffGridData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.FIXING_PERIOD_STAFF_GRID]
            });
        }
    };
};
