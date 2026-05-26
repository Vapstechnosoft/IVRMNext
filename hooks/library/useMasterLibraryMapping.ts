'use client';

import { LIBRARY_QUERY_KEYS } from '@/constants/query-keys';
import {
    addOrUpdateMasterLibrary,
    getMasterLibraryById,
    getMasterLibraryEditClass,
    getMasterLibraryList,
    getMasterLibraryMappedClassList,
    saveClassMapping,
    saveStaffMapping
} from '@/server/library/masters/master_library';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMasterLibraryMapping() {
    const _queryClient = useQueryClient();

    const libraryQuery = useQuery({
        queryKey: [LIBRARY_QUERY_KEYS.MASTER_LIBRARY_LIST_DATA, {}],
        queryFn: async () => getMasterLibraryList({})
    });

    const mappingListQuery = useQuery({
        queryKey: ['MASTER_LIBRARY_MAPPED_LIST_DATA'],
        queryFn: async () => getMasterLibraryMappedClassList()
    });

    const responseData = (libraryQuery.data as any)?.data || (libraryQuery.data as any);
    const mappingResponse = (mappingListQuery.data as any)?.data || (mappingListQuery.data as any);

    return {
        libraries: responseData?.liballdata || responseData?.list || responseData?.librylist || [],
        classes: responseData?.classlist || mappingResponse?.classlist || [],
        roles:
            mappingResponse?.rolist || mappingResponse?.role_type_list || mappingResponse?.roleList || mappingResponse?.ivrmrT_List || [],
        staff:
            mappingResponse?.stafflist ||
            mappingResponse?.user_list ||
            mappingResponse?.employee_list ||
            mappingResponse?.staffList ||
            mappingResponse?.ivrmuL_List ||
            [],
        isLoading: libraryQuery.isLoading || mappingListQuery.isLoading,
        refetchAll: () => {
            libraryQuery.refetch();
            mappingListQuery.refetch();
        }
    };
}

export function useMasterLibraryEditData() {
    const editClassMutation = useMutation({
        mutationFn: (id: number) => getMasterLibraryEditClass(id)
    });

    const editStaffMutation = useMutation({
        mutationFn: ({ id1, id2 }: { id1: number; id2: number }) => getMasterLibraryById(id1, id2)
    });

    return {
        fetchEditClass: editClassMutation.mutateAsync,
        isFetchingClass: editClassMutation.isPending,
        fetchEditStaff: editStaffMutation.mutateAsync,
        isFetchingStaff: editStaffMutation.isPending
    };
}

export function useMasterLibrarySaveMapping() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => addOrUpdateMasterLibrary(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [LIBRARY_QUERY_KEYS.MASTER_LIBRARY_LIST_DATA] });
            queryClient.invalidateQueries({ queryKey: ['MASTER_LIBRARY_MAPPED_LIST_DATA'] });
        }
    });
}

export function useMasterLibrarySaveClassMapping() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { LMAL_Id: number; classlst: { ASMCL_Id: number }[] }) => saveClassMapping(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [LIBRARY_QUERY_KEYS.MASTER_LIBRARY_LIST_DATA] });
            queryClient.invalidateQueries({ queryKey: ['MASTER_LIBRARY_MAPPED_LIST_DATA'] });
        }
    });
}

export function useMasterLibrarySaveStaffMapping() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { LUL_Id: number; LMAL_Id: number; IVRMUL_Id: number }) => saveStaffMapping(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [LIBRARY_QUERY_KEYS.MASTER_LIBRARY_LIST_DATA] });
            queryClient.invalidateQueries({ queryKey: ['MASTER_LIBRARY_MAPPED_LIST_DATA'] });
        }
    });
}
