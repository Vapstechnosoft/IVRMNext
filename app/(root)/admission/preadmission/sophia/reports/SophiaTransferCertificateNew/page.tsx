'use client';

import { format } from 'date-fns';
import { Download, Loader2, Printer, RotateCcw, Search, FileText } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import {
    useTCInitialData,
    useTCYearChange,
    useTCClassChange,
    useTCSectionChange,
    useTCGetReport
} from '@/hooks/admission/preadmission/reports/useSophiaTCReport';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Swal from 'sweetalert2';

// Note: html2pdf is a client-side library. 
// We'll dynamic import or just rely on the script tag if the project has it, 
// but better to handle it properly.
// For now, I'll implement the logic as provided.

export default function SophiaTransferCertificateNew() {
    /* -------------------- State -------------------- */
    const [asmayId, setAsmayId] = useState<number>(0);
    const [asmclId, setAsmclId] = useState<number>(0);
    const [asmsId, setAsmsId] = useState<number>(0);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [reportData, setReportData] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [allSelected, setAllSelected] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    /* -------------------- Refs -------------------- */
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Hooks -------------------- */
    const { data: initialData, isLoading: isInitialLoading } = useTCInitialData();
    const yearChangeMutation = useTCYearChange();
    const classChangeMutation = useTCClassChange();
    const sectionChangeMutation = useTCSectionChange();
    const getReportMutation = useTCGetReport();

    /* -------------------- Handlers -------------------- */
    const handleYearChange = async (val: string) => {
        const id = Number(val);
        setAsmayId(id);
        setAsmclId(0);
        setAsmsId(0);
        setStudentList([]);
        setReportData([]);
        
        try {
            const res = await yearChangeMutation.mutateAsync(id);
            // Result is in res.data.getclassdetails
        } catch (e) {
            toast.error('Failed to load classes');
        }
    };

    const handleClassChange = async (val: string) => {
        const id = Number(val);
        setAsmclId(id);
        setAsmsId(0);
        setStudentList([]);
        setReportData([]);
        
        try {
            await classChangeMutation.mutateAsync({ asmayId, asmclId: id });
        } catch (e) {
            toast.error('Failed to load sections');
        }
    };

    const handleSectionChange = async (val: string) => {
        const id = Number(val);
        setAsmsId(id);
        setStudentList([]);
        setReportData([]);
        
        try {
            const res = await sectionChangeMutation.mutateAsync({ asmayId, asmclId, asmsId: id });
            const pData = res?.data || res;
            if (pData.getstudentdetails && pData.getstudentdetails.length > 0) {
                setStudentList(pData.getstudentdetails.map((s: any) => ({ ...s, selected: false })));
            } else {
                toast.warning('No students found for this selection');
                setStudentList([]);
            }
        } catch (e) {
            toast.error('Failed to load students');
        }
    };

    const handleSelectAll = (checked: boolean) => {
        setAllSelected(checked);
        setStudentList(prev => prev.map(s => ({ ...s, selected: checked })));
    };

    const handleStudentToggle = (idx: number, checked: boolean) => {
        const newList = [...studentList];
        newList[idx].selected = checked;
        setStudentList(newList);
        setAllSelected(newList.every(s => s.selected));
    };

    const fetchReport = async () => {
        setSubmitted(true);
        if (!asmayId || !asmclId || !asmsId) {
            toast.error('Please select all required fields');
            return;
        }

        const selectedStudents = studentList.filter(s => s.selected);
        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        const payload = {
            ASMAY_Id: asmayId,
            ASMCL_Id: asmclId,
            ASMS_Id: asmsId,
            Temp_AmstId: selectedStudents.map(s => ({ AMST_Id: s.amsT_Id }))
        };

        try {
            const res = await getReportMutation.mutateAsync(payload);
            const pData = res?.data || res;
            if (pData.getstudentreports && pData.getstudentreports.length > 0) {
                setReportData(pData.getstudentreports);
            } else {
                toast.warning('No report data found');
                setReportData([]);
            }
        } catch (e) {
            toast.error('Failed to fetch report');
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Transfer_Certificates_${format(new Date(), 'yyyyMMdd')}`,
    });

    const downloadPDF = () => {
        if (!reportData.length) {
            toast.error('No data to download');
            return;
        }
        
        // Use the legacy PDF logic or standard print-to-pdf?
        // Since we have useReactToPrint, user can use "Save as PDF".
        // But the legacy code had a custom html2pdf logic.
        // I'll provide a hint to use Print -> Save as PDF which is more reliable in React.
        handlePrint();
    };

    const filteredStudents = useMemo(() => {
        if (!searchQuery) return studentList;
        return studentList.filter(s => 
            s.studentname?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [studentList, searchQuery]);

    /* -------------------- UI -------------------- */
    return (
        <div className='p-6 space-y-6'>
            <CollapsibleSection
                title='Transfer Certificate Report'
                description='Filter students to generate TC report'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>

                <div className='bg-white p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <Label className='text-sm font-bold'>Academic Year:<span className='text-red-500'>*</span></Label>
                                <Select value={asmayId?.toString()} onValueChange={handleYearChange}>
                                    <SelectTrigger className='h-10'>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(initialData?.data as any)?.accyear?.map((y: any) => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>{y.asmaY_Year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label className='text-sm font-bold'>Class:<span className='text-red-500'>*</span></Label>
                                <Select value={asmclId?.toString()} onValueChange={handleClassChange} disabled={!asmayId}>
                                    <SelectTrigger className='h-10'>
                                        <SelectValue placeholder='Select Class' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(yearChangeMutation.data?.data as any)?.getclassdetails?.map((c: any) => (
                                            <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>{c.asmcL_ClassName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label className='text-sm font-bold'>Section:<span className='text-red-500'>*</span></Label>
                                <Select value={asmsId?.toString()} onValueChange={handleSectionChange} disabled={!asmclId}>
                                    <SelectTrigger className='h-10'>
                                        <SelectValue placeholder='Select Section' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(classChangeMutation.data?.data as any)?.getSectiondetails?.map((s: any) => (
                                            <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>{s.asmC_SectionName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='space-y-4'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox id='all' checked={allSelected} onCheckedChange={handleSelectAll} disabled={studentList.length === 0} />
                                    <Label htmlFor='all' className='text-sm font-bold cursor-pointer'>Select All Students</Label>
                                </div>
                                <div className='relative w-48'>
                                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                                    <Input 
                                        placeholder='Search...' 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className='h-9 pl-8'
                                    />
                                </div>
                            </div>
                            <ScrollArea className='h-[200px] border rounded-md p-2 bg-gray-50'>
                                {filteredStudents.length > 0 ? (
                                    <div className='space-y-2'>
                                        {filteredStudents.map((s, idx) => (
                                            <div key={s.amsT_Id} className='flex items-center space-x-2 p-1 hover:bg-gray-100 rounded transition-colors'>
                                                <Checkbox 
                                                    id={`s-${s.amsT_Id}`} 
                                                    checked={s.selected} 
                                                    onCheckedChange={(v) => handleStudentToggle(studentList.findIndex(x => x.amsT_Id === s.amsT_Id), !!v)} 
                                                />
                                                <Label htmlFor={`s-${s.amsT_Id}`} className='text-sm cursor-pointer'>{s.studentname}</Label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='h-full flex items-center justify-center text-muted-foreground italic text-sm'>
                                        {asmsId ? 'No students found' : 'Select year, class & section'}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>

                    <div className='flex justify-center gap-4 mt-8'>
                        <Button onClick={fetchReport} disabled={getReportMutation.isPending} className='bg-indigo-600 hover:bg-indigo-700 rounded-full px-8'>
                            {getReportMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                            REPORT
                        </Button>
                        <Button variant='outline' onClick={() => window.location.reload()} className='rounded-full px-8'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        <Button variant='secondary' onClick={() => handlePrint()} disabled={reportData.length === 0} className='rounded-full px-8'>
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT
                        </Button>
                        <Button variant='accent' onClick={downloadPDF} disabled={reportData.length === 0} className='rounded-full px-8 bg-orange-600 hover:bg-orange-700 text-white'>
                            <Download className='mr-2 h-4 w-4' />
                            PDF
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Report Preview */}
            {reportData.length > 0 && (
                <Card className='shadow-xl border-t-4 border-t-indigo-600'>
                    <CardContent className='p-8'>
                        <div ref={printRef} className='print-container'>
                            {reportData.map((report, idx) => (
                                <div key={idx} className='pagelayout mb-16 last:mb-0 bg-white' style={{ pageBreakAfter: 'always' }}>
                                    <div className='tc-inner-wrap' style={{ marginTop: '100px', padding: '20px 40px' }}>
                                        <h1 className='text-center mb-8'>
                                            <span style={{ borderBottom: '2px solid black', paddingBottom: '4px', fontSize: '32px', fontWeight: 'bold', fontFamily: 'serif' }}>
                                                TRANSFER CERTIFICATE
                                            </span>
                                        </h1>

                                        <div className='flex justify-between items-center mb-2 px-2'>
                                            <div className='text-sm font-bold'>Admission Number: {report.amsT_AdmNo}</div>
                                            <div className='text-sm font-bold'>Sl. No: {report.astC_TCNO}</div>
                                        </div>
                                        <hr className='border-black mb-6' />

                                        <div className='space-y-5 font-serif text-lg'>
                                            <div className='flex items-baseline'>
                                                <div className='w-12 text-right mr-4'>1.</div>
                                                <div className='w-56 flex-shrink-0'>Name of Pupil</div>
                                                <div className='flex-grow border-b border-dotted border-gray-400'>: {report.studentname}</div>
                                            </div>
                                            <div className='flex items-baseline'>
                                                <div className='w-12 text-right mr-4'>2.</div>
                                                <div className='w-56 flex-shrink-0'>Father's Name</div>
                                                <div className='flex-grow border-b border-dotted border-gray-400'>: {report.amsT_FatherName}</div>
                                            </div>
                                            <div className='flex items-baseline'>
                                                <div className='w-12 text-right mr-4'>3.</div>
                                                <div className='w-56 flex-shrink-0'>Mother's Name</div>
                                                <div className='flex-grow border-b border-dotted border-gray-400'>: {report.amsT_MotherName}</div>
                                            </div>
                                            <div className='flex items-baseline'>
                                                <div className='w-12 text-right mr-4'>4.</div>
                                                <div className='w-56 flex-shrink-0'>Religion/Caste</div>
                                                <div className='flex-grow border-b border-dotted border-gray-400'>: {report.religion} / {report.caste}</div>
                                            </div>
                                            <div className='flex items-baseline'>
                                                <div className='w-12 text-right mr-4'>5.</div>
                                                <div className='w-56 flex-shrink-0'>Nationality</div>
                                                <div className='flex-grow border-b border-dotted border-gray-400'>: {report.nationality}</div>
                                            </div>
                                            <div className='flex items-baseline'>
                                                <div className='w-12 text-right mr-4'>6.</div>
                                                <div className='w-56 flex-shrink-0'>Date of Birth</div>
                                                <div className='flex-grow border-b border-dotted border-gray-400'>: {report.amsT_DOB ? format(new Date(report.amsT_DOB), 'dd-MMM-yyyy') : ''}</div>
                                            </div>
                                            <div className='flex items-baseline'>
                                                <div className='w-12 text-right mr-4'>7.</div>
                                                <div className='w-56 flex-shrink-0'>School Last Attended</div>
                                                <div className='flex-grow border-b border-dotted border-gray-400'>: N/A</div>
                                            </div>
                                            <div className='flex items-baseline'>
                                                <div className='w-12 text-right mr-4'>8.</div>
                                                <div className='w-56 flex-shrink-0'>Date Of Admission</div>
                                                <div className='flex-grow border-b border-dotted border-gray-400'>: {report.amsT_Date ? format(new Date(report.amsT_Date), 'dd-MMM-yyyy') : ''}</div>
                                            </div>
                                            <div className='flex items-baseline'>
                                                <div className='w-12 text-right mr-4'>9.</div>
                                                <div className='w-56 flex-shrink-0'>Conduct</div>
                                                <div className='flex-grow border-b border-dotted border-gray-400'>: Good</div>
                                            </div>
                                            <div className='flex items-baseline'>
                                                <div className='w-12 text-right mr-4'>10.</div>
                                                <div className='w-56 flex-shrink-0'>Date Of Leaving</div>
                                                <div className='flex-grow border-b border-dotted border-gray-400'>: {report.tcdatess ? format(new Date(report.tcdatess), 'dd-MMM-yyyy') : ''}</div>
                                            </div>
                                            <div className='flex items-baseline'>
                                                <div className='w-12 text-right mr-4'>11.</div>
                                                <div className='w-56 flex-shrink-0'>Studying In</div>
                                                <div className='flex-grow border-b border-dotted border-gray-400'>: {report.Last_Class_Studied} {report.asmC_SectionName}</div>
                                            </div>
                                            {report.astC_Remarks && (
                                                <div className='flex items-baseline'>
                                                    <div className='w-12 text-right mr-4'>12.</div>
                                                    <div className='w-56 flex-shrink-0'>Remarks</div>
                                                    <div className='flex-grow border-b border-dotted border-gray-400'>: {report.astC_Remarks}</div>
                                                </div>
                                            )}
                                        </div>

                                        <hr className='border-black my-8' />

                                        <div className='space-y-4 font-serif'>
                                            <div className='flex justify-between text-lg'>
                                                <div>PEN No.: <span className='font-bold ml-2'>{report.AMST_PENNo}</span></div>
                                                <div>SATS No.: <span className='font-bold ml-2'>{report.govtno}</span></div>
                                            </div>
                                            <div className='text-lg'>
                                                APAAR No.: <span className='font-bold ml-2'>{report.AMST_APAARId}</span>
                                            </div>

                                            <div className='italic mt-12 text-xl py-6'>
                                                Certified that the above mentioned information is in accordance with the school register.
                                            </div>

                                            <div className='flex justify-between items-end mt-24 px-4'>
                                                <div className='text-xl'>Date: {format(new Date(), 'dd-MMM-yyyy')}</div>
                                                <div className='text-center'>
                                                    <div className='text-2xl font-bold uppercase tracking-widest'>PRINCIPAL</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0.5in;
                        size: A4;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                    }
                    .print-container {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
