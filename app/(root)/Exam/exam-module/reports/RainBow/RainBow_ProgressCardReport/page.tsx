'use client';

import { useState, useRef, useEffect } from 'react';
import { ReportForm } from './_components/report-form';
import { ReportList } from './_components/report-list';

export default function RainBowProgressCardReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [academicYear, setAcademicYear] = useState<string>('');
    const listRef = useRef<HTMLDivElement>(null);

    const handleReportGenerated = (data: any, year: string) => {
        setReportData(data);
        setAcademicYear(year);
    };

    const handleReset = () => {
        setReportData(null);
        setAcademicYear('');
    };

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
                    <ReportForm onReportGenerated={handleReportGenerated} onReset={handleReset} />
                </section>

                <div ref={listRef} className="transition-all duration-500">
                    {reportData && (
                        <section className="animate-in slide-in-from-bottom-4 duration-500">
                            <ReportList data={reportData} academicYear={academicYear} />
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
