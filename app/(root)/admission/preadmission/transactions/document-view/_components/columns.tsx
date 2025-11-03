'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IPreadmissionDocumentView } from '@/types/admission/preadmission/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import Link from 'next/link';

export const DocumentViewColoumn: ColumnDef<IPreadmissionDocumentView>[] = [
    {
        accessorKey: 'pasr_id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='text-center'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'student_photo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Photo' />,
        cell: ({ row }) => {
            const photoUrl = row.getValue('student_photo') as string;
            return (
                <div className='flex justify-center'>
                    {photoUrl ? (
                        <Image src={photoUrl} alt='Student' width={40} height={40} className='rounded-full border object-cover' />
                    ) : (
                        <div className='h-10 w-10 rounded-full bg-gray-200' />
                    )}
                </div>
            );
        },
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'student_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
        cell: ({ row }) => <div>{row.getValue('student_name')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'pasR_RegistrationNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Registration No' />,
        cell: ({ row }) => <div>{row.getValue('pasR_RegistrationNo') ?? 'N.A'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'applied_class_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('applied_class_name')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'application_form',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Application Form' />,
        cell: ({ row }) => {
            const appId = row.original.pasr_id;
            return (
                <Link href={`/preadmission/application/${appId}`} className='text-blue-600 hover:underline'>
                    View Application
                </Link>
            );
        },
        enableSorting: false
    },
    {
        accessorKey: 'student_photo_view',
        header: ({ column }) => <DataTableColumnHeader column={column} title='View' />,
        cell: ({ row }) => {
            const studentId = row.original.pasr_id;
            return (
                <Link href={`/preadmission/student-photo/${studentId}`} className='text-blue-600 hover:underline'>
                    Student Photo
                </Link>
            );
        },
        enableSorting: false
    },
    {
        accessorKey: 'document_download',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Download' />,
        cell: ({ row }) => {
            const downloadUrl = row.original.document_download;
            return downloadUrl ? (
                <Link href={downloadUrl} target='_blank' className='text-blue-600 hover:underline'>
                    Download
                </Link>
            ) : (
                <span className='text-gray-400'>N.A</span>
            );
        },
        enableSorting: false
    }
];
