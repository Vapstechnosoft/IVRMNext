'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMasterLibraryList } from '@/server/library/masters/master_library';

export function useMasterLibraryMapping() {
    const queryClient = useQueryClient();

    // In a real app, this would call specialized mapping endpoints.
    // For now, we'll use existing ones where possible.
    
    const libraryQuery = useQuery({
        queryKey: ['MASTER_LIBRARY_LIST'],
        queryFn: async () => getMasterLibraryList(),
    });

    return {
        libraries: (libraryQuery.data as any)?.data || [],
        isLoading: libraryQuery.isLoading,
        refetchAll: () => {
            queryClient.invalidateQueries({ queryKey: ['MASTER_LIBRARY_LIST'] });
        }
    };
}
