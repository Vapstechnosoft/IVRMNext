import { getBankCopyReport, getBankCopyReportDetails, getBankCopyReportInitialData, getMonthList } from '@/server/pettycash/BankCopyReport';
import type { IBankCopyReportParams } from '@/types/pettycash/BankCopyReport';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useBankCopyReportInitialData = () => {
    return useQuery({
        queryKey: ['BANK_COPY_REPORT_INITIAL_DATA'],
        queryFn: () => getBankCopyReportInitialData()
    });
};

export const useBankCopyReportMutation = () => {
    return useMutation({
        mutationFn: (data: IBankCopyReportParams) => getBankCopyReport(data)
    });
};

export const useBankCopyReportDetailsMutation = () => {
    return useMutation({
        mutationFn: (data: any) => getBankCopyReportDetails(data)
    });
};

export const useMonthList = () => {
    return useQuery({
        queryKey: ['MONTH_LIST'],
        queryFn: () => getMonthList()
    });
};
