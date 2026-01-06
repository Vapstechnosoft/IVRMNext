import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import { getMasterBuildingDetails } from '@/server/timetable/masterbuilding';
import { getMasterDayDetails } from '@/server/timetable/masters/masterday';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterDay = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_DAY, searchParams ?? {}],
            queryFn: async () => getMasterDayDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_DAY]
            });
        }
    };
};

export const useMasterBuilding = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_BUILDING, searchParams ?? {}],
            queryFn: async () => getMasterBuildingDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_BUILDING]
            });
        }
    };
};
