import { useMutation, useQuery } from '@tanstack/react-query';
import { getSportsYearEndReport, getSportsYearEndReportLoadData } from '@/server/sports/reports/year-end-report';
import { YearEndReportFormSchema } from '@/types/sports/reports/year-end-report';

export const useYearEndReport = () => {
    const loadData = useQuery({
        queryKey: ['yearEndReportValues'],
        queryFn: getSportsYearEndReportLoadData,
    });

    const generateReport = useMutation({
        mutationFn: async (data: YearEndReportFormSchema) => {
            const response = await getSportsYearEndReport(data as any);
            return response;
        },
    });

    return {
        loadData,
        generateReport,
    };
};
