import { TIMETABLE_QUERY_KEYS } from "@/constants/Timetable-query-keys";
import { getSectionDetailsTT } from "@/server/timetable/reports/classwisett";

import { ApiSearchparams } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";



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