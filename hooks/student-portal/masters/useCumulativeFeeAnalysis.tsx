import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
    type CumulativeFeeAnalysisSchema,
    cumulativeFeeAnalysisSchema
} from '@/schemas/student-portal/masters/cumulative-fee-analysis.schema';
import {
    getCumulativeFeeAnalysisInitialData,
    getCumulativeFeeAnalysisReport
} from '@/server/student-portal/masters/cumulative-fee-analysis';
import type {
    IApiResponse,
    ICumulativeFeeAnalysisData,
    IFeeAnalysisData,
    IFeeDetailsData
} from '@/types/student-portal/masters/cumulative-fee-analysis';

export function useCumulativeFeeAnalysis() {
    const [feeAnalysisList, setFeeAnalysisList] = useState<IFeeAnalysisData[]>([]);
    const [studentFeeDetails, setStudentFeeDetails] = useState<IFeeDetailsData[]>([]);
    const [isReportLoading, setIsReportLoading] = useState(false);

    const form = useForm<CumulativeFeeAnalysisSchema>({
        resolver: zodResolver(cumulativeFeeAnalysisSchema),
        defaultValues: {
            asmaY_Id: ''
        }
    });

    const { data: initialData, isLoading: isInitialLoading } = useQuery<IApiResponse<ICumulativeFeeAnalysisData>>({
        queryKey: ['cumulativeFeeAnalysisInitialData'],
        queryFn: async () => {
            try {
                const response = await getCumulativeFeeAnalysisInitialData();
                // if (response?.data?.acdlist && response.data.acdlist.length > 0) {
                //     // Check if any year is selected by default in the list
                //     const selectedYear = response.data.acdlist.find(y => y.selected);
                //     if (selectedYear) {
                //         form.setValue('asmaY_Id', selectedYear.asmaY_Id.toString());
                //         // Optionally auto-load report if needed, but usually waiting for user action or explicit effect
                //         handleReport({ asmaY_Id: selectedYear.asmaY_Id.toString() });
                //     } else {
                //         form.setValue('asmaY_Id', response.data.acdlist[0].asmaY_Id.toString());
                //         // Auto load for first item if desired
                //         handleReport({ asmaY_Id: response.data.acdlist[0].asmaY_Id.toString() });
                //     }
                // }
                return response;
            } catch (error: any) {
                toast.error(error.message || 'Failed to fetch initial data');
                return {
                    success: false,
                    message: error.message,
                    data: { acdlist: [], feeAnalysisList: [], studentfeedetails: [] },
                    total: 0,
                    page: 0,
                    page_size: 0
                } as any;
            }
        }
    });

    const handleReport = async (data: CumulativeFeeAnalysisSchema) => {
        setIsReportLoading(true);
        try {
            const response = await getCumulativeFeeAnalysisReport({ ASMAY_Id: Number(data.asmaY_Id) });
            if (response?.data) {
                // if (response.data.feeAnalysisList && response.data.feeAnalysisList.length > 0) {
                //     setFeeAnalysisList(response.data.feeAnalysisList);
                // } else {
                //     setFeeAnalysisList([]);
                // }
                // if (response.data.studentfeedetails && response.data.studentfeedetails.length > 0) {
                //     setStudentFeeDetails(response.data.studentfeedetails);
                // } else {
                //     setStudentFeeDetails([]);
                // }
                // if ((!response.data.feeAnalysisList || response.data.feeAnalysisList.length === 0) &&
                //     (!response.data.studentfeedetails || response.data.studentfeedetails.length === 0)) {
                //     toast.info('No Data Found!!!');
                // }
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to fetch report data');
            setFeeAnalysisList([]);
            setStudentFeeDetails([]);
        } finally {
            setIsReportLoading(false);
        }
    };

    return {
        form,
        initialData,
        isInitialLoading,
        feeAnalysisList,
        studentFeeDetails,
        handleReport,
        isReportLoading
    };
}
