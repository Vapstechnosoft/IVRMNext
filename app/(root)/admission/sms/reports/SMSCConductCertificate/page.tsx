'use client';

import { useState, useRef } from 'react';
import { FilterForm } from './_components/filter-form';
import { PrintComponent } from './_components/print-component';
import { useSMSCConductCertReport } from '@/hooks/admission/sms/reports/useSMSCConductCertificate';
import { Button } from '@/components/ui/button';
import { Printer, ChevronDown } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function SMSCConductCertificatePage() {
    const reportMutation = useSMSCConductCertReport();
    const [reportData, setReportData] = useState<any>(null);
    const [certType, setCertType] = useState<'0' | '1'>('1');
    const [logo, setLogo] = useState<string>('');
    const [extraFields, setExtraFields] = useState<any>({});
    const [isFormOpen, setIsFormOpen] = useState(true);

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Certificate_${new Date().getTime()}`,
    });

    const onFilterSubmit = (data: any) => {
        setCertType(data.Character);
        setExtraFields({
            exmname: data.exmname,
            exmmonth: data.exmmonth,
            stdreg: data.stdreg,
        });

        reportMutation.mutate({
            ASMAY_Id: data.asmaY_Id,
            AMCST_SOL: data.optradio,
            AMCO_Id: data.allorindi === 'A' ? 0 : (data.amcO_Id || 0),
            AMB_Id: data.allorindi === 'A' ? 0 : (data.amB_Id || 0),
            AMSE_Id: data.allorindi === 'A' ? 0 : (data.amsE_Id || 0),
            ACMS_Id: data.allorindi === 'A' ? 0 : (data.acmS_Id || 0),
            AMCST_Id: data.amcsT_Id,
            allorindid: data.allorindi,
        }, {
            onSuccess: (res: any) => {
                const details = res.data?.data?.getstudentdetailslist;
                if (details && details.length > 0) {
                    setReportData(details);
                    setLogo(res.data?.data?.logo || '');
                    setIsFormOpen(false); // Collapse form after success
                    toast.success('Report generated successfully!');
                } else {
                    toast.error('No record found for selected criteria');
                }
            },
            onError: () => {
                toast.error('Failed to generate report. Please try again.');
            }
        });
    };

    const handleReset = () => {
        setReportData(null);
        setIsFormOpen(true);
    };

    return (
        <div className="flex flex-col gap-8 p-6 lg:p-10 bg-slate-50 min-h-screen animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                        SMS College Certificates
                    </h1>
                    <p className="text-slate-500 font-medium italic">
                        Generate and print Study or Conduct certificates for college students.
                    </p>
                </div>
                {reportData && (
                    <Button
                        onClick={handlePrint}
                        className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold shadow-xl shadow-slate-200 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                    >
                        <Printer className="h-5 w-5" />
                        Print Certificate
                    </Button>
                )}
            </div>

            {/* Filter Section */}
            <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen} className="w-full">
                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-md">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-white/0 border-b border-slate-100 flex flex-row items-center justify-between py-6">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Search Criteria</CardTitle>
                            <CardDescription className="text-xs font-semibold uppercase tracking-widest text-slate-400">Filtering & Generation</CardDescription>
                        </div>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 transition-all transform active:scale-90">
                                <ChevronDown className={`h-5 w-5 transition-transform duration-500 ${isFormOpen ? 'rotate-180' : ''}`} />
                            </Button>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="p-8 lg:p-12">
                            <FilterForm onSubmit={onFilterSubmit} onReset={handleReset} />
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Preview Section */}
            {reportData && (
                <div className="animate-in slide-in-from-bottom-10 duration-1000">
                    <div className="flex items-center gap-4 mb-6 px-4">
                        <div className="w-2 h-8 bg-blue-600 rounded-full" />
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Live Preview</h2>
                        <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                            CLICK TEXT TO EDIT BEFORE PRINTING
                        </div>
                    </div>
                    <PrintComponent
                        ref={printRef}
                        data={reportData}
                        certType={certType}
                        logo={logo}
                        extraFields={extraFields}
                    />
                </div>
            )}
        </div>
    );
}
