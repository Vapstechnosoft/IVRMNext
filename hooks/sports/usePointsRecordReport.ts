import { useMutation, useQuery } from '@tanstack/react-query';
import {
    getPointsRecordReportInitialData,
    getPointsRecordReportClasses,
    getPointsRecordReportSections,
    getPointsReport
} from '@/server/sports/reports/points-record-report';
import { toast } from 'sonner';

export const usePointsRecordReport = () => {

    // Initial Data
    const loadData = useQuery({
        queryKey: ['pointsRecordReportInitial'],
        queryFn: () => getPointsRecordReportInitialData(),
        //staleTime: Infinity,
    });

    // Cascading: Fetch Classes, Houses, Events
    const classHouseEventMutation = useMutation({
        mutationFn: ({ asmaY_Id }: { asmaY_Id: number }) => getPointsRecordReportClasses(asmaY_Id),
        onError: (error) => {
            toast.error(error.message || 'Failed to fetch cascading data');
        },
    });

    // Cascading: Fetch Sections
    const sectionMutation = useMutation({
        mutationFn: ({ asmaY_Id, asmcL_Id }: { asmaY_Id: number; asmcL_Id: number }) => getPointsRecordReportSections(asmaY_Id, asmcL_Id),
        onError: (error) => {
            toast.error(error.message || 'Failed to fetch sections');
        },
    });

    // Generate Report
    const generateReport = useMutation({
        mutationFn: getPointsReport,
        onError: (error) => {
            toast.error(error.message || 'Failed to generate report');
        },
    });

    return {
        loadData,
        classHouseEventMutation,
        sectionMutation,
        generateReport,
    };
};
