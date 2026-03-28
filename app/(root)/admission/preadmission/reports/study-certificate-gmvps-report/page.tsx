'use client';

import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { FilterForm } from './_components/filter-form';
import { StudyCertificateGMVPSPrint } from './_components/study-certificate-gmvps-print';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Printer, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { useStudyCertificateDetails, useStudyCertificateConductDetails, useStudyCertificateQRMutation, useStudyCertificateLoadData } from '@/hooks/admission/preadmission/useReports';

export default function StudyCertificateGMVPSPage() {
    const [filterData, setFilterData] = useState<any>(null);
    const [reportResult, setReportResult] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const printRef = useRef<HTMLDivElement>(null);

    const { data: loadData } = useStudyCertificateLoadData();
    const isMIId6 = (loadData as any)?.data?.masterCompany?.[0]?.mI_Id === 6;

    const qrMutation = useStudyCertificateQRMutation();

    const fetchStudyDetails = useStudyCertificateDetails(
        {
            ASMAY_Id: filterData?.asmaY_Id,
            ASMCL_Id: filterData?.allorindid === 'A' ? 0 : filterData?.asmcL_Id,
            ASMC_Id: filterData?.allorindid === 'A' ? 0 : filterData?.asmS_Id,
            AMST_Id: filterData?.amst_Id,
        },
        false
    );

    const fetchCharacterDetails = useStudyCertificateConductDetails(
        {
            ASMAY_Id: filterData?.asmaY_Id,
            ASMCL_Id: filterData?.allorindid === 'A' ? 0 : filterData?.asmcL_Id,
            ASMC_Id: filterData?.allorindid === 'A' ? 0 : filterData?.asmS_Id,
            AMST_Id: filterData?.amst_Id,
        },
        false
    );

    const handleReport = async (data: any) => {
        setFilterData(data);
        setIsGenerating(true);
        setReportResult(null);

        try {
            const fetcher = data.certificateType === '0' ? fetchStudyDetails : fetchCharacterDetails;
            const result = await fetcher.refetch();

            if (result.data?.data) {
                const finalData = result.data.data;
                // Parity check for common backend response structures
                const studentList = finalData.studentList || finalData.fillstudlist || (Array.isArray(finalData) ? finalData : []);
                
                if (studentList.length === 0) {
                    toast.error('No records found for the selected criteria');
                } else {
                    setReportResult({ ...finalData, studentList });
                }
            } else {
                toast.error('Failed to fetch report data');
            }
        } catch (error) {
            console.error('Report generation error:', error);
            toast.error('An error occurred while generating the report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Study_Certificate_${new Date().getTime()}`,
    });

    const handleGenerateQRCode = async () => {
        if (!reportResult || !reportResult.studentList || !filterData) return;

        let successCount = 0;
        let failCount = 0;

        try {
            for (const student of reportResult.studentList) {
                const studentName = student.studentnam?.trim() || '';
                const amstId = student.amsT_Id || student.AMST_Id;
                const asmayId = filterData.asmaY_Id;
                
                const htmlTemplate = `
                    <html>
                        <body>
                            <h1>Study Certificate</h1>
                            <p>This is to certify that <b>${studentName}</b> is a bonafide student of <b>${student.class}</b> 
                            for the academic year <b>${student.acadamicyear}</b>.</p>
                            <p>Father's Name: ${student.fatherName || student.fathername}</p>
                            <p>Admission No: ${student.admNo || student.admno}</p>
                        </body>
                    </html>
                `.replace(/\s+/g, ' ').trim();

                const payload = {
                    ASMAY_Id: asmayId.toString(),
                    ASMCL_Id: filterData.asmcL_Id || 0,
                    ASMC_Id: filterData.asmS_Id || 0,
                    AMST_Id: amstId,
                    AllOrInd: filterData.allorindid || 'I',
                    AMST_SOL: filterData.amst_SOL || 'S',
                    ASCISS_CertificateFlg: 'SC',
                    ASCISS_CertificateNo: `SC${asmayId}${amstId}`,
                    ASCISS_HtmlTemplate: htmlTemplate,
                    ASCISS_PDFFileName: `Study_Certificate_${studentName.replace(/\s+/g, '_')}_${amstId}.pdf`
                };

                try {
                    const response = await qrMutation.mutateAsync(payload);
                    const message = response.data?.message || 'Process completed';
                    
                    if (response.data?.success) {
                        if (response.data?.qrCodePath) {
                            student.qrCode = response.data.qrCodePath;
                        }
                        successCount++;
                    } else if (message.toLowerCase().includes('saved successfully')) {
                        // Backend sent success: false but message: "Saved Successfully"
                        successCount++;
                    } else {
                        console.warn(`QR generation warning for student ${amstId}:`, message);
                        failCount++;
                    }
                } catch (err) {
                    console.error(`Failed to generate QR for student ${amstId}:`, err);
                    failCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`QR Code generation: ${successCount} successful${failCount > 0 ? `, ${failCount} failed` : ''}`);
                setReportResult({ ...reportResult }); // Refresh to show QR codes
            } else if (failCount > 0) {
                toast.error('Failed to generate QR Codes');
            }
        } catch (error) {
            console.error('QR Generation outer error:', error);
            toast.error('An error occurred during QR generation');
        }
    };

    const handleReset = () => {
        setFilterData(null);
        setReportResult(null);
    };

    return (
        <div className="p-6 space-y-6">
            <Card className="shadow-lg border-t-4 border-t-primary">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                        Study Certificate Report (GMVPS)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <FilterForm onSubmit={handleReport} onReset={handleReset} isMIId6={isMIId6} />
                </CardContent>
            </Card>

            {isGenerating && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-white/50 rounded-lg border border-dashed">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse font-medium">Generating Report...</p>
                </div>
            )}

            {reportResult && (
                <Card className="shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <CardTitle className="text-xl">Report Preview</CardTitle>
                        <div className="flex gap-4">
                            <Button
                                onClick={handleGenerateQRCode}
                                variant="outline"
                                className="border-blue-500 text-blue-500 hover:bg-blue-50"
                                disabled={qrMutation.isPending}
                            >
                                {qrMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <QrCode className="mr-2 h-4 w-4" />
                                )}
                                Generate QR Code
                            </Button>
                            <Button onClick={() => handlePrint()} className="bg-green-600 hover:bg-green-700 text-white">
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 bg-slate-100 min-h-[500px] overflow-auto">
                        <div className="bg-white shadow-inner mx-auto max-w-[210mm] border">
                            <StudyCertificateGMVPSPrint
                                ref={printRef}
                                data={reportResult}
                                certificateType={filterData.certificateType === '0' ? 'study' : 'character'}
                                selectedDate={filterData.selectedDate}
                                addressType={filterData.addressType}
                                parentType={filterData.parentType}
                                qrCode={reportResult.studentList?.[0]?.qrCode} // Placeholder, will show for all if needed
                            />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
