'use client';

import { format } from 'date-fns';
import { CheckCircle, Loader2, Printer, RotateCcw, Search, Trash2, User, UserX } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

import {
    useSophiaStudentTCCancelLoadData,
    useSophiaStudentTCCancelOnChangeYear,
    useSophiaStudentTCCancelOnStudentChange,
    useSophiaStudentTCCancelSave
} from '@/hooks/admission/preadmission/transactions/useSophiaStudentTCCancel';

export default function StudentTcCancelPage() {
    /* -------------------- Refs & Print -------------------- */
    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Student TC Deleted Details',
    });

    /* -------------------- Data Fetching -------------------- */
    const { data: initialData, isLoading: isInitialLoading } = useSophiaStudentTCCancelLoadData();
    const changeYearMutation = useSophiaStudentTCCancelOnChangeYear();
    const studentChangeMutation = useSophiaStudentTCCancelOnStudentChange();
    const saveMutation = useSophiaStudentTCCancelSave();

    /* -------------------- State -------------------- */
    const [asmayId, setAsmayId] = useState<string>('');
    const [amstId, setAmstId] = useState<string>('');
    const [studentList, setStudentList] = useState<any[]>([]);
    const [deletedRecords, setDeletedRecords] = useState<any[]>([]);
    const [selectedStudentDetails, setSelectedStudentDetails] = useState<any>(null);
    const [remarks, setRemarks] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    /* -------------------- Effects -------------------- */
    useEffect(() => {
        if (initialData) {
            const list = initialData?.getstudenttcdetails || initialData?.data?.getstudenttcdetails || [];
            const deletedList = initialData?.getdeletedtcdetails || initialData?.data?.getdeletedtcdetails || [];
            const currYear = (initialData as any)?.currentYear?.[0]?.asmaY_Id || (initialData as any)?.data?.currentYear?.[0]?.asmaY_Id || '';
            
            setStudentList(list);
            setDeletedRecords(deletedList);
            if (currYear) setAsmayId(String(currYear));
        }
    }, [initialData]);

    /* -------------------- Handlers -------------------- */
    const handleYearChange = async (val: string) => {
        setAsmayId(val);
        setAmstId('');
        setSelectedStudentDetails(null);
        setRemarks('');
        
        try {
            const res = await changeYearMutation.mutateAsync(Number(val));
            const list = res?.getstudenttcdetails || res?.data?.getstudenttcdetails || [];
            const deletedList = res?.getdeletedtcdetails || res?.data?.getdeletedtcdetails || [];
            setStudentList(list);
            setDeletedRecords(deletedList);
        } catch (e) {
            toast.error('Failed to load students for selected year');
        }
    };

    const handleStudentChange = async (val: string) => {
        setAmstId(val);
        setRemarks('');
        try {
            const res = await studentChangeMutation.mutateAsync({ 
                asmayId: Number(asmayId), 
                amstId: Number(val) 
            });
            const details = (res as any)?.gettcdetailsbystudentid?.[0] || (res as any)?.data?.gettcdetailsbystudentid?.[0];
            if (details) {
                setSelectedStudentDetails(details);
            } else {
                toast.error('Student Details Not Found');
                setSelectedStudentDetails(null);
            }
        } catch (e) {
            toast.error('Failed to fetch student details');
        }
    };

    const handleSave = async () => {
        if (!asmayId || !amstId) {
            toast.error('Please select Year and Student');
            return;
        }
        if (!remarks.trim()) {
            toast.error('Enter Remarks');
            return;
        }

        try {
            const res = await saveMutation.mutateAsync({
                ASMAY_Id: Number(asmayId),
                AMST_Id: Number(amstId),
                TC_CancelReason: remarks
            });

            if (res?.returnval || res?.data?.returnval) {
                toast.success('TC Deleted Successfully');
                // Refresh data
                handleYearChange(asmayId);
            } else {
                toast.error('Failed To Delete TC');
            }
        } catch (e) {
            toast.error('An error occurred during deletion');
        }
    };

    const handleClear = () => {
        setAmstId('');
        setSelectedStudentDetails(null);
        setRemarks('');
    };

    /* -------------------- Table Configuration -------------------- */
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'slNo',
            header: 'SL.NO',
            cell: ({ row }) => <span className='font-bold text-gray-400'>{row.index + 1}</span>,
        },
        {
            accessorKey: 'amsT_FirstName',
            header: 'Student Details',
            cell: ({ row }) => (
                <div className='flex flex-col'>
                    <span className='font-bold text-indigo-900'>{row.original.amsT_FirstName}</span>
                    <span className='text-xs text-muted-foreground'>{row.original.amsT_AdmNo}</span>
                </div>
            ),
        },
        {
            accessorKey: 'astC_TCNO',
            header: 'TC.NO.',
        },
        {
            accessorKey: 'astC_TCDate',
            header: 'TC Date',
            cell: ({ row }) => row.original.astC_TCDate ? format(new Date(row.original.astC_TCDate), 'dd/MM/yyyy') : '',
        },
        {
            accessorKey: 'tC_CancelReason',
            header: 'Reason For Deletion',
            cell: ({ row }) => <span className='text-xs italic text-gray-600'>{row.original.tC_CancelReason}</span>,
        },
        {
            accessorKey: 'updatedDate',
            header: 'Deleted Date',
            cell: ({ row }) => row.original.updatedDate ? format(new Date(row.original.updatedDate), 'dd/MM/yyyy HH:mm') : '',
        },
    ];

    /* -------------------- UI -------------------- */
    const academicYears = initialData?.academicList || initialData?.data?.academicList || [];

    return (
        <div className='min-h-screen p-4 space-y-6'>
            <CollapsibleSection
                title='Student TC Cancel'
                description='Revoke and delete issued Transfer Certificates'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>

                <div className='bg-white p-6 space-y-8'>
                    {/* Filters */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        <div className='space-y-2'>
                            <Label>Academic Year <strong className="text-red-600">*</strong></Label>
                            <Select value={asmayId} onValueChange={handleYearChange}>
                                <SelectTrigger className='h-12 shadow-sm'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYears.map((year: any) => (
                                        <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label>Student Name <strong className="text-red-600">*</strong></Label>
                            <Select value={amstId} onValueChange={handleStudentChange} disabled={!asmayId}>
                                <SelectTrigger className='h-12 shadow-sm'>
                                    <SelectValue placeholder={!asmayId ? 'Select Year First' : 'Select Or Search Student'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {studentList.map((s: any) => (
                                        <SelectItem key={s.amsT_Id} value={String(s.amsT_Id)}>
                                            {s.amsT_FirstName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Student Details Card */}
                    {selectedStudentDetails && (
                        <Card className='border-indigo-100 bg-indigo-50/20 shadow-xl overflow-hidden'>
                            <div className='bg-indigo-900 px-6 py-3 flex items-center justify-between'>
                                <h3 className='text-sm font-bold text-white flex items-center gap-2'>
                                    <User className='h-4 w-4' /> Student Details
                                </h3>
                                <Badge variant='outline' className='bg-white/10 text-white border-white/20 px-4'>
                                    {selectedStudentDetails.leftyearname} / {selectedStudentDetails.leftclassname}
                                </Badge>
                            </div>
                            <CardContent className='p-8'>
                                <div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
                                    {/* Left Info */}
                                    <div className='space-y-4 col-span-1 lg:col-span-1'>
                                        <div className='flex flex-col space-y-1'>
                                            <span className='text-[10px] font-bold text-indigo-900 uppercase'>Student Name</span>
                                            <span className='text-lg font-bold text-gray-800'>{selectedStudentDetails.amsT_FirstName}</span>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='flex flex-col space-y-1'>
                                                <span className='text-[10px] font-bold text-indigo-900 uppercase'>Adm No.</span>
                                                <span className='text-sm font-medium'>{selectedStudentDetails.amsT_AdmNo}</span>
                                            </div>
                                            <div className='flex flex-col space-y-1'>
                                                <span className='text-[10px] font-bold text-indigo-900 uppercase'>Reg No.</span>
                                                <span className='text-sm font-medium'>{selectedStudentDetails.amsT_RegistrationNo}</span>
                                            </div>
                                        </div>
                                        <div className='flex flex-col space-y-1'>
                                            <span className='text-[10px] font-bold text-indigo-900 uppercase'>Joined Details</span>
                                            <span className='text-sm font-medium'>{selectedStudentDetails.joinedyearname} / {selectedStudentDetails.joinedclassname}</span>
                                        </div>
                                    </div>

                                    {/* Middle Info (TC Info) */}
                                    <div className='space-y-4 col-span-1 lg:col-span-1'>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='flex flex-col space-y-1'>
                                                <span className='text-[10px] font-bold text-indigo-900 uppercase'>TC No.</span>
                                                <span className='text-sm font-bold text-red-600'>{selectedStudentDetails.astC_TCNO}</span>
                                            </div>
                                            <div className='flex flex-col space-y-1'>
                                                <span className='text-[10px] font-bold text-indigo-900 uppercase'>TC Date</span>
                                                <span className='text-sm font-medium'>{selectedStudentDetails.astC_TCDate ? format(new Date(selectedStudentDetails.astC_TCDate), 'dd/MM/yyyy') : 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className='flex flex-col space-y-1'>
                                            <span className='text-[10px] font-bold text-indigo-900 uppercase'>Left Details</span>
                                            <span className='text-sm font-medium'>{selectedStudentDetails.leftyearname} / {selectedStudentDetails.leftclassname} / {selectedStudentDetails.leftsectionname}</span>
                                        </div>
                                    </div>

                                    {/* Right (Photo & Actions) */}
                                    <div className='flex flex-col items-center space-y-6'>
                                        <div className='relative group'>
                                            <div className='absolute -inset-1 bg-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000'></div>
                                            <div className='relative w-32 h-32 rounded-2xl border-4 border-white bg-white shadow-xl overflow-hidden'>
                                                <img 
                                                    src={selectedStudentDetails.studentphotopath || '/images/user-placeholder.png'} 
                                                    alt="Student"
                                                    className='w-full h-full object-cover'
                                                />
                                            </div>
                                        </div>

                                        <div className='w-full space-y-2'>
                                            <Label className='text-[10px] uppercase font-bold text-indigo-900'>Reason For Cancellation <strong className="text-red-600">*</strong></Label>
                                            <Textarea
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                placeholder='Enter reason for deleting TC...'
                                                className='min-h-[80px] bg-white shadow-sm resize-none'
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='flex justify-center gap-4 mt-12'>
                                    <Button size='lg' onClick={handleSave} disabled={saveMutation.isPending} className='min-w-[180px] bg-red-600 hover:bg-red-700 text-white shadow-xl rounded-full uppercase tracking-widest transition-all'>
                                        {saveMutation.isPending ? <Loader2 className='mr-2 h-5 w-5 animate-spin' /> : <Trash2 className='mr-2 h-5 w-5' />}
                                        Cancel TC
                                    </Button>
                                    <Button size='lg' variant='outline' onClick={handleClear} className='min-w-[180px] border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm rounded-full uppercase tracking-widest'>
                                        <RotateCcw className='mr-2 h-5 w-5' /> Clear
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </CollapsibleSection>

            {/* Deleted Details Section */}
            {deletedRecords.length > 0 && (
                <CollapsibleSection
                    title='Student TC Cancel Details'
                    description='History of revoked Transfer Certificates'
                    variant='outline'
                    className='shadow-lg'>
                    
                    <div className='bg-white p-6 space-y-6'>
                        <div className='flex justify-end mb-4'>
                            <Button variant='outline' onClick={handlePrint} className='rounded-full border-indigo-200 text-indigo-700 hover:bg-indigo-50'>
                                <Printer className='mr-2 h-4 w-4' /> Print List
                            </Button>
                        </div>
                        
                        <DataTable 
                            columns={columns as any} 
                            data={deletedRecords} 
                            totalItems={deletedRecords.length}
                        />
                    </div>
                </CollapsibleSection>
            )}

            {/* Hidden Print Section */}
            <div className='hidden'>
                <div ref={printRef} className='p-10 space-y-8'>
                    <div className='text-center border-b-2 border-indigo-900 pb-6'>
                        <h2 className='text-2xl font-bold text-indigo-900 uppercase'>Sophia High School</h2>
                        <h3 className='text-lg font-medium text-gray-600 uppercase mt-2'>Student TC Deleted Details</h3>
                    </div>

                    <Table className='border-2 border-indigo-900'>
                        <TableHeader className='bg-indigo-50'>
                            <TableRow className='border-indigo-900'>
                                <TableHead className='border-r border-indigo-900 text-indigo-900 font-bold text-center'>Sl.No.</TableHead>
                                <TableHead className='border-r border-indigo-900 text-indigo-900 font-bold'>Student Details</TableHead>
                                <TableHead className='border-r border-indigo-900 text-indigo-900 font-bold'>TC.No.</TableHead>
                                <TableHead className='border-r border-indigo-900 text-indigo-900 font-bold'>TC Date</TableHead>
                                <TableHead className='border-r border-indigo-900 text-indigo-900 font-bold'>Reason For Deletion</TableHead>
                                <TableHead className='text-indigo-900 font-bold'>Deleted Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deletedRecords.map((record, i) => (
                                <TableRow key={i} className='border-indigo-900'>
                                    <TableCell className='border-r border-indigo-900 text-center font-bold'>{i + 1}</TableCell>
                                    <TableCell className='border-r border-indigo-900 font-medium'>
                                        {record.amsT_FirstName} ({record.amsT_AdmNo})
                                    </TableCell>
                                    <TableCell className='border-r border-indigo-900 text-red-600 font-bold'>{record.astC_TCNO}</TableCell>
                                    <TableCell className='border-r border-indigo-900'>
                                        {record.astC_TCDate ? format(new Date(record.astC_TCDate), 'dd/MM/yyyy') : ''}
                                    </TableCell>
                                    <TableCell className='border-r border-indigo-900 text-xs italic'>{record.tC_CancelReason}</TableCell>
                                    <TableCell>{record.updatedDate ? format(new Date(record.updatedDate), 'dd/MM/yyyy HH:mm') : ''}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className='mt-20 flex justify-between px-10'>
                        <div className='text-center border-t border-indigo-900 pt-2 min-w-[200px]'>
                            <p className='text-sm font-bold uppercase'>Accountant</p>
                        </div>
                        <div className='text-center border-t border-indigo-900 pt-2 min-w-[200px]'>
                            <p className='text-sm font-bold uppercase'>Principal</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
