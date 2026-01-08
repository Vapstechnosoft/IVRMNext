import { LIBRARY_QUERY_KEYS } from '@/constants/query-keys';
import { getMasterCategoryList } from '@/server/library/masters/library_category';
import { getMasterVendorList } from '@/server/library/masters/library_vendor';
import { getMasterAuthorList } from '@/server/library/masters/master_author';
import { getMasterLanguageList } from '@/server/library/masters/master_language';
import { getMasterLibraryList } from '@/server/library/masters/master_library';
import { getMasterPublisherList } from '@/server/library/masters/master_publisher';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterLibrary = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [LIBRARY_QUERY_KEYS.MASTER_LIBRARY_LIST_DATA, searchParams ?? {}],
            queryFn: async () => getMasterLibraryList(searchParams),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [LIBRARY_QUERY_KEYS.MASTER_LIBRARY_LIST_DATA]
            })
    };
};

export const useMasterVendor = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [LIBRARY_QUERY_KEYS.MASTER_VENDOR_LIST_DATA, searchParams ?? {}],
            queryFn: async () => getMasterVendorList(searchParams),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [LIBRARY_QUERY_KEYS.MASTER_VENDOR_LIST_DATA]
            })
    };
};

export const useMasterCategoryListData = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [LIBRARY_QUERY_KEYS.MASTER_CATEGORY_LIST_DATA, searchParams ?? {}],
            queryFn: async () => getMasterCategoryList(searchParams),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [LIBRARY_QUERY_KEYS.MASTER_CATEGORY_LIST_DATA]
            })
    };
};

export const useMasterPublisherList = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [LIBRARY_QUERY_KEYS.MASTER_PUBLISHER_LIST_DATA, searchParams ?? {}],
            queryFn: async () => getMasterPublisherList(searchParams),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [LIBRARY_QUERY_KEYS.MASTER_PUBLISHER_LIST_DATA]
            })
    };
};
export const useLibraryMasterAuthor = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [LIBRARY_QUERY_KEYS.MASTER_AUTHOR_LIST_DATA, searchParams ?? {}],
            queryFn: async () => getMasterAuthorList(searchParams),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [LIBRARY_QUERY_KEYS.MASTER_AUTHOR_LIST_DATA]
            })
    };
};

export const useMasterLanguage = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [LIBRARY_QUERY_KEYS.MASTER_LANGUAGE_LIST_DATA, searchParams ?? {}],
            queryFn: async () => getMasterLanguageList(searchParams),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [LIBRARY_QUERY_KEYS.MASTER_LANGUAGE_LIST_DATA]
            })
    };
};
