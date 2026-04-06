import { getMasterCompetitionLevels } from '@/server/sports/masters/competition-level';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterCompetitionLevels = (searchParams?: any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: ['master-competition-levels', searchParams || {}],
            queryFn: async () => getMasterCompetitionLevels(searchParams),
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['master-competition-levels']
            });
        }
    };
};
