import { useMutation, useQuery } from '@tanstack/react-query';
import { getPointsRecordReport, getPointsRecordReportLoadData } from '@/server/sports/reports/points-record-report';
import { SportPointsAndRecordReportFormSchema } from '@/types/sports/reports/points-record-report';

export const useSportPointsAndRecordReport = () => {
    const loadData = useQuery({
        queryKey: ['pointsRecordReportValues'],
        queryFn: getPointsRecordReportLoadData,
    });

    const generateReport = useMutation({
        mutationFn: async (data: SportPointsAndRecordReportFormSchema) => {
            const response = await getPointsRecordReport(data as any);
            return response;
        },
    });

    return {
        loadData,
        generateReport,
    };
};
