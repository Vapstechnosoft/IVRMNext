'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useStudentApplicationForm } from '@/hooks/admission/preadmission/useTransactions';
import type { IPreadmissionDocumentView } from '@/types/admission/preadmission/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { Download, Eye, FileText } from 'lucide-react';
import { useState } from 'react';
import ApplicationPrintView from './application-print-view';
import { Spinner } from '@/components/ui/spinner';

export const documentViewReportColumns: ColumnDef<IPreadmissionDocumentView>[] = [
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' className='font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return (pageIndex * pageSize) + row.index + 1;
        }
    },
    {
        accessorKey: 'student_photo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Photo' className='font-bold text-black' />,
        cell: ({ row }) => {
            const photoPath = row.original.student_photo || row.original.pasR_Student_Pic_Path;
            return (
                <div className="h-10 w-10 overflow-hidden rounded-full border">
                    <img
                        src={photoPath || '/placeholder-user.png'}
                        alt="Student"
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-user.png'; }}
                    />
                </div>
            );
        }
    },
    {
        accessorKey: 'student_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Name' className='font-bold text-black' />,
        cell: ({ row }) => <span className="uppercase">{row.original.student_name}</span>
    },
    {
        accessorKey: 'pasR_RegistrationNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Registration No' className='font-bold text-black' />,
    },
    {
        accessorKey: 'applied_class_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className='font-bold text-black' />,
    },
    {
        id: 'application_form',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Application Form' className='font-bold text-black' />,
        cell: ({ row }) => {
            const [open, setOpen] = useState(false);
            const { data: studentDetails, isLoading } = useStudentApplicationForm(row.original.pasr_id);

            return (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="link" className="p-0 text-blue-600 hover:underline h-auto">
                            <Eye className="mr-1 h-4 w-4" /> View Application
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Pre-Admission Registration Form</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center p-10">
                                    <Spinner />
                                </div>
                            ) : (
                                <ApplicationPrintView data={studentDetails?.data} />
                            )}
                        </div>
                        <div className="p-4 border-t flex justify-end">
                            <Button onClick={() => window.print()} variant="outline">Print</Button>
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
                <div className="flex flex-col gap-1">
                    {docs.map((doc: any, index: number) => (
                        <a
                            key={index}
                            href={doc.document_Path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                            <FileText className="h-3 w-3" /> {doc.amsmD_DocumentName}
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
                <div className="flex flex-col gap-1">
                    {docs.map((doc: any, index: number) => (
                        <a
                            key={index}
                            href={doc.document_Path}
                            download
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                            <Download className="h-3 w-3" /> {doc.amsmD_DocumentName}
                        </a>
                    ))}
                </div>
            );
        }
    }
];
