import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import { getMasterCategory } from '@/server/admission/preadmission/masters/category';
import { getMasterClass } from '@/server/admission/preadmission/masters/class';
import {
    getAcademicYearDropdown,
    getMasterCategoryDropdown,
    getMasterClassCategory,
    getMasterClassDropdown,
    getMasterSectionDropdown
} from '@/server/admission/preadmission/masters/class_category';
import { getMasterReligion } from '@/server/admission/preadmission/masters/religion';
import { getMasterSection } from '@/server/admission/preadmission/masters/section';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterClass = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.MASTER_CLASS, searchParams ?? {}],
            queryFn: async () => getMasterClass(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.MASTER_CLASS]
            });
        }
    };
};

export const useMasterCategory = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.MASTER_CATEGORY, searchParams ?? {}],
            queryFn: async () => getMasterCategory(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.MASTER_CATEGORY]
            });
        }
    };
};

export const useMasterSection = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.MASTER_SECTION, searchParams ?? {}],
            queryFn: async () => getMasterSection(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.MASTER_SECTION]
            });
        }
    };
};

export const useMasterClassCategory = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.MASTER_CLASS_CATEGORY, searchParams ?? {}],
            queryFn: async () => getMasterClassCategory(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.MASTER_CLASS_CATEGORY]
            });
        }
    };
};

export const useAcademicYearDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.ACADEMIC_DROPDOWN],
            queryFn: async () => getAcademicYearDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.ACADEMIC_DROPDOWN]
            });
        }
    };
};

export const useMasterCategoryDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.MASTER_CATEGORY_DROPDOWN],
            queryFn: async () => getMasterCategoryDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.MASTER_CATEGORY_DROPDOWN]
            });
        }
    };
};

export const useMasterClassDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.MASTER_CLASS_DROPDOWN],
            queryFn: async () => getMasterClassDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.MASTER_CLASS_DROPDOWN]
            });
        }
    };
};

export const useMasterSectionDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.MASTER_SECTION_DROPDOWN],
            queryFn: async () => getMasterSectionDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.MASTER_SECTION_DROPDOWN]
            });
        }
    };
};

export const useMasterReligion = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.MASTER_RELIGION, searchParams ?? {}],
            queryFn: async () => getMasterReligion(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.MASTER_RELIGION]
            });
        }
    };
};
