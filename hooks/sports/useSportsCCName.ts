import { getSportsCCNameDetails } from '@/server/sports/masters/sports-cc-name';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useSportsCCName = (searchParams?: any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: ['sports-cc-name', searchParams],
            queryFn: async () => getSportsCCNameDetails(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['sports-cc-name']
            });
        }
    };
};
