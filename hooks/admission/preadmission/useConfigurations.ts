import { PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import { checkPreadmissionLive } from '@/server/admission/preadmission/configuration/configuration';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useCheckPreadmissionLive = (subDomain: string) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.CHECK_PREADMISSION_LIVE, subDomain],
            queryFn: async () => checkPreadmissionLive(subDomain),
            staleTime: 50000, // 5 seconds
            enabled: !!subDomain
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.CHECK_PREADMISSION_LIVE]
            });
        }
    };
};
