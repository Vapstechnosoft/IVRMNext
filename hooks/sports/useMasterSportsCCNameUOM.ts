import { getMasterSportsCCNameUOMs } from '@/server/sports/masters/sports-cc-name-uom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterSportsCCNameUOM = (searchParams?: any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: ['master-sports-cc-name-uom', searchParams ?? {}],
            queryFn: async () => getMasterSportsCCNameUOMs(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['master-sports-cc-name-uom']
            });
        }
    };
};
