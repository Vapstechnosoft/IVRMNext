'use client';

import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { FilterForm } from './_components/filter-form';
import { CharacterCertificatePrint } from './_components/character-certificate-print';
import { useStjCharacterCertificate } from '@/hooks/admission/preadmission/reports/useStjCharacterCertificate';
import { Button } from '@/components/ui/button';
import { Printer, Loader2 } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';

export default function StjCharacterCertificatePage() {
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const { studDetailsMutation } = useStjCharacterCertificate();

    const handleReport = async (formData: any) => {
        try {
            toast.loading('Generating Character Certificate...', { id: 'character-report' });
            console.info('🚀 [CLIENT] handleReport initiated');

            const classId = formData.allorindi === 'A' ? 0 : (formData.ASMCL_Id || 0);
            const sectionId = formData.allorindi === 'A' ? 0 : (formData.ASMS_Id || 0);

            const payload = {
                ASMAY_Id: formData.ASMAY_Id,
                ASMCL_Id: classId,
                ASMC_Id: sectionId,
                AMST_Id: formData.AMST_Id,
            };

            console.info('🚀 [CLIENT] Ready to call mutateAsync with payload:', payload);
            const response = await studDetailsMutation.mutateAsync(payload) as any;
            console.info('🚀 [CLIENT] mutateAsync RESPONSE:', response);
            const data = response.data?.data || response.data;

            if (data && data.studentList && data.studentList.length > 0) {
                const student = data.studentList[0];

                const mappedData = {
                    studentname: student.studentnam,
                    className: student.class,
                    AMST_RegistrationNo: student.AMST_RegistrationNo,
                    dob: student.dob,
                    admdate: student.admdate,
                    admitedclass: student.admitedclass,
                    SPCCMH_HouseName: student.SPCCMH_HouseName,
                    
                    // From form data
                    Posts: formData.Posts,
                    Principal: formData.Principal,
                    Year: formData.Year,
                    Final: formData.Final,
                    Year1: formData.Year1,
                    Final1: formData.Final1,
                    staticActivities: formData.staticActivities,
                    activities: formData.activities,
                    House: formData.House,
                    School: formData.School,
                };

                setReportData(mappedData);
                setShowReport(true);
                toast.success('Report generated successfully', { id: 'character-report' });
            } else {
                toast.error('Record not found', { id: 'character-report' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('Report generation error:', error);
            toast.error('Failed to generate report', { id: 'character-report' });
        }
    };

    const handleReset = () => {
        setReportData(null);
        setShowReport(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Character_Certificate_${reportData?.studentname || 'Student'}`,
    });

    return (
        <div className="container mx-auto p-4 space-y-6">
            <CollapsibleSection
                title="Character Certificate"
                description="Generate and print Character Certificates for St. James School"
                defaultOpen={true}
            >
                <div className="bg-white p-6">
                    <FilterForm onSubmit={handleReport} onReset={handleReset} />
                </div>
            </CollapsibleSection>

            {studDetailsMutation.isPending && (
                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Generating certificate preview...</p>
                </div>
            )}

            {showReport && reportData && (
                <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex justify-end gap-4 p-4 bg-slate-50 border rounded-lg">
                        <Button onClick={() => handlePrint()} className="bg-indigo-600 hover:bg-indigo-700">
                            <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
                    </div>

                    <div className="bg-slate-100 p-8 rounded-xl border-2 border-dashed border-slate-300 flex justify-center overflow-x-auto">
                        <div className="shadow-2xl bg-white origin-top">
                            <CharacterCertificatePrint
                                ref={printRef}
                                data={reportData}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
