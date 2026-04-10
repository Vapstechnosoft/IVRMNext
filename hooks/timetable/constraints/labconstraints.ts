import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import {
    getAcademicYear,
    getClassDetails,
    getLabConstraintsDetails,
    getSectionDetails,
    getTimeTableCategoryDropDownDetails
} from '@/server/timetable/constraints/labconstraints';
import { useQuery, useQueryClient } from '@tanstack/react-query';

//academic Year
export const useAcademicYearDropDownMasterDayClasswise = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.ACADEMIC_YEAR_DROPDOWN_MASTERDAYCLASSWISE],
            queryFn: async () => getAcademicYear(),
            staleTime: 0,
            retry: 1
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.ACADEMIC_YEAR_DROPDOWN_MASTERDAYCLASSWISE]
            });
        }
    };
};

//category
export const useCategoryDropDownMasterDayClasswise = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.CATEGORY_DROPDOWN_MASTERDAYCLASSWISE],
            queryFn: async () => getTimeTableCategoryDropDownDetails(),
            staleTime: 0,
            retry: 1
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.CATEGORY_DROPDOWN_MASTERDAYCLASSWISE]
            });
        }
    };
};

//section
export const useSectionDropDownMasterDayClasswise = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.SECTION_DROPDOWN_MASTERDAYCLASSWISE],
            queryFn: async () => getSectionDetails(),
            staleTime: 0,
            retry: 1
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.SECTION_DROPDOWN_MASTERDAYCLASSWISE]
            });
        }
    };
};

//class
export const useClassDropDownMasterDayClasswise = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.CLASS_DROPDOWN_MASTERDAYCLASSWISE],
            queryFn: async () => getClassDetails(),
            staleTime: 0,
            retry: 1
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.CLASS_DROPDOWN_MASTERDAYCLASSWISE]
            });
        }
    };
};

export const useLabConstraintsDetails = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.LAB_CONSTRAINTS_DETAILS],
            queryFn: async () => getLabConstraintsDetails(),
            staleTime: 0,
            retry: 1 // limit retries on 404
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.LAB_CONSTRAINTS_DETAILS]
            });
        }
    };
};
