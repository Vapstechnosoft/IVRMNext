'use client';

import { useState, useRef } from 'react';
import { useStAnnsTcDetails } from '@/hooks/admission/preadmission/useStAnnsTcReport';
import { FilterForm } from './_components/filter-form';
import TcReport from './_components/tc-report';
import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import {
    Search,
    Printer,
    FileCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function StAnnsTcCustomReportPage() {
    const detailsMutation = useStAnnsTcDetails();
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handleReport = async (formData: any) => {
        try {
            toast.loading('Fetching TC details...', { id: 'tc-report' });

            const payload = {
                ASMAY_Id: formData.ASMAY_Id,
                ASMCL_Id: formData.ASMCL_Id || 0,
                ASMS_Id: formData.ASMS_Id || 0,
                AMST_Id: formData.AMST_Id,
                tctemporper: formData.temporper
            };

            const response = await detailsMutation.mutateAsync(payload);

            if (response?.data?.result?.length > 0) {
                setReportData(response.data);
                setShowReport(true);
                toast.success('Report generated successfully!', { id: 'tc-report' });
            } else {
                toast.error('TC Details not found for the selected student.', { id: 'tc-report' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report. Please check server logs.', { id: 'tc-report' });
        }
    };

    const handleReset = () => {
        window.location.reload();
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `StAnns_TC_Report_${new Date().getTime()}`
    });

    return (
        <div className="min-h-screen bg-white p-2">
            {/* Legacy Style Header Bar */}
            <div className="w-full bg-[#3a5999] px-4 py-1 flex items-center justify-between shadow-sm">
                <h1 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    STUDENT TC CUSTOM REPORT
                </h1>
                <div className="text-white cursor-pointer hover:opacity-80">
                    <span className="text-xl leading-none">−</span>
                </div>
            </div>

            {/* Form Section */}
            <div className="border border-t-0 p-4 bg-white">
                <FilterForm
                    onSubmit={handleReport}
                    onReset={handleReset}
                    onPrint={() => handlePrint()}
                    hasData={showReport}
                />
            </div>

            {/* Report Preview Section */}
            {showReport && reportData && (
                <div className="mt-8 flex flex-col items-center">
                    <div className="bg-slate-100 w-full p-8 flex justify-center overflow-x-auto">
                        <div className="bg-white shadow-2xl p-0">
                            <TcReport
                                ref={printRef}
                                data={reportData}
                            />
                        </div>
                    </div>
                </div>
            )}

            {!showReport && (
                <div className="mt-10 flex flex-col items-center justify-center opacity-30">
                    <Search className="w-12 h-12 text-slate-400 mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Select criteria and click report to view certificate</p>
                </div>
            )}
        </div>
    );
}
