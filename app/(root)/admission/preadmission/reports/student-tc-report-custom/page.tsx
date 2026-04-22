'use client';

import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { FilterForm } from './_components/filter-form';
import { StudentTcPrint } from './_components/student-tc-print';
import { 
    useStudentTcInitialData, 
    useStudentTcDetails 
} from '@/hooks/admission/preadmission/reports/useStudentTcReportCustom';
import { type StudentTcReportCustomFields } from '@/schemas/admission/preadmission/reports/student-tc-report-custom.schema';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, RotateCcw } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudentTcReportCustomPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const { data: initialData, isLoading: isInitialLoading } = useStudentTcInitialData();
    const detailsMutation = useStudentTcDetails();

    const switchFunction = (sno: string | undefined | null) => {
        if (!sno) return "";
        const val = sno.toString().toUpperCase();
        switch (val) {
            case 'I': return "FIRST";
            case 'II': return "SECOND";
            case 'III': return "THIRD";
            case 'IV': return "FOURTH";
            case 'V': return "FIFTH";
            case 'VI': return "SIXTH";
            case 'VII': return "SEVENTH";
            case 'VIII': return "EIGHTH";
            case 'IX': return "NINTH";
            case 'X': return "TENTH";
            default: return sno.toUpperCase();
        }
    };

    const getMonthNames = (monthId: number) => {
        const months = [
            "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
            "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
        ];
        return months[monthId];
    };

    const handleReport = async (formData: StudentTcReportCustomFields) => {
        try {
            toast.loading('Fetching Student TC Details...', { id: 'tc-report' });
            
            const payload = {
                ASMAY_Id: parseInt(formData.asmaY_Id),
                AMST_Id: formData.AMST_Id.amsT_Id || formData.AMST_Id.amst_id
            };

            const response = await detailsMutation.mutateAsync(payload);
            const data = response.data || response;

            if (!data || !data.studentTCList || data.studentTCList.length === 0) {
                toast.error('Student TC details not available for this selection', { id: 'tc-report' });
                return;
            }

            const student = data.studentTCList[0];
            const company = data.masterCompany?.[0] || {};
            const miid = parseInt(company.miid || company.mI_Id || 0);

            const academicInfo = data.academicList1?.[0] || {};
            const dateFrom = academicInfo.asmaY_From_Date ? new Date(academicInfo.asmaY_From_Date) : new Date();
            const dateTo = academicInfo.asmaY_To_Date ? new Date(academicInfo.asmaY_To_Date) : new Date();

            // Additional transformation based on JSON structure
            const studentFullName = student.studentname || 
                `${student.amsT_FirstName || student.amst_firstname || ''} ${student.amsT_MiddleName || student.amst_middlename || ''} ${student.amsT_LastName || student.amst_lastname || ''}`.trim();
            
            const lastClass = student.last_class_studied || student.last_Class_Studied || student.classname;

            const transformedData = {
                ...data,
                studentFullName,
                frommonth1: getMonthNames(dateFrom.getMonth()),
                tomonth1: lastClass === 'X' ? 'MAY' : getMonthNames(dateTo.getMonth()),
                fromyear: dateFrom.getFullYear(),
                toyear: dateTo.getFullYear(),
                getdate: new Date(),
                stuschoolname: formData.pervious || student.stuschoolname || '---',
                joinclass: initialData?.fillclass?.find((c: any) => c.asmcL_Id.toString() === formData.ASMCL_Id1)?.asmcL_ClassName || student.joinclass || student.classjoinname || '---',
                qualificlass: student.qualificlass || '---',
                nextclass: student.qualificlass ? `${switchFunction(student.qualificlass)}` : '---',
                stuDobwords: student.amst_dob_words || student.amsT_DOB_Words || '---',
                promotiontype: formData.prom || student.astc_qual_promotionflag || '---',
                studcastecategory: (student.castecat || student.castecategory) === 'SC' || (student.castecat || student.castecategory) === 'ST' ? 'YES' : 'NO'
            };

            setReportData(transformedData);
            setShowReport(true);
            toast.success('Report generated successfully', { id: 'tc-report' });
        } catch (error) {
            console.error('Report generating error:', error);
            toast.error('Failed to generate report', { id: 'tc-report' });
        }
    };

    const handleReset = () => {
        setReportData(null);
        setShowReport(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `TC_Report_${reportData?.studentFullName || 'Student'}`,
    });

    if (isInitialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-7xl animate-in fade-in duration-700">
            <CollapsibleSection
                title="Student TC Report Custom"
                description="Generate custom school transfer certificates with institutional templates"
                defaultOpen={true}
                className="shadow-xl rounded-2xl border-indigo-100 overflow-hidden bg-white/80 backdrop-blur-sm"
            >
                <div className="p-4 pt-2">
                    <FilterForm 
                        initialData={initialData} 
                        onSubmit={handleReport} 
                        onReset={handleReset} 
                    />
                </div>
            </CollapsibleSection>

            {showReport && reportData && (
                <Card className="shadow-2xl animate-in slide-in-from-bottom-8 duration-700 overflow-hidden border-indigo-50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-slate-50 to-indigo-50/30 py-5 px-8">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold flex items-center gap-3 text-slate-800">
                                <Printer className="w-6 h-6 text-indigo-600" />
                                Report Preview
                            </CardTitle>
                            <p className="text-sm text-slate-500 font-medium italic">Verify the details below before printing</p>
                        </div>
                        <div className="flex gap-4">
                            <Button 
                                variant="outline" 
                                size="lg" 
                                onClick={handleReset} 
                                className="text-slate-600 hover:bg-slate-100 border-slate-200 shadow-sm font-semibold h-11"
                            >
                                <RotateCcw className="mr-2 h-5 w-5" /> Reset
                            </Button>
                            <Button 
                                size="lg"
                                onClick={() => handlePrint()} 
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg active:scale-95 transition-all font-bold h-11 px-8"
                            >
                                <Printer className="mr-2 h-5 w-5" /> Print Certificate
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 bg-slate-200/50 overflow-auto max-h-[1200px] flex justify-center py-16 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                        <div className="bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 origin-top mb-12 hover:shadow-[0_45px_70px_-10px_rgba(79,70,229,0.2)]">
                            <StudentTcPrint ref={printRef} data={reportData} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {detailsMutation.isPending && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center animate-in fade-in duration-300">
                    <Card className="w-80 p-8 text-center animate-in zoom-in-95 shadow-3xl border-none rounded-3xl">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
                            <Loader2 className="h-20 w-20 animate-spin text-indigo-600 relative z-10" />
                        </div>
                        <h4 className="text-2xl font-black text-slate-800 tracking-tight">Processing</h4>
                        <p className="text-slate-500 font-medium mt-2">Compiling certificate data...</p>
                    </Card>
                </div>
            )}
        </div>
    );
}
