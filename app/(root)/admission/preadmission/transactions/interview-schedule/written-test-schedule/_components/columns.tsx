'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useDeleteWrittenTestSchedule } from '@/hooks/admission/preadmission/transactions/use-written-test-schedule';
import type { IWrittenTestSchedule } from '@/types/admission/preadmission/transactions/written-test-schedule';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

const formatTime = (time: string) => {
    if (!time) return 'N/A';
    const parts = time.split(':');
    if (parts.length < 2) return time;
    const hours = Number.parseInt(parts[0]);
    const minutes = Number.parseInt(parts[1]);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')}${ampm}`;
};

export const writtenTestScheduleColumns: ColumnDef<IWrittenTestSchedule>[] = [
    {
        id: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return pageIndex * pageSize + row.index + 1;
        }
    },
    {
        accessorKey: 'pawtS_ScheduleName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Schedule Name' />,
        cell: ({ row }) => <ScheduledNameCell rowData={row.original} />
    },
    {
        accessorKey: 'count',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Count' />,
        cell: ({ row }) => <span className='font-bold'>{row.original.count || 0}</span>
    },
    {
        accessorKey: 'pawtS_ScheduleDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Schedule Date' />,
        cell: ({ row }) => format(new Date(row.original.pawtS_ScheduleDate), 'dd-MM-yyyy')
    },
    {
        accessorKey: 'pawtS_ScheduleTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Time From' />,
        cell: ({ row }) => formatTime(row.original.pawtS_ScheduleTime)
    },
    {
        accessorKey: 'pawtS_ScheduleTimeTo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To' />,
        cell: ({ row }) => formatTime(row.original.pawtS_ScheduleTimeTo)
    },
    {
        accessorKey: 'pawtS_Remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' />,
        cell: ({ row }) => row.original.pawtS_Remarks || 'N/A'
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' />,
        cell: ({ row }) => <ActionButtons rowData={row.original} />
    }
];

function ScheduledNameCell({ rowData }: { rowData: IWrittenTestSchedule }) {
    const { openDetailsView } = useFormContext<IWrittenTestSchedule>();
    return (
        <div className='flex w-full items-center justify-between pr-2'>
            <span className='font-medium text-sm'>{rowData.pawtS_ScheduleName}</span>
            <Button
                variant='link'
                className='flex h-auto items-center p-0 font-bold text-[10px] text-blue-600 uppercase hover:text-blue-800'
                onClick={() => openDetailsView(rowData)}>
                <Eye className='mr-1 h-3.5 w-3.5' />
                VIEW LIST
            </Button>
        </div>
    );
}

function ActionButtons({ rowData }: { rowData: IWrittenTestSchedule }) {
    const { mutate: deleteSchedule, isPending: isDeleting } = useDeleteWrittenTestSchedule();
    const { openEditForm } = useFormContext<IWrittenTestSchedule>();

    const handleDelete = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Are you sure you want to delete this schedule?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteSchedule(rowData.pawtS_Id, {
                    onSuccess: (res: any) => {
                        if (res?.success) {
                            Swal.fire({
                                title: 'Deleted!',
                                text: res.message || 'Schedule deleted successfully',
                                icon: 'success',
                                confirmButtonText: 'OK'
                            });
                        } else {
                            Swal.fire({
                                title: 'Error!',
                                text: res?.message || 'Failed to delete schedule',
                                icon: 'error',
                                confirmButtonText: 'OK'
                            });
                        }
                    },
                    onError: (err: any) => {
                        Swal.fire({
                            title: 'Error!',
                            text: err?.message || 'An error occurred while deleting',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    }
                });
            }
        });
    };

    return (
        <div className='flex items-center gap-2'>
            {/* <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-blue-600 hover:bg-blue-100" 
                onClick={() => openEditForm(rowData)}
                title="Edit"
            >
                <Edit2 className="h-4 w-4" />
            </Button> */}
            <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-destructive hover:bg-destructive/10'
                onClick={handleDelete}
                disabled={isDeleting}
                title='Delete'>
                <Trash2 className='h-4 w-4' />
            </Button>
        </div>
    );
}
