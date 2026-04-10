'use client';

import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { FilterForm } from './_components/filter-form';
import { CustomTcPrint } from './_components/custom-tc-print';
import { CustomTcListPrint } from './_components/custom-tc-list-print';
import { CustomTcResultsTable } from './_components/custom-tc-results-table';
import { useCustomTcReportDetails, useCustomTcInitialData } from '@/hooks/admission/preadmission/useCustomTcReport';
import { type CustomTcFields } from '@/schemas/admission/preadmission/reports/custom-tc';
import { Button } from '@/components/ui/button';
import { Printer, FileText, Loader2, RotateCcw, LayoutGrid } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Card, CardContent } from '@/components/ui/card';

export default function CustomTcPage() {
    const { data: initialData } = useCustomTcInitialData();
    const [reportData, setReportData] = useState<any>(null);
    const [summaryList, setSummaryList] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [viewType, setViewType] = useState<'individual' | 'list'>('individual');

    const individualPrintRef = useRef<HTMLDivElement>(null);
    const listPrintRef = useRef<HTMLDivElement>(null);

    const tcReportMutation = useCustomTcReportDetails();

    const getMonthName = (monthIndex: number) => {
        const months = [
            'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
            'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
        ];
        return months[monthIndex] || '';
    };

    const convertToWords = (val: string) => {
        if (!val) return val;
        const mapping: Record<string, string> = {
            'I': 'FIRST', 'II': 'SECOND', 'III': 'THIRD', 'IV': 'FOURTH',
            'V': 'FIFTH', 'VI': 'SIXTH', 'VII': 'SEVENTH', 'VIII': 'EIGHTH',
            'IX': 'NINTH', 'X': 'TENTH'
        };
        return mapping[val] || val;
    };

    const handleReport = async (formData: CustomTcFields) => {
        try {
            if (formData.AMST_Id > 0) {
                toast.loading('Generating TC Certificate...', { id: 'tc-report' });
                const payload = {
                    ASMAY_Id: formData.ASMAY_Id,
                    ASMCL_Id: formData.ASMCL_Id || 0,
                    ASMS_Id: formData.ASMS_Id || 0,
                    AMST_Id: formData.AMST_Id,
                    tctemporper: formData.tctemporper
                };

                const response = await tcReportMutation.mutateAsync(payload) as any;
                const data = response.data || response;
                // Fallback to data.result from new API format if studentTCList is empty/undefined
                const studentTCList = data.studentTCList || data.result;

                if (studentTCList && studentTCList.length > 0) {
                    const tcData = studentTCList[0];
                    const academicInfo = data.academicList1?.[0];

                    let lblschoolbegins = '';
                    if (academicInfo) {
                        const fromDate = new Date(academicInfo.asmaY_From_Date);
                        const toDate = new Date(academicInfo.asmaY_To_Date);
                        lblschoolbegins = `${getMonthName(fromDate.getMonth())}-${fromDate.getFullYear()} to ${getMonthName(toDate.getMonth())}-${toDate.getFullYear()}`;
                    }

                    const laststudiedInWords = convertToWords(tcData.last_class_studied || tcData.Last_Class_Studied);

                    const mappedData = {
                        ...tcData,
                        studenttcdetails: data.studenttcdetails,
                        academicList1: data.academicList1,
                        masterCompany: data.masterCompany,
                        ascisS_QRCode: data.ascisS_QRCode || tcData.ascisS_QRCode,
                        lblstdname: tcData.studentname || tcData.lblstdname,
                        tcno: tcData.astc_tcno || tcData.astC_TCNO,
                        admno: tcData.amst_admno || tcData.amsT_AdmNo,
                        lbldob: tcData.amst_dob || tcData.amsT_DOB,
                        lbldobwords: tcData.amst_dob_words || tcData.amsT_DOB_Words,
                        lblmothername: tcData.amst_mothername || tcData.amsT_MotherName,
                        lblfathername: tcData.amst_fathername || tcData.amsT_FatherName,
                        lblnationality: tcData.nationality || tcData.lblnationality || 'Indian',
                        lblreligioncaste: tcData.religion,
                        studcaste: tcData.caste,
                        Mothertounge: tcData.amst_mothertongue || tcData.AMST_MotherTongue,
                        Applicatiodate: tcData.astc_tcapplicationdate || tcData.astC_TCApplicationDate || tcData.Applicatiodate,
                        lblreasonleaving: tcData.astc_leavingreason || tcData.astC_LeavingReason,
                        lblconduct: tcData.astc_conduct || tcData.astC_Conduct || 'Good',
                        promotionflag: tcData.promotionflag,
                        laststudied: tcData.last_class_studied || tcData.Last_Class_Studied,
                        laststudiedinwords: laststudiedInWords,
                        noof_daysattended: tcData.noof_daysattended,
                        noof_schooldays: tcData.noof_schooldays,
                        govtno: tcData.govtno,
                        Penno: tcData.amst_penno || tcData.Penno,
                        lblschoolbegins: lblschoolbegins,
                        astC_LastExamDetails: tcData.astC_LastExamDetails || data.studenttcdetails?.[0]?.astC_LastExamDetails,
                        subjectstudied: tcData.subjectstudied,
                        fee_concesion: tcData.fee_concesion || 'No',
                        result: tcData.astC_ResultDetails || data.studenttcdetails?.[0]?.astC_ResultDetails || 'Passed',
                        schedulecaste: data.studenttcdetails?.[0]?.schedulecaste,
                    };

                    setReportData(mappedData);
                    setViewType('individual');
                    setShowResults(true);
                    toast.success('Certificate generated', { id: 'tc-report' });
                } else {
                    toast.error('No TC records found for this student', { id: 'tc-report' });
                }
            } else {
                if (summaryList.length === 0) {
                    toast.error('No students found for the selected filter');
                    return;
                }
                setViewType('list');
                setShowResults(true);
                toast.success('Summary list loaded', { id: 'tc-report' });
            }
        } catch (error) {
            console.error('Report generation error:', error);
            toast.error('Failed to generate report', { id: 'tc-report' });
        }
    };

    const handleReset = () => {
        setReportData(null);
        setShowResults(false);
    };

    const handlePrintIndividual = useReactToPrint({
        contentRef: individualPrintRef,
        documentTitle: `TC_Report_${reportData?.lblstdname || 'Student'}`,
    });

    const handlePrintList = useReactToPrint({
        contentRef: listPrintRef,
        documentTitle: `TC_Summary_Report_${new Date().toLocaleDateString()}`,
    });

    const selectedYear = (initialData as any)?.data?.accyear?.find((y: any) => y.asmaY_Id === Number(reportData?.asmaY_Id))?.asmaY_Year;

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-500">

            <CollapsibleSection
                title="Search Filters"
                description="Choose student type and academic year to proceed"
                defaultOpen={true}
                className="shadow-md border-none rounded-2xl bg-white ring-1 ring-slate-200"
            >
                <div className="p-2">
                    <FilterForm
                        onSubmit={handleReport}
                        onReset={handleReset}
                        onStudentListUpdate={setSummaryList}
                    />
                </div>
            </CollapsibleSection>

            {showResults && (
                <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                    {/* View Controls & Action Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-indigo-50/50 backdrop-blur-sm border border-indigo-100 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl flex items-center gap-2 border transition-all cursor-pointer ${viewType === 'individual' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`} onClick={() => setViewType('individual')}>
                                <FileText className="w-5 h-5" />
                                <span className="font-bold text-sm">Certificate View</span>
                            </div>
                            <div className={`p-2 rounded-xl flex items-center gap-2 border transition-all cursor-pointer ${viewType === 'list' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`} onClick={() => setViewType('list')}>
                                <LayoutGrid className="w-5 h-5" />
                                <span className="font-bold text-sm">List View</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {viewType === 'individual' && reportData && (
                                <Button onClick={() => handlePrintIndividual()} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100">
                                    <Printer className="mr-2 h-4 w-4" /> Print Certificate
                                </Button>
                            )}
                            <Button variant="outline" onClick={handleReset} className="rounded-xl border-slate-200 shadow-sm">
                                <RotateCcw className="mr-2 h-4 w-4" /> Reset Search
                            </Button>
                        </div>
                    </div>

                    {/* Conditional Rendering based on View Type */}
                    <div className="min-h-[600px]">
                        {viewType === 'individual' ? (
                            reportData ? (
                                <div className="bg-slate-200/50 p-6 md:p-12 rounded-[2rem] border-2 border-dashed border-indigo-100 flex justify-center overflow-x-auto shadow-inner">
                                    <div className="shadow-2xl bg-white ring-1 ring-slate-200 transition-transform hover:scale-[1.005]">
                                        <CustomTcPrint ref={individualPrintRef} data={reportData} />
                                    </div>
                                </div>
                            ) : (
                                <Card className="p-20 border-dashed text-center flex flex-col items-center justify-center rounded-3xl bg-slate-50/50">
                                    <FileText className="w-16 h-16 text-slate-300 mb-4" />
                                    <h3 className="text-xl font-bold text-slate-600">No Student Selected</h3>
                                    <p className="text-slate-400 max-w-sm mx-auto">Please search and select a specific student to see their individual Transfer Certificate.</p>
                                </Card>
                            )
                        ) : (
                            <div className="space-y-6">
                                <CustomTcResultsTable data={summaryList} onPrint={() => handlePrintList()} />
                                <div className="hidden">
                                    <CustomTcListPrint ref={listPrintRef} data={summaryList} academicYear={selectedYear} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tcReportMutation.isPending && (
                <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-50 flex items-center justify-center">
                    <Card className="p-8 rounded-3xl shadow-2xl flex flex-col items-center border-none animate-in zoom-in-95">
                        <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mb-4" />
                        <h4 className="font-black text-xl text-slate-800">Compiling Report</h4>
                        <p className="text-slate-500 font-medium italic">Please wait while we verify records...</p>
                    </Card>
                </div>
            )}
        </div>
    );
}
