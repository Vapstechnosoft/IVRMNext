import { TIMETABLE_QUERY_KEYS } from "@/constants/Timetable-query-keys";
import {
    getAcademicYearDropDropDownMasterDayClasswise,
    getCategoryDropDownMasterDayClasswise,
    getStaffDropDownMasterDayClasswise,
    getSubjectDropDownMasterDayClasswise,
    getTransactionClassDropdown,
    getSectionDetails,

} from "@/server/timetable/constraints/consecutive";
import { ApiSearchparams } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";



//academic Year
export const useAcademicYearDropDownMasterDayClasswise = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.ACADEMIC_YEAR_DROPDOWN_MASTERDAYCLASSWISE, searchParams ?? {}],
            queryFn: async () => getAcademicYearDropDropDownMasterDayClasswise(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.ACADEMIC_YEAR_DROPDOWN_MASTERDAYCLASSWISE]
            });
        }
    };
};


//category
export const useCategtoryDropDownMasterDayClasswise = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.CATEGORY_DROPDOWN_MASTERDAYCLASSWISE, searchParams ?? {}],
            queryFn: async () => getCategoryDropDownMasterDayClasswise(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.CATEGORY_DROPDOWN_MASTERDAYCLASSWISE]
            });
        }
    };
};

//staff

export const useStaffDropDownMasterDayClasswise = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_STAFF_DROPDOWN, searchParams ?? {}],
            queryFn: async () => getStaffDropDownMasterDayClasswise(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_STAFF_DROPDOWN]
            });
        }
    };
};

export const useSubjectDropDownMasterDayClasswise = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_SUBJECT_DROPDOWN, searchParams ?? {}],
            queryFn: async () => getSubjectDropDownMasterDayClasswise(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_SUBJECT_DROPDOWN]
            });
        }
    };
};

export const useSectionDropDownMasterDayClasswise = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.SECTION_DROPDOWN_MASTERDAYCLASSWISE, searchParams ?? {}],
            queryFn: async () => getSectionDetails(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.SECTION_DROPDOWN_MASTERDAYCLASSWISE]
            });
        }
    };
};

export const useClassDropDownMasterDayClasswise = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.CLASS_DROPDOWN_MASTERDAYCLASSWISE, searchParams ?? {}],
            queryFn: async () => getTransactionClassDropdown(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.CLASS_DROPDOWN_MASTERDAYCLASSWISE]
            });
        }
    };
};

// export const useClassByCategory = (ASMAY_Id: number, TTMC_Id: number) => {
//     return useQuery({
//         queryKey: ['CLASS_BY_CATEGORY', ASMAY_Id, TTMC_Id],
//         queryFn: async () => getClassByCategory({ ASMAY_Id, TTMC_Id }),
//         enabled: !!(ASMAY_Id && TTMC_Id),
//         staleTime: 0
//     });
// };

// export const useSectionByClass = (ASMAY_Id: number, ASMCL_Id: number, TTMC_Id: number) => {
//     return useQuery({
//         queryKey: ['SECTION_BY_CLASS', ASMAY_Id, ASMCL_Id, TTMC_Id],
//         queryFn: async () => getSectionByClass({ ASMAY_Id, ASMCL_Id, TTMC_Id }),
//         enabled: !!(ASMAY_Id && ASMCL_Id && TTMC_Id),
//         staleTime: 0
//     });
// };

// export const useStaffByClassSection = (ASMAY_Id: number, TTMC_Id: number, ASMCL_Id: number, ASMS_Id: number) => {
//     return useQuery({
//         queryKey: ['STAFF_BY_CLASS_SECTION', ASMAY_Id, TTMC_Id, ASMCL_Id, ASMS_Id],
//         queryFn: async () => getStaffByClassSection({ ASMAY_Id, TTMC_Id, ASMCL_Id, ASMS_Id }),
//         enabled: !!(ASMAY_Id && TTMC_Id && ASMCL_Id && ASMS_Id),
//         staleTime: 0
//     });
// };

// export const useSubjectByStaff = (ASMAY_Id: number, TTMC_Id: number, ASMCL_Id: number, ASMS_Id: number, HRME_Id: number) => {
//     return useQuery({
//         queryKey: ['SUBJECT_BY_STAFF', ASMAY_Id, TTMC_Id, ASMCL_Id, ASMS_Id, HRME_Id],
//         queryFn: async () => getSubjectByStaff({ ASMAY_Id, TTMC_Id, ASMCL_Id, ASMS_Id, HRME_Id }),
//         enabled: !!(ASMAY_Id && TTMC_Id && ASMCL_Id && ASMS_Id && HRME_Id),
//         staleTime: 0
//     });
// };

