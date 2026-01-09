import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import {
    getCategoryClassMappingDetails,
    getTimeTableAcademicYearDetails,
    getTimeTableCategoryDropDownDetails,
    getuseTimeTableClassDropdownDataDetails
} from '@/server/timetable/masters/categoryclassmapping';
import { getMasterCategoryDetails } from '@/server/timetable/masters/masterCategory';
import { getMasterBuildingDetails } from '@/server/timetable/masters/masterbuilding';
import { getMasterDayDetails } from '@/server/timetable/masters/masterday';
import { getStaffAbbreviationDetails, getStaffDropDown } from '@/server/timetable/masters/staffabbreviation';
import { getSubjectAbbreviationDetails } from '@/server/timetable/masters/subjectabbreviation';
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

export const useStaffAbbreviation = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_STAFF_ABBREVIATION, searchParams ?? {}],
            queryFn: async () => getStaffAbbreviationDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_STAFF_ABBREVIATION]
            });
        }
    };
};

export const useSSubjectAbbreviation = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_SUBJECT_ABBREVIATION, searchParams ?? {}],
            queryFn: async () => getSubjectAbbreviationDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_SUBJECT_ABBREVIATION]
            });
        }
    };
};

export const useStaffDropDown = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_STAFF_DROPDOWN, searchParams ?? {}],
            queryFn: async () => getStaffDropDown(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_STAFF_DROPDOWN]
            });
        }
    };
};

export const useTimeTableMasterCategory = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TIMETABLE_CATEGORY, searchParams ?? {}],
            queryFn: async () => getMasterCategoryDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TIMETABLE_CATEGORY]
            });
        }
    };
};

export const useTimeTableCategoryClassMapping = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TIMETABLE_CATEGORY_CLASS_MAPPING, searchParams ?? {}],
            queryFn: async () => getCategoryClassMappingDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TIMETABLE_CATEGORY_CLASS_MAPPING]
            });
        }
    };
};

export const useTimeTableAcademicYear = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_ACADEMICYEAR, searchParams ?? {}],
            queryFn: async () => getTimeTableAcademicYearDetails(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_ACADEMICYEAR]
            });
        }
    };
};

export const useTimeTableCategoryDropDownData = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_CATEGORY_DROPDOWNDATA_TT, searchParams ?? {}],
            queryFn: async () => getTimeTableCategoryDropDownDetails(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_CATEGORY_DROPDOWNDATA_TT]
            });
        }
    };
};

export const useTimeTableClassDropdownData = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_CLASSDROPDOWN, searchParams ?? {}],
            queryFn: async () => getuseTimeTableClassDropdownDataDetails(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_CLASSDROPDOWN]
            });
        }
    };
};
