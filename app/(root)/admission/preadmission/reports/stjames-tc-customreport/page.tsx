'use client';

import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { FilterForm } from './_components/filter-form';
import { StJamesTcPrint } from './_components/stjames-tc-print';
import { useStjamesTcReport } from '@/hooks/admission/preadmission/useStjamesTcCustomReport';
import { type StjamesTcCustomReportFields } from '@/schemas/admission/preadmission/reports/stjames-tc-custom-report';
import { Button } from '@/components/ui/button';
import { Printer, FileText, Loader2 } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';

interface StjamesTcReportResponse {
    studentTCList: any[];
    academicList1?: any[];
    previousschool?: any[];
    studenttcdetails?: any[];
}

export default function StjamesTcCustomReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const tcReportMutation = useStjamesTcReport();

    const handleReport = async (formData: StjamesTcCustomReportFields) => {
        try {
            toast.loading('Generating TC Report...', { id: 'tc-report' });
            
            const payload = {
                ASMAY_Id: formData.ASMAY_Id,
                ASMCL_Id: formData.ASMCL_Id as number,
                ASMS_Id: formData.ASMS_Id as number,
                AMST_Id: formData.AMST_Id as number,
                tctemporper: formData.temporper
            };

            const response = await tcReportMutation.mutateAsync(payload) as any;
            const data = response.data as StjamesTcReportResponse;

            if (data && data.studentTCList && data.studentTCList.length > 0) {
                const tcData = data.studentTCList[0];
                const academicInfo = data.academicList1?.[0] || {};
                
                // Process data mapping as per AngularJS logic
                const mappedData = {
                    tcno: tcData.astC_TCNO,
                    admno: tcData.amsT_RegistrationNo,
                    lblstdname: tcData.studentname,
                    lblfathername: tcData.amsT_FatherName,
                    lblmothername: tcData.amsT_MotherName,
                    lbldob: tcData.amsT_DOB,
                    lbldobwords: tcData.amsT_DOB_Words,
                    lbldoa: tcData.amsT_Date,
                    lbldol: data.studenttcdetails?.[0]?.astC_TCDate || tcData.astC_LastAttendedDate,
                    lblconduct: tcData.astC_Conduct,
                    lblPromotion: tcData.qualificlass,
                    previousschoolname: data.previousschool?.[0]?.amstpS_PrvSchoolName || '',
                    laststudiedinwords: tcData.Last_Class_Studied || '', // This might need SwitchFuction mapping if not already in words
                    todaydate: tcData.astC_TCIssueDate || new Date().toISOString(),
                };

                // Helper to mimic SwitchFuction from AngularJS if needed
                if (!mappedData.laststudiedinwords && tcData.Last_Class_Studied) {
                    mappedData.laststudiedinwords = mapClassToWords(tcData.Last_Class_Studied);
                }

                setReportData(mappedData);
                setShowReport(true);
                toast.success('Report generated successfully', { id: 'tc-report' });
            } else {
                toast.error('No data found for the selected student', { id: 'tc-report' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('Report generation error:', error);
            toast.error('Failed to generate report', { id: 'tc-report' });
        }
    };

    const handleReset = () => {
        setReportData(null);
        setShowReport(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `TC_Report_${reportData?.lblstdname || 'Student'}`,
    });

    return (
        <div className="container mx-auto p-4 space-y-6">
            <CollapsibleSection
                title="Student TC Custom Report"
                description="Generate and print custom Transfer Certificates for St. James School"
                defaultOpen={true}
            >
                <div className="bg-white p-6">
                    <FilterForm onSubmit={handleReport} onReset={handleReset} />
                </div>
            </CollapsibleSection>

            {showReport && reportData && (
                <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex justify-end gap-4 p-4 bg-slate-50 border rounded-lg">
                        <Button onClick={() => handlePrint()} className="bg-indigo-600 hover:bg-indigo-700">
                            <Printer className="mr-2 h-4 w-4" /> Print TC
                        </Button>
                    </div>

                    <div className="bg-slate-100 p-8 rounded-xl border-2 border-dashed border-slate-300 flex justify-center overflow-x-auto">
                        <div className="shadow-2xl bg-white origin-top">
                            <StJamesTcPrint ref={printRef} data={reportData} />
                        </div>
                    </div>
                </div>
            )}

            {tcReportMutation.isPending && (
                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Generating certificate preview...</p>
                </div>
            )}
        </div>
    );
}

// Helper function to map class names to words if needed
function mapClassToWords(className: string): string {
    const map: Record<string, string> = {
        'I': 'FIRST',
        'II': 'SECOND',
        'III': 'THIRD',
        'IV': 'FOURTH',
        'V': 'FIFTH',
        'VI': 'SIXTH',
        'VII': 'SEVENTH',
        'VIII': 'EIGHTH',
        'IX': 'NINTH',
        'X': 'TENTH',
        'XI': 'ELEVENTH',
        'XII': 'TWELFTH',
        'Nursery': 'Nursery',
        'Transition': 'Transition',
        'Upper Nursery': 'Upper Nursery',
        'Lower Nursery': 'Lower Nursery',
        'K G': 'K G',
    };
    return map[className] || className;
}
