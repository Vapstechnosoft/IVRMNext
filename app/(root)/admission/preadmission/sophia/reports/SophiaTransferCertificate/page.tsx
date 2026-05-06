'use client';

import { format } from 'date-fns';
import { Download, Loader2, Printer, RotateCcw, Search, FileText, User } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import {
    useTCInitialData,
    useStudentNameRegNo,
    useStudentNameChange,
    useTCGetDetailsRecord
} from '@/hooks/admission/preadmission/reports/useSophiaTCReport';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function SophiaTransferCertificate() {
    /* -------------------- State -------------------- */
    const [asmayId, setAsmayId] = useState<number>(0);
    const [admName, setAdmName] = useState<string>('regno'); // 'regno' or 'stdname'
    const [tcTempPer, setTcTempPer] = useState<string>('per'); // 'temp' or 'per'
    const [amstId, setAmstId] = useState<number>(0);
    const [studentDropdown, setStudentDropdown] = useState<any[]>([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [report, setReport] = useState<any>(null);
    const [printFlag, setPrintFlag] = useState(false);

    /* -------------------- Refs -------------------- */
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Hooks -------------------- */
    const { data: initialData } = useTCInitialData();
    const getStudentListMutation = useStudentNameRegNo();
    const studentChangeMutation = useStudentNameChange();
    const getTCDetailsMutation = useTCGetDetailsRecord();

    /* -------------------- Handlers -------------------- */
    const handleYearChange = async (val: string) => {
        const id = Number(val);
        setAsmayId(id);
        setAmstId(0);
        setStudentDropdown([]);
        setPrintFlag(false);
        fetchStudents(id, admName, tcTempPer);
    };

    const fetchStudents = async (yId: number, searchBy: string, studentType: string) => {
        if (!yId) return;
        try {
            const res = await getStudentListMutation.mutateAsync({
                ASMAY_Id: yId,
                admnoorname: searchBy,
                tctemporper: studentType
            });
            const pData = res?.data || res;
            setStudentDropdown(pData.studentlist || []);
        } catch (e) {
            toast.error('Failed to load students');
        }
    };

    const handleStudentChange = async (val: string) => {
        const sId = Number(val);
        setAmstId(sId);
        setPrintFlag(false);
        // We could call studentNameChange API if needed for label updates, 
        // but getTcdetails usually returns everything.
    };

    const handleGenerateReport = async () => {
        if (!asmayId || !amstId) {
            toast.error('Please select year and student');
            return;
        }

        try {
            const res = await getTCDetailsMutation.mutateAsync({
                ASMAY_Id: asmayId,
                AMST_Id: amstId,
                tctemporper: tcTempPer
            });
            const pData = res?.data || res;
            if (pData.studentTCList && pData.studentTCList.length > 0) {
                setReport(pData.studentTCList[0]);
                setPrintFlag(true);
            } else {
                toast.warning('No records found');
                setPrintFlag(false);
            }
        } catch (e) {
            toast.error('Failed to generate report');
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Transfer_Certificate_${report?.studentname || 'Record'}`,
    });

    const formatClassName = (className: string) => {
        const classMap: Record<string, string> = {
            'I': 'FIRST', 'II': 'SECOND', 'III': 'THIRD', 'IV': 'FOURTH',
            'V': 'FIFTH', 'VI': 'SIXTH', 'VII': 'SEVENTH', 'VIII': 'EIGHTH',
            'IX': 'NINTH', 'X': 'TENTH'
        };
        return classMap[className] || className;
    };

    const filteredDropdown = useMemo(() => {
        if (!studentSearch) return studentDropdown;
        return studentDropdown.filter(s => 
            s.studentname?.toLowerCase().includes(studentSearch.toLowerCase())
        );
    }, [studentDropdown, studentSearch]);

    /* -------------------- UI -------------------- */
    return (
        <div className='p-6 space-y-8 min-h-screen bg-gray-50/30'>
            <CollapsibleSection
                title='TC Custom Report'
                description='Generate detailed transfer certificate for a student'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>

                <div className='bg-white p-8 rounded-xl'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
                        {/* Left Column */}
                        <div className='space-y-8'>
                            <div className='space-y-3'>
                                <Label className='text-sm font-bold text-gray-700 flex items-center'>
                                    Left Year:<span className='text-red-500 ml-1'>*</span>
                                </Label>
                                <Select value={asmayId?.toString()} onValueChange={handleYearChange}>
                                    <SelectTrigger className='h-11 rounded-lg border-gray-200 shadow-sm'>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(initialData?.data as any)?.accyear?.map((y: any) => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>{y.asmaY_Year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-4'>
                                <Label className='text-xs font-bold uppercase tracking-wider text-indigo-600'>Search By:</Label>
                                <RadioGroup value={admName} onValueChange={(v) => { setAdmName(v); fetchStudents(asmayId, v, tcTempPer); }} className='flex gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='regno' id='regno' />
                                        <Label htmlFor='regno' className='font-medium cursor-pointer'>Adm. No</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='stdname' id='stdname' />
                                        <Label htmlFor='stdname' className='font-medium cursor-pointer'>Student Name</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className='space-y-8'>
                            <div className='p-4 bg-orange-50/50 rounded-xl border border-orange-100 space-y-4'>
                                <Label className='text-xs font-bold uppercase tracking-wider text-orange-600'>Student Type:</Label>
                                <RadioGroup value={tcTempPer} onValueChange={(v) => { setTcTempPer(v); fetchStudents(asmayId, admName, v); }} className='flex gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='temp' id='temp' />
                                        <Label htmlFor='temp' className='font-medium cursor-pointer'>Temporary</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='per' id='per' />
                                        <Label htmlFor='per' className='font-medium cursor-pointer'>Permanent</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className='space-y-3'>
                                <Label className='text-sm font-bold text-gray-700 flex items-center'>
                                    Student:<span className='text-red-500 ml-1'>*</span>
                                </Label>
                                <Select value={amstId?.toString()} onValueChange={handleStudentChange} disabled={studentDropdown.length === 0}>
                                    <SelectTrigger className='h-11 rounded-lg border-gray-200 shadow-sm'>
                                        <SelectValue placeholder={studentDropdown.length > 0 ? 'Select Student' : 'No students found'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className='p-2 border-b'>
                                            <div className='relative'>
                                                <Search className='absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
                                                <Input 
                                                    placeholder='Search student...' 
                                                    value={studentSearch}
                                                    onChange={(e) => setStudentSearch(e.target.value)}
                                                    className='h-8 pl-8 text-xs' 
                                                />
                                            </div>
                                        </div>
                                        {filteredDropdown.map((s: any) => (
                                            <SelectItem key={s.amsT_Id} value={s.amsT_Id.toString()}>{s.studentname}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Separator className='my-8' />

                    <div className='flex justify-center gap-4'>
                        <Button onClick={handleGenerateReport} disabled={getTCDetailsMutation.isPending || !amstId} className='bg-indigo-600 hover:bg-indigo-700 rounded-full px-10 h-11 shadow-lg shadow-indigo-200 transition-all active:scale-95'>
                            {getTCDetailsMutation.isPending ? <Loader2 className='mr-2 h-5 w-5 animate-spin' /> : <FileText className='mr-2 h-5 w-5' />}
                            REPORT
                        </Button>
                        <Button variant='outline' onClick={() => window.location.reload()} className='rounded-full px-10 h-11 border-gray-200 hover:bg-gray-50'>
                            <RotateCcw className='mr-2 h-5 w-5' />
                            CANCEL
                        </Button>
                        {printFlag && (
                            <Button variant='secondary' onClick={() => handlePrint()} className='rounded-full px-10 h-11 shadow-lg'>
                                <Printer className='mr-2 h-5 w-5' />
                                PRINT
                            </Button>
                        )}
                    </div>
                </div>
            </CollapsibleSection>

            {/* TC Preview Section */}
            {printFlag && report && (
                <Card className='shadow-2xl border-none overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500'>
                    <CardContent className='p-0'>
                        <div className='bg-gray-100 p-8 flex justify-center'>
                            <div ref={printRef} className='bg-white shadow-sm p-16' style={{ width: '210mm', minHeight: '297mm', fontFamily: '"Times New Roman", Times, serif' }}>
                                <div style={{ marginTop: '100px' }}>
                                    <h1 className='text-center mb-10'>
                                        <span style={{ borderBottom: '2px solid black', paddingBottom: '4px', fontSize: '32px', fontWeight: 'bold' }}>
                                            TRANSFER CERTIFICATE
                                        </span>
                                    </h1>

                                    <div className='flex justify-between items-center mb-2 px-2 text-lg font-bold'>
                                        <div>Admission Number: {report.amsT_AdmNo}</div>
                                        <div>Sl. No: {report.astC_TCNO}</div>
                                    </div>
                                    <hr className='border-black mb-10' />

                                    <div className='space-y-6 text-xl leading-relaxed'>
                                        {[
                                            { label: 'Name of Pupil', value: report.studentname, num: '1' },
                                            { label: "Father's Name", value: report.amsT_FatherName, num: '2' },
                                            { label: "Mother's Name", value: report.amsT_MotherName, num: '3' },
                                            { label: 'Religion/Caste', value: `${report.religion} / ${report.caste}`, num: '4' },
                                            { label: 'Nationality', value: report.nationality, num: '5' },
                                            { label: 'Date of Birth', value: report.amsT_DOB ? format(new Date(report.amsT_DOB), 'dd-MMM-yyyy') : '', num: '6' },
                                            { label: 'School Last Attended', value: 'N/A', num: '7' },
                                            { label: 'Date Of Admission', value: report.amsT_Date ? format(new Date(report.amsT_Date), 'dd-MMM-yyyy') : '', num: '8' },
                                            { label: 'Conduct', value: report.astC_Conduct || 'Good', num: '9' },
                                            { label: 'Date Of Leaving', value: report.tcdatess ? format(new Date(report.tcdatess), 'dd-MMM-yyyy') : '', num: '10' },
                                            { label: 'Studying In', value: `${formatClassName(report.Last_Class_Studied)} ${report.asmC_SectionName}`, num: '11' },
                                            { label: 'Remarks', value: report.astC_Remarks || '-', num: '12' }
                                        ].map((item, i) => (
                                            <div key={i} className='flex items-baseline'>
                                                <div className='w-12 text-right mr-4 font-bold'>{item.num}</div>
                                                <div className='w-64 flex-shrink-0 font-medium'>{item.label}</div>
                                                <div className='flex-grow border-b border-dotted border-gray-400 pb-1'>
                                                    <span className='ml-4'>: {item.value}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <hr className='border-black my-12' />

                                    <div className='space-y-8 mt-12'>
                                        <div className='flex justify-between items-center text-xl'>
                                            <div>PEN No. <span className='border-b border-black px-4 ml-2 font-bold'>{report.AMST_PENNo}</span></div>
                                            <div>SATS No. <span className='border-b border-black px-4 ml-2 font-bold'>{report.govtno}</span></div>
                                        </div>

                                        <div className='text-xl italic mt-16 px-4'>
                                            Certified that the above-mentioned information is in accordance with the school register.
                                        </div>

                                        <div className='flex justify-between items-end mt-32 px-4'>
                                            <div className='text-xl'>Date: {format(new Date(), 'dd-MMM-yyyy')}</div>
                                            <div className='text-center'>
                                                <div className='text-2xl font-bold uppercase tracking-widest' style={{ borderTop: '2px solid black', paddingTop: '8px' }}>PRINCIPAL</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: A4;
                    }
                    body {
                        margin: 0;
                        -webkit-print-color-adjust: exact;
                    }
                    .print-section {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
