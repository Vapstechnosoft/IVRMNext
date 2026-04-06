'use client';

import { useExamReportLoadData } from '@/hooks/exam/exammodule/reports';
import { Loader2 } from 'lucide-react';
import ExamReportClient from './_components/exam-report-client';

const LOAD_PAYLOAD = {};

export default function ExamReportPage() {
   // const { data: initialData, isLoading, error } = useExamReportLoadData(LOAD_PAYLOAD);

    // if (isLoading) {
    //     return (
    //         <div className="flex justify-center items-center min-h-[50vh]">
    //             <Loader2 className="h-8 w-8 animate-spin" />
    //         </div>
    //     );
    // }

    // if (error || !initialData) {
    //     return <div className="p-4 text-red-500">Error loading data. Please try again.</div>;
    // }

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <ExamReportClient
                // initialYears={initialData.studetiallist || []}
                // initialExams={initialData.examlist || []}
                // rcode={initialData.rcode}
            />
        </div>
    );
}
