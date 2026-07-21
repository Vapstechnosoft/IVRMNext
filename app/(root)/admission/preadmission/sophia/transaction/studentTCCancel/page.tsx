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

    /* -------------------- Helper -------------------- */
    const formatDate = (date: any, pattern: string = 'dd/MM/yyyy') => {
        try {
            if (!date) return '';
            const d = new Date(date);
            return isNaN(d.getTime()) ? '' : format(d, pattern);
        } catch (e) {
            return '';
        }
    };

    /* -------------------- Effects -------------------- */
    useEffect(() => {
        if (initialData) {
            const data = initialData?.data || initialData;
            const list = data?.getstudenttcdetails || [];
            const deletedList = data?.getdeletedtcdetails || [];
            const currYear = data?.currentYear?.[0]?.asmaY_Id || '';

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
            const data = res?.data || res;
            const list = data?.getstudenttcdetails || [];
            const deletedList = data?.getdeletedtcdetails || [];
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
            const data = res?.data || res;
            const details = data?.gettcdetailsbystudentid?.[0];
            const studentBase = data?.getadm_m_student_details?.[0];
            const tcInfo = data?.studenttcdetails?.[0];

            if (details) {
                setSelectedStudentDetails({
                    ...details,
                    amsT_FatherName: studentBase?.amsT_FatherName,
                    amsT_MotherName: studentBase?.amsT_MotherName,
                    astC_LeavingReason: tcInfo?.astC_LeavingReason
                });
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

            const responseData = res?.data || res;
            if (res?.success || responseData?.success || responseData?.returnval) {
                toast.success(res?.message || responseData?.message || 'TC Deleted Successfully');
                // Refresh data
                handleYearChange(asmayId);
            } else {
                toast.error(res?.message || responseData?.message || 'Failed To Delete TC');
            }
        } catch (e) {
            toast.error('An error occurred during deletion');
        }
    };

    const handleClear = () => {
        window.location.reload();
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
            header: 'Class/Section',
            cell: ({ row }) => (
                <div className='flex flex-col text-xs'>
                    <span className='font-medium'>{row.original.leftclassname}</span>
                    <span className='text-muted-foreground'>{row.original.leftsectionname}</span>
                </div>
            ),
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
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='flex flex-col space-y-1'>
                                                <span className='text-[10px] font-bold text-indigo-900 uppercase'>Father Name</span>
                                                <span className='text-xs font-medium'>{selectedStudentDetails.amsT_FatherName}</span>
                                            </div>
                                            <div className='flex flex-col space-y-1'>
                                                <span className='text-[10px] font-bold text-indigo-900 uppercase'>Mother Name</span>
                                                <span className='text-xs font-medium'>{selectedStudentDetails.amsT_MotherName}</span>
                                            </div>
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
                                        <div className='flex flex-col space-y-1 p-3 rounded-lg bg-white/50 border border-indigo-100'>
                                            <span className='text-[10px] font-bold text-indigo-900 uppercase'>Issued Reason</span>
                                            <span className='text-xs italic text-gray-600'>{selectedStudentDetails.astC_LeavingReason || 'No reason specified'}</span>
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
                    defaultOpen={true}
                    variant='outline'
                    className='shadow-lg'>

                    <div className='bg-white p-6 space-y-6'>
                        {/* <div className='flex justify-end mb-4'>
                            <Button variant='outline' onClick={handlePrint} className='rounded-full border-indigo-200 text-indigo-700 hover:bg-indigo-50'>
                                <Printer className='mr-2 h-4 w-4' /> Print List
                            </Button>
                        </div> */}

                        <DataTable
                            columns={columns as any}
                            data={deletedRecords}
                            totalItems={deletedRecords.length}
                        />
                    </div>
                </CollapsibleSection>
            )}

            {/* Hidden Print Section */}
            <div style={{ display: 'none' }}>
                <div ref={printRef} className='p-10 bg-white text-black' style={{ width: '210mm' }}>
                    <div style={{ textAlign: 'center', borderBottom: '2px solid #312e81', paddingBottom: '20px', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#312e81', textTransform: 'uppercase', margin: 0 }}>Sophia High School</h2>
                        <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#4b5563', textTransform: 'uppercase', marginTop: '8px' }}>Student TC Deleted Details</h3>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #312e81' }}>
                        <thead style={{ backgroundColor: '#f5f7ff' }}>
                            <tr>
                                <th style={{ border: '1px solid #312e81', padding: '10px', color: '#312e81', fontWeight: 'bold', textAlign: 'center', fontSize: '12px' }}>Sl.No.</th>
                                <th style={{ border: '1px solid #312e81', padding: '10px', color: '#312e81', fontWeight: 'bold', textAlign: 'left', fontSize: '12px' }}>Student Details</th>
                                <th style={{ border: '1px solid #312e81', padding: '10px', color: '#312e81', fontWeight: 'bold', textAlign: 'left', fontSize: '12px' }}>TC.No.</th>
                                <th style={{ border: '1px solid #312e81', padding: '10px', color: '#312e81', fontWeight: 'bold', textAlign: 'left', fontSize: '12px' }}>Class/Section</th>
                                <th style={{ border: '1px solid #312e81', padding: '10px', color: '#312e81', fontWeight: 'bold', textAlign: 'left', fontSize: '12px' }}>TC Date</th>
                                <th style={{ border: '1px solid #312e81', padding: '10px', color: '#312e81', fontWeight: 'bold', textAlign: 'left', fontSize: '12px' }}>Reason For Deletion</th>
                                <th style={{ border: '1px solid #312e81', padding: '10px', color: '#312e81', fontWeight: 'bold', textAlign: 'left', fontSize: '12px' }}>Deleted Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deletedRecords.map((record, i) => (
                                <tr key={i}>
                                    <td style={{ border: '1px solid #312e81', padding: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px' }}>{i + 1}</td>
                                    <td style={{ border: '1px solid #312e81', padding: '8px', fontSize: '11px' }}>
                                        {record.amsT_FirstName || ''} {record.amsT_AdmNo ? `(${record.amsT_AdmNo})` : ''}
                                    </td>
                                    <td style={{ border: '1px solid #312e81', padding: '8px', color: '#ef4444', fontWeight: 'bold', fontSize: '11px' }}>{record.astC_TCNO || 'N/A'}</td>
                                    <td style={{ border: '1px solid #312e81', padding: '8px', fontSize: '10px' }}>
                                        {record.leftclassname || ''} {record.leftsectionname ? `/ ${record.leftsectionname}` : ''}
                                    </td>
                                    <td style={{ border: '1px solid #312e81', padding: '8px', fontSize: '11px' }}>
                                        {formatDate(record.astC_TCDate)}
                                    </td>
                                    <td style={{ border: '1px solid #312e81', padding: '8px', fontSize: '10px', fontStyle: 'italic' }}>{record.tC_CancelReason || ''}</td>
                                    <td style={{ border: '1px solid #312e81', padding: '8px', fontSize: '11px' }}>
                                        {formatDate(record.updatedDate, 'dd/MM/yyyy HH:mm')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', padding: '0 40px' }}>
                        <div style={{ textAlign: 'center', borderTop: '1px solid #312e81', paddingTop: '8px', minWidth: '180px' }}>
                            <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>Accountant</p>
                        </div>
                        <div style={{ textAlign: 'center', borderTop: '1px solid #312e81', paddingTop: '8px', minWidth: '180px' }}>
                            <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>Principal</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
