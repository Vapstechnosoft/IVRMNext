import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import { getSectionDetailsTT } from '@/server/timetable/reports/classwisett';
import { getstaffdropdowndatattstaffreport } from '@/server/timetable/reports/staffwisett';

import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
