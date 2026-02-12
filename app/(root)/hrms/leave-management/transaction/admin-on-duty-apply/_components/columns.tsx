'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { AdminOnDutyApply } from '@/types/hrms/leave-management/admin-on-duty-apply';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye, Trash2 } from 'lucide-react';

interface AdminOnDutyApplyColumnsProps {
    onView: (id: number) => void;
    onDelete: (id: number) => void;
}

export const getAdminOnDutyApplyColumns = ({
    onView,
    onDelete
}: AdminOnDutyApplyColumnsProps): ColumnDef<AdminOnDutyApply>[] => [
        {
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Id' />,
            cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'employeeName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
            cell: ({ row }) => <div className='font-medium'>{row.getValue('employeeName')}</div>
        },
        {
            accessorKey: 'leaveName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Name' />,
            cell: ({ row }) => <div>{row.getValue('leaveName')}</div>
        },
        {
            accessorKey: 'fromDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />,
            cell: ({ row }) => <div>{format(row.getValue('fromDate'), 'dd/MM/yyyy')}</div>
        },
        {
            accessorKey: 'toDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />,
            cell: ({ row }) => <div>{format(row.getValue('toDate'), 'dd/MM/yyyy')}</div>
        },
        {
            accessorKey: 'totalDays',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Days' />,
            cell: ({ row }) => <div>{row.getValue('totalDays')}</div>
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                return <Badge variant={status === 'Applied' ? 'default' : 'secondary'}>{status}</Badge>;
            }
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const id = row.original.id;
                return (
                    <div className='flex items-center gap-2'>
                        <Button variant='ghost' size='icon' onClick={() => onView(id)}>
                            <Eye className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='icon' onClick={() => onDelete(id)}>
                            <Trash2 className='h-4 w-4 text-destructive' />
                        </Button>
                    </div>
                );
            }
        }
    ];
