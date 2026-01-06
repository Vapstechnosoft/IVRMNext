import { LIBRARY_QUERY_KEYS } from '@/constants/query-keys';
import { getMasterLibraryList } from '@/server/library/masters/librarycategory';
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
