'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ROLES } from '@/constants';
import type { IPreadmissionStudentApplicationList } from '@/types/admission/preadmission/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { ReceiptIndianRupee } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import PaymentDialog from './payment-dialog';
import ToggleStudentApplicationForm from './toggle-form';

export const studentApplicationColumns: ColumnDef<IPreadmissionStudentApplicationList>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 24
    },
    {
        accessorKey: 'pasr_id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'pasR_RegistrationNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Application No' />,
        cell: ({ row }) => <div>{row.getValue('pasR_RegistrationNo') ?? 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'student_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => <div>{row.getValue('student_name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'pasR_Sex',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Gender' />,
        cell: ({ row }) => <div>{row.getValue('pasR_Sex')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'applied_class_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Applied Class' />,
        cell: ({ row }) => <div>{row.getValue('applied_class_name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'application_status',
        header: ({ column }) => <DataTableColumnHeader className='text-nowrap' column={column} title='Application Status' />,
        cell: ({ row }) => <div>{row.getValue('application_status')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'admission_status',
        header: ({ column }) => <DataTableColumnHeader className='text-nowrap' column={column} title='Admission Status' />,
        cell: ({ row }) => <div>{row.getValue('admission_status')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'applied_by',
        header: ({ column }) => <DataTableColumnHeader className='text-nowrap' column={column} title='User Name' />,
        cell: ({ row }) => <div>{row.getValue('applied_by')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader className='text-center' column={column} title='Actions' />,
        accessorFn: (row: any) => {
            return row;
        },
        enableHiding: false,
        enableSorting: false,
        cell: ({ cell }: { cell: any }) => {
            const session = useSession();

            useEffect(() => {
                if (session?.data?.role === undefined) {
                    window.location.reload();
                }
            }, [session?.data?.role]);

            return (
                <div className='flex justify-between gap-2'>
                    {cell.row.original.is_fee_applicable === 1 ? (
                        cell.row.original.payment_status === 0 ? (
                            <PaymentDialog cell={cell} />
                        ) : (
                            <Badge className='cursor-not-allowed bg-green-500 p-3 font-extrabold text-black hover:bg-green-600'>
                                <ReceiptIndianRupee className='h-4 w-4' /> Paid
                            </Badge>
                        )
                    ) : (
                        <p className='text-slate-600 text-sm'>No Fee</p>
                    )}
                    {session?.data?.role.toUpperCase() === ROLES.ADMIN && <ToggleStudentApplicationForm cell={cell} />}
                </div>
            );
        }
    }
];
