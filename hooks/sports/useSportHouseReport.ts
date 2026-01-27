import { useMutation, useQuery } from '@tanstack/react-query';
import { getInitialData, getSportHouseReportData } from '@/server/sports/reports/sport-house-report';
import { toast } from 'sonner';

export const useSportHouseReport = () => {
    const initialData = useQuery({
        queryKey: ['sportHouseReportInitial'],
        queryFn: () => getInitialData(),
    });

    const reportData = useMutation({
        mutationFn: getSportHouseReportData,
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    return {
        initialData,
        reportData,
    };
};
