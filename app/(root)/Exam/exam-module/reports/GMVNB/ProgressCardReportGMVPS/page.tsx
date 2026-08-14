'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ReportForm } from './_components/report-form';
import { ReportList } from './_components/report-list';
import { Loader2 } from 'lucide-react';

export default function ProgressCardReportGMVPSPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [academicYear, setAcademicYear] = useState<string>('');
    const [generatedDate, setGeneratedDate] = useState<Date | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    const handleReportGenerated = (
        data: any,
        year: string,
        gDate?: Date
    ) => {
        setReportData(data);
        setAcademicYear(year);
        setGeneratedDate(gDate);
    };

    const handleReset = useCallback(() => {
        setReportData(null);
        setAcademicYear('');
    }, []);

    // Auto-scroll to report when generated
    useEffect(() => {
        if (reportData && listRef.current) {
            const timer = setTimeout(() => {
                listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [reportData]);

    return (
        <div className="container mx-auto py-8 space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 gap-8">
                <section className="transition-all duration-500">
                    <ReportForm onReportGenerated={handleReportGenerated} onReset={handleReset} onLoading={setIsLoading} />
                </section>

                <div ref={listRef} className="transition-all duration-500 relative min-h-[200px]">
                    {isLoading ? (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm pt-12">
                            <Loader2 className="h-10 w-10 animate-spin text-sky-800 mb-4" />
                            <p className="text-sm text-sky-800 font-medium animate-pulse">Generating Report...</p>
                        </div>
                    ) : reportData && (
                        <section className="animate-in slide-in-from-bottom-4 duration-500">
                            <ReportList
                                data={reportData}
                                academicYear={academicYear}
                                generatedDate={generatedDate}
                            />
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
