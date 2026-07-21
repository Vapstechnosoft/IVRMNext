'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import ProgressCardPrintView from './progress-card-printable';

interface ProgressCardReportProps {
    reportData: any[];
    saveList: any[];
    extraData: any;
    institution: any;
    examName: string;
    examCode: string;
    year: string;
    onPrint: () => void;
}

export default function ProgressCardReport({
    reportData,
    saveList,
    extraData,
    institution,
    examName,
    examCode,
    year,
    onPrint
}: ProgressCardReportProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-end no-print">
                <Button onClick={onPrint} className="gap-2">
                    <Printer className="h-4 w-4" />
                    Print Report
                </Button>
            </div>

            <div className="overflow-auto border rounded-lg bg-gray-50 p-4">
                <div className="mx-auto bg-white shadow-lg origin-top scale-[0.8] md:scale-100">
                    <ProgressCardPrintView
                        reportData={reportData}
                        saveList={saveList}
                        extraData={extraData}
                        institution={institution}
                        examName={examName}
                        examCode={examName}
                        year={year}
                    />
                </div>
            </div>
        </div>
    );
}
