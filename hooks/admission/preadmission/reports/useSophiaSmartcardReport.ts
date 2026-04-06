import { useQuery, useMutation } from '@tanstack/react-query';
import { getSmartcardLoadData, getSmartcardReportData } from '../../../../server/admission/preadmission/reports/sophia_smartcard_report';

export const useSophiaSmartcardReport = () => {
    const loadData = useQuery({
        queryKey: ['sophiaSmartcardLoadData'],
        queryFn: () => getSmartcardLoadData()
    });

    const reportMutation = useMutation({
        mutationFn: (data: {
            ASMAY_Id: number;
            ASMCL_Id: number;
            ASMC_Id: number;
            stdmobilenumber: string;
        }) => getSmartcardReportData(data)
    });

    return {
        loadData,
        reportMutation
    };
};
