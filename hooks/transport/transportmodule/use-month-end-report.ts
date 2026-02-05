import { getMonthEndReportInitialData } from '@/server/transport/transport-module/reports/month-end-report';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMonthEndReport = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: ['TRANSPORT_MONTH_END_REPORT_INITIAL_DATA'],
            queryFn: async () => getMonthEndReportInitialData(),
            staleTime: 300
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['TRANSPORT_MONTH_END_REPORT_INITIAL_DATA']
            });
        }
    };
};
