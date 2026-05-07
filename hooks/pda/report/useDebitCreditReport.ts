import { PDA_QUERY_KEYS } from '@/constants/pda-query-keys';
import { 
    getPDAReportLoadData, 
    getPDASectionsSRS, 
    getPDAStudentsSRS, 
    generatePDADebitCreditReportSRS 
} from '@/server/pda/report/debit-credit-report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const usePDAReportLoadData = () => {
    return useQuery({
        queryKey: [PDA_QUERY_KEYS.MASTER_HEAD, 'load-data'], // Reusing PDA_QUERY_KEYS or could add more
        queryFn: async () => getPDAReportLoadData()
    });
};

export const usePDASectionsSRS = () => {
    return useMutation({
        mutationFn: getPDASectionsSRS
    });
};

export const usePDAStudentsSRS = () => {
    return useMutation({
        mutationFn: getPDAStudentsSRS
    });
};

export const useGeneratePDAReportSRS = () => {
    return useMutation({
        mutationFn: generatePDADebitCreditReportSRS
    });
};
