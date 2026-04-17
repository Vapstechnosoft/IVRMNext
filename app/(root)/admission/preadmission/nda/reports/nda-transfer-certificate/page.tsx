'use client';

import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { FilterForm } from './_components/FilterForm';
import { NdaTcPrint } from './_components/NdaTcPrint';
import { useNdaTcReportDetails } from '@/hooks/admission/preadmission/useNdaTransferCertificate';
import { type NdaTcFields } from '@/schemas/admission/preadmission/reports/nda-transfer-certificate';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, RotateCcw, Download } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Card, CardContent } from '@/components/ui/card';

export default function NdaTransferCertificatePage() {
    const [reportData, setReportData] = useState<any>(null);
    const [issuedDate, setIssuedDate] = useState<Date>(new Date());
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const tcReportMutation = useNdaTcReportDetails();

    const handleReport = async (formData: NdaTcFields) => {
        try {
            if (!formData.amsT_Id) {
                toast.error('Please select a student');
                return;
            }

            toast.loading('Generating NDA Transfer Certificate...', { id: 'nda-tc' });
            setIssuedDate(formData.Date11);
            
            const payload = {
                ASMAY_Id: Number(formData.asmaY_Id),
                AMST_Id: formData.amsT_Id?.amsT_Id || (formData.amsT_Id as any),
                tctemporper: formData.tctemporper
            };

            const response = await tcReportMutation.mutateAsync(payload) as any;
            const data = response?.data || response;
            
            if (!data) {
                toast.error('Failed to fetch certificate data', { id: 'nda-tc' });
                return;
            }

            const studentTCList = data.studentTCList;
            
            if (studentTCList && Array.isArray(studentTCList) && studentTCList.length > 0) {
                const tcData = studentTCList[0];
                
                // Merge lists for the print component as per legacy logic
                const mappedData = {
                    ...tcData,
                    studenttcdetails: data.studenttcdetails,
                    academicList1: data.academicList1,
                    masterCompany: data.masterCompany,
                    admno: tcData.amst_admno || tcData.amsT_AdmNo || '',
                    tcno: tcData.astc_tcno || tcData.astC_TCNO || '',
                    lblstdname: tcData.studentname || tcData.lblstdname || '',
                    lblfathername: tcData.amst_fathername || tcData.amsT_FatherName || '',
                    lblmothername: tcData.amst_mothername || tcData.amsT_MotherName || '',
                    lblreligioncaste: tcData.religion || '',
                    studcaste: tcData.caste || '',
                    lblnationality: tcData.nationality || tcData.lblnationality || '',
                    lbldob: tcData.amst_dob || tcData.amsT_DOB || '',
                    lbldoa: tcData.amst_date || tcData.amsT_Date || '',
                    lblconduct: tcData.astc_conduct || tcData.astC_Conduct || '',
                    last_date_attended: tcData.astc_lastattendeddate || tcData.astC_LastAttendedDate || '',
                    Last_Class_Studied: tcData.last_class_studied || tcData.Last_Class_Studied || '',
                    asmC_SectionName: tcData.asmc_sectionname || tcData.asmC_SectionName || '',
                    ASTC_Remarks: tcData.astc_remarks || tcData.astC_Remarks || '',
                    govtno: tcData.govtno || '',
                    AMST_PENNo: tcData.amst_penno || tcData.AMST_PENNo || '',
                    AMST_APAAANO: tcData.amst_apaaano || tcData.AMST_APAAANO || '',
                    lbllastschool: data.masterCompany?.[0]?.companyname || ''
                };

                setReportData(mappedData);
                setShowReport(true);
                toast.success('Certificate generated successfully', { id: 'nda-tc' });
            } else {
                toast.error('No TC records found for this student', { id: 'nda-tc' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('NDA TC Generation Error:', error);
            toast.error('Failed to generate certificate', { id: 'nda-tc' });
        }
    };

    const handleReset = () => {
        setReportData(null);
        setShowReport(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `NDA_TC_${reportData?.lblstdname || 'Student'}`,
    });

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-700">
            <CollapsibleSection
                title="Search Filter"
                description="Select student type and year to generate certificate"
                defaultOpen={true}
                className="shadow-xl border-none rounded-3xl bg-white/60 backdrop-blur-md"
            >
                <div className="p-2">
                    <FilterForm onSubmit={handleReport} onReset={handleReset} />
                </div>
            </CollapsibleSection>

            {showReport && reportData && (
                <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-700 pb-20">
                    <Card className="border-none shadow-2xl rounded-3xl bg-indigo-50/80 backdrop-blur-lg overflow-hidden ring-1 ring-indigo-100">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                        <Printer className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-indigo-950">{reportData.lblstdname}</h3>
                                        <p className="text-indigo-600 font-bold tracking-wider">{reportData.admno} | {reportData.Last_Class_Studied}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                    <Button 
                                        onClick={() => handlePrint()} 
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-12 font-bold shadow-xl shadow-indigo-100 transition-all flex-1 md:flex-none"
                                    >
                                        <Printer className="mr-2 h-5 w-5" /> PRINT TC
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={handleReset} 
                                        className="rounded-full border-indigo-200 text-indigo-700 hover:bg-white h-12 font-bold flex-1 md:flex-none"
                                    >
                                        <RotateCcw className="mr-2 h-5 w-5" /> REFRESH
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="preview-container bg-slate-200/50 p-4 md:p-12 rounded-[2rem] border-2 border-dashed border-slate-300 flex justify-center overflow-x-auto shadow-inner min-h-[800px]">
                        <div className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform hover:scale-[1.01] duration-500">
                            <NdaTcPrint ref={printRef} data={reportData} issuedDate={issuedDate} />
                        </div>
                    </div>
                </div>
            )}

            {tcReportMutation.isPending && (
                <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-50 flex items-center justify-center">
                    <Card className="w-80 rounded-3xl border-none shadow-2xl p-8 text-center animate-in zoom-in-90">
                        <div className="relative mb-6">
                            <Loader2 className="h-20 w-20 animate-spin text-indigo-600 mx-auto" />
                            <Download className="h-8 w-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" />
                        </div>
                        <h4 className="text-xl font-black text-slate-800 mb-2">Generating...</h4>
                        <p className="text-slate-500 font-medium text-sm">Please wait while we compile the official records.</p>
                    </Card>
                </div>
            )}
        </div>
    );
}
