import { useMutation, useQuery } from '@tanstack/react-query';
import { getInitialData, getDetails, getSections, getReportData } from '@/server/sports/reports/sport-topper-list-report';
import { toast } from 'sonner';

export const useSportTopperListReport = () => {
    const initialData = useQuery({
        queryKey: ['sportTopperListReportInitial'],
        queryFn: getInitialData
    });

    const detailsData = useMutation({
        mutationFn: getDetails,
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const sectionsData = useMutation({
        mutationFn: getSections,
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const reportData = useMutation({
        mutationFn: getReportData,
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    return {
        initialData,
        detailsData,
        sectionsData,
        reportData
    };
};
