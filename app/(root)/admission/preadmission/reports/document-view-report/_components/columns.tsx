'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useStudentPrintData } from '@/hooks/admission/preadmission/useTransactions';
import type { IPreadmissionDocumentView } from '@/types/admission/preadmission/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { Download, Eye, FileText } from 'lucide-react';
import React, { useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import ApplicationPrintView from './application-print-view';

export const documentViewReportColumns: ColumnDef<IPreadmissionDocumentView>[] = [
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' className='font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return pageIndex * pageSize + row.index + 1;
        }
    },
    {
        accessorKey: 'student_photo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Photo' className='font-bold text-black' />,
        cell: ({ row }) => {
            const photoPath = row.original.student_photo || row.original.pasR_Student_Pic_Path;
            return (
                <div className='h-10 w-10 overflow-hidden rounded-full border'>
                    <img
                        src={photoPath || '/placeholder-user.png'}
                        alt='Student'
                        className='h-full w-full object-cover'
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-user.png';
                        }}
                    />
                </div>
            );
        }
    },
    {
        accessorKey: 'student_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Name' className='font-bold text-black' />,
        cell: ({ row }) => <span className='uppercase'>{row.original.student_name}</span>
    },
    {
        accessorKey: 'pasR_RegistrationNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Registration No' className='font-bold text-black' />
    },
    {
        accessorKey: 'applied_class_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className='font-bold text-black' />
    },
    {
        id: 'application_form',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Application Form' className='font-bold text-black' />,
        cell: ({ row }) => {
            const [open, setOpen] = useState(false);
            const printRef = React.useRef<HTMLDivElement>(null);

            const { data: studentDetails, isLoading } = useStudentPrintData(
                row.original.pasr_id || (row.original as any).pasR_Id,
                (row.original as any).selected_asmcL_Id || row.original.asmcl_id || 0,
                (row.original as any).selected_asmaY_Id || row.original.asmaY_Id || 0,
                (row.original as any).asmst_Id || (row.original as any).ASMST_Id || 0, // Pass ASMST_Id if available
                open // Fetch data only when the dialog is opened
            );

            const handlePrint = useReactToPrint({
                contentRef: printRef,
                documentTitle: 'Pre-Admission_Registration_Form'
            });

            return (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant='link' className='h-auto p-0 text-blue-600 hover:underline'>
                            <Eye className='mr-1 h-4 w-4' /> View Application
                        </Button>
                    </DialogTrigger>
                    <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col overflow-hidden'>
                        <DialogHeader>
                            <DialogTitle>Pre-Admission Registration Form</DialogTitle>
                        </DialogHeader>
                        <div className='flex-1 overflow-auto'>
                            {isLoading ? (
                                <div className='flex items-center justify-center p-10'>
                                    <Spinner />
                                </div>
                            ) : (
                                <ApplicationPrintView
                                    printRef={printRef}
                                    data={{
                                        ...studentDetails?.data,
                                        academic_year: studentDetails?.data?.academic_year || row.original.academic_year || '',
                                        asmcL_ClassName: studentDetails?.data?.asmcL_ClassName || row.original.applied_class_name || ''
                                    }}
                                />
                            )}
                        </div>
                        <div className='flex justify-end border-t p-4'>
                            <Button onClick={() => handlePrint()} variant='outline'>
                                Print
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            );
        }
    },
    {
        id: 'view',
        header: ({ column }) => <DataTableColumnHeader column={column} title='View' className='font-bold text-black' />,
        cell: ({ row }) => {
            const docs = row.original.doclist || [];
            return (
                <div className='flex flex-col gap-1'>
                    {docs.map((doc: any, index: number) => (
                        <a
                            key={index}
                            href={doc.document_Path}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-1 text-blue-600 text-xs hover:underline'>
                            <FileText className='h-3 w-3' /> {doc.amsmD_DocumentName}
                        </a>
                    ))}
                </div>
            );
        }
    },
    {
        id: 'download',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Download' className='font-bold text-black' />,
        cell: ({ row }) => {
            const docs = row.original.doclist || [];
            return (
                <div className='flex flex-col gap-1'>
                    {docs.map((doc: any, index: number) => (
                        <a
                            key={index}
                            href={doc.document_Path}
                            download
                            className='flex items-center gap-1 text-blue-600 text-xs hover:underline'>
                            <Download className='h-3 w-3' /> {doc.amsmD_DocumentName}
                        </a>
                    ))}
                </div>
            );
        }
    }
];
