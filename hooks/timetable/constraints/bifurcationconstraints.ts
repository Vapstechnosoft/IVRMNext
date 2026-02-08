import { TIMETABLE_QUERY_KEYS } from "@/constants/Timetable-query-keys";
import { getAcademicYear, getTimeTableCategoryDropDownDetails } from "@/server/timetable/constraints/bifurcationconstraints";
import { ApiSearchparams } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const usebifurcationconstraints = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();


    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS, searchParams ?? {}],
            queryFn: async () => getTimeTableCategoryDropDownDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const usebifurcationAcademicYear = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();


    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS, 'academic_year', searchParams ?? {}],
            queryFn: async () => getAcademicYear(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};