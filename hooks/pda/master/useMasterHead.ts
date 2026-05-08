import { PDA_QUERY_KEYS } from '@/constants/pda-query-keys';
import { getPDAMasterHeadDetails } from '@/server/pda/master/master-head';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterHead = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PDA_QUERY_KEYS.MASTER_HEAD, searchParams ?? {}],
            queryFn: async () => getPDAMasterHeadDetails(searchParams),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PDA_QUERY_KEYS.MASTER_HEAD]
            })
    };
};
