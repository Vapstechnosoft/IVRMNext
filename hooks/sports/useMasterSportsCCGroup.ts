import { fetchMasterSportsCCGroup } from '@/server/sports/masters/sports-cc-group';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterSportsCCGroup = (searchParams?: any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: ['masterSportsCCGroup', searchParams],
            queryFn: async () => fetchMasterSportsCCGroup(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['masterSportsCCGroup']
            });
        }
    };
};
