import { getPurchaseDonateReportData, getPurchaseDonateReportInitialData } from '@/server/library/reports/purchase-donate-report';
import type { IPurchaseDonateReportRequest } from '@/types/library/reports/purchase-donate-report';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const usePurchaseDonateReportInitialData = () => {
    return useQuery({
        queryKey: ['purchase-donate-report-initial'],
        queryFn: () => getPurchaseDonateReportInitialData(),
        refetchOnWindowFocus: false
    });
};

export const usePurchaseDonateReportSearch = () => {
    return useMutation({
        mutationFn: (data: IPurchaseDonateReportRequest) => getPurchaseDonateReportData(data),
        onError: (error) => {
            console.error('Error fetching report data:', error);
            toast.error('Failed to fetch report data');
        }
    });
};
