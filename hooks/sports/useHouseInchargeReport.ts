import { useMutation, useQuery } from '@tanstack/react-query';
import { getInitialData, getHouseInchargeReportData } from '@/server/sports/reports/house-incharge-report';
import { toast } from 'sonner';

export const useHouseInchargeReport = () => {
    const initialData = useQuery({
        queryKey: ['houseInchargeReportInitial'],
        queryFn: () => getInitialData(),
    });

    const reportData = useMutation({
        mutationFn: getHouseInchargeReportData,
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
