import { useQuery, useMutation } from "@tanstack/react-query";
import { getBankCopyReportInitialData, getBankCopyReport, getBankCopyReportDetails } from "@/server/pettycash/BankCopyReport";
import { IBankCopyReportParams } from "@/types/pettycash/BankCopyReport";

export const useBankCopyReportInitialData = () => {
    return useQuery({
        queryKey: ['BANK_COPY_REPORT_INITIAL_DATA'],
        queryFn: () => getBankCopyReportInitialData(),
    });
};

export const useBankCopyReportMutation = () => {
    return useMutation({
        mutationFn: (data: IBankCopyReportParams) => getBankCopyReport(data),
    });
};

export const useBankCopyReportDetailsMutation = () => {
    return useMutation({
        mutationFn: (data: any) => getBankCopyReportDetails(data),
    });
};
