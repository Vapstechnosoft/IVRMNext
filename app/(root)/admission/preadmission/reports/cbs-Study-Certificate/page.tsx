'use client';

import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { FilterForm } from './_components/filter-form';
import { CbsCertificatePrint } from './_components/cbs-certificate-print';
import { useCbsStudyCertLoadData, useCbsStudyCertDetails, useCbsCharacterCertDetails, useSaveCbsStudyCertQRCode } from '@/hooks/admission/preadmission/reports/useCbsStudyCertificate';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, FileText } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Card, CardContent } from '@/components/ui/card';

export default function CbsStudyCertificatePage() {
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const [certMode, setCertMode] = useState<'0' | '1'>('0');
    const printRef = useRef<HTMLDivElement>(null);

    // Initial data loading
    const { data: initialData, isLoading: isLoadLoading } = useCbsStudyCertLoadData(1);
    const studyDetailsMutation = useCbsStudyCertDetails();
    const characterDetailsMutation = useCbsCharacterCertDetails();
    const saveQRMutation = useSaveCbsStudyCertQRCode();

    const handleReport = async (formData: any) => {
        try {
            setCertMode(formData.character as '0' | '1');
            toast.loading('Generating certificate data...', { id: 'cbs-study-cert' });

            const payload = {
                ASMAY_Id: formData.asmaY_Id,
                ASMCL_Id: formData.allorindi === 'A' ? 0 : (formData.asmcL_Id || 0),
                ASMC_Id: formData.allorindi === 'A' ? 0 : (formData.asmS_Id || 0),
                AMST_Id: formData.amsT_Id,
                ASCISS_CertificateFlg: formData.character === '1' ? 'CC' : 'SC' // CC for Character, SC for Study (or as per backend)
            };

            let response;
            if (formData.character === '1') {
                response = await characterDetailsMutation.mutateAsync(payload);
            } else {
                response = await studyDetailsMutation.mutateAsync(payload);
            }

            const data = response.data;

            if (data && data.studentlist && data.studentlist.length > 0) {
                const student = data.studentlist[0];
                const masterCompany = data.masterCompany?.[0] || {};
                
                // Gender label logic from legacy
                let genderLabel = "Kumar";
                if (student.AMST_Sex === "FEMALE" || student.AMST_Sex === "Female") {
                    genderLabel = "Kumari";
                }

                // Parent name logic based on radio selection
                let parentNameText = student.fatherName;
                if (formData.paretsnamefather === "1") {
                    parentNameText = student.mothername;
                } else if (formData.paretsnamefather === "2") {
                    parentNameText = `${student.fatherName} and ${student.mothername}`;
                }

                // Address mapping based on radio selection
                let addressData = {
                    street: student.street,
                    area: student.area,
                    city: student.city
                };
                if (formData.address_opt === 'address_con') {
                    addressData = {
                        street: student.constreet || student.street,
                        area: student.conarea || student.area,
                        city: student.concity || student.city
                    };
                }

                const mappedData = {
                    studentname: student.studentnam || student.amsT_FirstName,
                    fathername: student.fatherName || student.amsT_FatherName,
                    mothername: student.mothername || student.amsT_MotherName,
                    genderLabel: student.AMST_Sex === "FEMALE" || student.AMST_Sex === "Female" ? "Miss" : "Master",
                    className: student.class,
                    section: student.section,
                    admno: student.admno || student.amsT_AdmNo,
                    rollNo: student.rollNo,
                    date: formData.date,
                    boardType: formData.boardType,
                    charType: formData.charType,
                    milogo: masterCompany.milogo || "https://calcuttaboy.blob.core.windows.net/files/Logo_Main_Campus.jpg",
                    acadamicyear: student.acadamicyear,
                    dob: student.dob,
                    dobinwords: student.dobwords,
                    admitedyear: student.admitedyear,
                    admitedclass: student.admitedclass,
                    ...addressData
                };

                setReportData(mappedData);
                setShowReport(true);
                toast.success('Certificate data loaded', { id: 'cbs-study-cert' });
            } else {
                toast.error('No student record found', { id: 'cbs-study-cert' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('Report error:', error);
            toast.error('Failed to load certificate details', { id: 'cbs-study-cert' });
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `CBS_${certMode === '1' ? 'Character' : 'Study'}_${reportData?.studentname || 'Cert'}`,
    });

    if (isLoadLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 font-medium">Loading form options...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <CollapsibleSection
                title="Study & Character Certificate"
                description="Generate institutional certificates for current and past students"
                defaultOpen={true}
            >
                <Card className="border-none shadow-none">
                    <CardContent className="pt-6">
                        <FilterForm 
                            initialData={initialData?.data || initialData} 
                            onSubmit={handleReport} 
                            onReset={() => { setReportData(null); setShowReport(false); }} 
                        />
                    </CardContent>
                </Card>
            </CollapsibleSection>

            {(studyDetailsMutation.isPending || characterDetailsMutation.isPending) && (
                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse font-medium">Preparing certificate preview...</p>
                </div>
            )}

            {showReport && reportData && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center p-4 bg-slate-50 border rounded-lg sticky top-0 z-10 shadow-sm">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-lg text-slate-700">
                                {certMode === '1' ? 'Character' : 'Study'} Certificate Preview
                            </h3>
                        </div>
                        <Button 
                            onClick={() => handlePrint()} 
                            className="bg-primary hover:bg-primary/90 transition-all active:scale-95"
                        >
                            <Printer className="mr-2 h-4 w-4" /> Print Document
                        </Button>
                    </div>

                    <div className="bg-slate-200 p-4 md:p-8 rounded-xl border-2 border-dashed border-slate-300 flex justify-center overflow-x-auto">
                        <div className="shadow-2xl bg-white origin-top mb-12">
                            <CbsCertificatePrint
                                ref={printRef}
                                data={reportData}
                                mode={certMode}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
