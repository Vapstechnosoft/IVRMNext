'use client';

import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { FilterForm } from './_components/filter-form';
import { TcPrint } from './_components/tc-print';
import { useCbsTcReport, useCbsTcSave } from '@/hooks/admission/preadmission/useCbsStudentTc';
import { type CbsStudentTcFields } from '@/schemas/admission/preadmission/reports/cbs-student-tc.schema';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, RotateCcw, Download } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Card, CardContent } from '@/components/ui/card';

export default function CbsStudentTcPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const tcReportMutation = useCbsTcReport();
    const tcSaveMutation = useCbsTcSave();

    const switchFunction = (sno: string) => {
        switch (sno?.toString().toUpperCase()) {
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
            case 'XI': return "Eleventh";
            case 'NURSERY': return "Nursery";
            case 'TRANSITION': return "Transition";
            default: return sno || "";
        }
    };

    const getMonthNames = (monthId: number) => {
        const months = [
            "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
            "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
        ];
        return months[monthId] || "";
    };

    const handleReport = async (formData: CbsStudentTcFields) => {
        try {
            if (!formData.amsT_Id) {
                toast.error('Please select a student');
                return;
            }

            toast.loading('Generating CBS Student Transfer Certificate...', { id: 'cbs-tc' });
            
            const payload = {
                ASMAY_Id: Number(formData.asmaY_Id),
                AMST_Id: formData.amsT_Id.amsT_Id,
                tctemporper: formData.temporper,
                ASMCL_Id: Number(formData.asmcL_Id) || 0,
                ASMS_Id: Number(formData.asmS_Id) || 0,
                ASCISS_CertificateFlg: "TC"
            };
            const response = await tcReportMutation.mutateAsync(payload) as any;
            const data = response?.data || response;
            
            const studentTCList = data.studentTCList?.$values || data.studentTCList || [];
            
            if (!data || studentTCList.length === 0) {
                toast.error('Failed to fetch certificate data or no records found', { id: 'cbs-tc' });
                return;
            }

            const tcData = studentTCList[0];
            
            // Porting legacy mapping logic
            const dateFrom = data.academicList1?.[0]?.asmaY_From_Date ? new Date(data.academicList1[0].asmaY_From_Date) : null;
            const dateTo = data.academicList1?.[0]?.asmaY_To_Date ? new Date(data.academicList1[0].asmaY_To_Date) : null;
            
            const fromMonth = dateFrom ? getMonthNames(dateFrom.getMonth()) : "";
            const toMonth = dateTo ? getMonthNames(dateTo.getMonth()) : "";
            const fromYear = dateFrom ? dateFrom.getFullYear() : "";
            const toYear = dateTo ? dateTo.getFullYear() : "";

            const lastStudiedWord = switchFunction(tcData.Last_Class_Studied || tcData.last_class_studied);

            const mappedData = {
                ...tcData,
                imgname: tcData.logo || data.logo || "", 
                tcno: tcData.astC_TCNO || tcData.astc_tcno || "",
                admno: tcData.amsT_RegistrationNo || tcData.amst_registrationno || "",
                lblstdname: tcData.studentname || "",
                lblfathername: tcData.amsT_FatherName || tcData.amst_fathername || "",
                // Legacy: if Sex = Male -> Master. else Mrs.
                abbrivation: (tcData.amsT_Sex === "Male" || tcData.amst_sex === "Male") ? "Master. " : "Mrs. ",
                lbldob: tcData.amsT_DOB || tcData.amst_dob,
                lbldobwords: tcData.amsT_DOB_Words || tcData.amst_dob_words || "",
                lbldoa: tcData.amsT_Date || tcData.amst_date,
                leftdate: tcData.leftdate || tcData.astC_TCIssueDate,
                lblconduct: tcData.astC_Conduct || tcData.astc_conduct || "GOOD",
                laststudied: tcData.Last_Class_Studied || tcData.last_class_studied || "",
                laststudiedinwords: lastStudiedWord,
                asmC_SectionName: tcData.asmC_SectionName || tcData.asmc_sectionname || "",
                Boardtype: formData.Boardtype,
                resulttype: formData.resulttype,
                BSPID: formData.BSPID,
                currentyear: (data.accyear || []).find((y: any) => y.asmaY_Id == formData.asmaY_Id)?.asmaY_Year || "",
                lblschoolbegins: fromMonth && toMonth ? `${fromMonth}-${fromYear} to ${toMonth}-${toYear}` : "",
                astC_TCIssueDate: tcData.astC_TCIssueDate || tcData.astc_tcissuedate,
                ASCISS_QRCode: data.ascisS_QRCode || data.asciss_qrcode || ""
            };

            setReportData(mappedData);
            setShowReport(true);
            toast.success('Certificate generated successfully', { id: 'cbs-tc' });

            // Auto-save logic as per legacy
            handleSave(mappedData, formData);


        } catch (error) {
            console.error('CBS TC Generation Error:', error);
            toast.error('Failed to generate certificate', { id: 'cbs-tc' });
        }
    };

    const handleSave = async (data: any, formData: CbsStudentTcFields) => {
        try {
            const savePayload = {
                ASMAY_Id: Number(formData.asmaY_Id),
                ASMCL_Id: Number(formData.asmcL_Id) || 0,
                ASMC_Id: Number(formData.asmS_Id) || 0,
                AMST_Id: formData.amsT_Id.amsT_Id,
                ASCISS_HtmlTemplate: printRef.current?.innerHTML || "", 
                ASCISS_CertificateFlg: "TC",
                ASCISS_QRCode: data.ASCISS_QRCode
            };
            
            await tcSaveMutation.mutateAsync(savePayload);
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    };

    const handleReset = () => {
        setReportData(null);
        setShowReport(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `CBS_TC_${reportData?.lblstdname || 'Student'}`,
    });

    return (
        <div className="container mx-auto p-4 space-y-6">
            <CollapsibleSection
                title="CBS Student TC Report"
                description="Search and generate Transfer Certificate"
                defaultOpen={true}
                className="shadow-md"
            >
                <div className="p-4 bg-white rounded-lg">
                    <FilterForm onSubmit={handleReport} onReset={handleReset} />
                </div>
            </CollapsibleSection>

            {showReport && reportData && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                    <Card className="border-none shadow-lg bg-indigo-50/50">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md">
                                        <Printer className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">{reportData.lblstdname}</h3>
                                        <p className="text-sm text-slate-500">SCHOLAR NO: {reportData.admno} | CLASS: {reportData.laststudied}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button 
                                        onClick={() => handlePrint()} 
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                    >
                                        <Printer className="mr-2 h-4 w-4" /> PRINT TC
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={handleReset} 
                                        className="border-slate-200 text-slate-600"
                                    >
                                        <RotateCcw className="mr-2 h-4 w-4" /> RESET
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-center bg-slate-100 p-8 rounded-xl border-2 border-dashed border-slate-300 overflow-x-auto min-h-[600px]">
                        <div className="shadow-2xl">
                            <TcPrint ref={printRef} data={reportData} />
                        </div>
                    </div>
                </div>
            )}

            {tcReportMutation.isPending && (
                <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-50 flex items-center justify-center">
                    <Card className="w-64 p-6 text-center animate-in zoom-in-95 shadow-2xl">
                        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-slate-800">Generating Report</h4>
                        <p className="text-sm text-slate-500">Please wait...</p>
                    </Card>
                </div>
            )}
        </div>
    );
}
