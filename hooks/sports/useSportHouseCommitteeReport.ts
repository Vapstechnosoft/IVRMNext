import { useMutation, useQuery } from '@tanstack/react-query';
import { getInitialData, getSportHouseCommitteeReportData } from '@/server/sports/reports/sport-house-committee-report';
import { toast } from 'sonner';

export const useSportHouseCommitteeReport = () => {
    const initialData = useQuery({
        queryKey: ['sportHouseCommitteeReportInitial'],
        queryFn: () => getInitialData(),
    });

    const reportData = useMutation({
        mutationFn: getSportHouseCommitteeReportData,
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
