import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getSportHouseReportPointsLoadData,
    getClassesForYear,
    getSectionsForClass,
    getSportHouseReportPoints
} from '@/server/sports/reports/sport-house-report-points';
import type { ISportHouseReportPointsRequest } from '@/types/sports/reports/sport-house-report-points';

export const useSportHouseReportPoints = (payload?: ISportHouseReportPointsRequest) => {
    const queryClient = useQueryClient();

    const initialData = useQuery({
        queryKey: ['sportHouseReportPointsInitial'],
        queryFn: () => getSportHouseReportPointsLoadData(),
    });

    const reportQuery = useQuery({
        queryKey: ['sport-house-report-points', payload],
        queryFn: () => getSportHouseReportPoints(payload!),
        enabled: !!payload,
    });

    const generateReport = useMutation({
        mutationFn: (data: ISportHouseReportPointsRequest) => getSportHouseReportPoints(data),
    });

    return {
        initialData,
        reportQuery,
        generateReport,
        refetchReport: () => queryClient.invalidateQueries({ queryKey: ['sport-house-report-points'] })
    };
};
