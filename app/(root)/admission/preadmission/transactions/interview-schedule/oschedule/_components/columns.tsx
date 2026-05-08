'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IOralTestSchedule } from '@/types/admission/preadmission/transactions/oral-test-schedule';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useDeleteOralTestSchedule } from '@/hooks/admission/preadmission/transactions/use-oral-test-schedule';

const formatTime = (time: string) => {
    if (!time) return 'N/A';
    const parts = time.split(':');
    if (parts.length < 2) return time;
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')}${ampm}`;
};

export const oralTestScheduleColumns: ColumnDef<IOralTestSchedule>[] = [
    {
        id: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title="SL.NO" />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return pageIndex * pageSize + row.index + 1;
        },
    },
    {
        accessorKey: 'paotS_ScheduleName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Scheduled Name" />,
        cell: ({ row }) => <ScheduledNameCell rowData={row.original} />,
    },
    {
        accessorKey: 'createdDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created Date" />,
        cell: ({ row }) => row.original.createdDate ? format(new Date(row.original.createdDate), 'dd-MM-yyyy') : 'N/A',
    },
    {
        accessorKey: 'paotS_ScheduleDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Scheduled Date" />,
        cell: ({ row }) => format(new Date(row.original.paotS_ScheduleDate), 'dd-MM-yyyy'),
    },
    {
        accessorKey: 'paotS_ScheduleTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title="From" />,
        cell: ({ row }) => formatTime(row.original.paotS_ScheduleTime),
    },
    {
        accessorKey: 'paotS_ScheduleTimeTo',
        header: ({ column }) => <DataTableColumnHeader column={column} title="To" />,
        cell: ({ row }) => formatTime(row.original.paotS_ScheduleTimeTo),
    },
    {
        id: 'delete',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Delete" />,
        cell: ({ row }) => <DeleteButton rowData={row.original} />,
    },
];

function ScheduledNameCell({ rowData }: { rowData: IOralTestSchedule }) {
    const { openDetailsView } = useFormContext<IOralTestSchedule>();
    return (
        <div className="flex items-center justify-between w-full pr-2">
            <span className="font-medium uppercase text-xs">{rowData.paotS_ScheduleName}</span>
            <Button 
                variant="link" 
                className="p-0 h-auto text-blue-600 hover:text-blue-800 text-[10px] font-bold uppercase flex items-center"
                onClick={() => openDetailsView(rowData)}
            >
                <Eye className="mr-1 h-3.5 w-3.5" />
                VIEW LIST - {rowData.ocount || 0}
            </Button>
        </div>
    );
}

function DeleteButton({ rowData }: { rowData: IOralTestSchedule }) {
    const { mutate: deleteSchedule, isPending: isDeleting } = useDeleteOralTestSchedule();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this schedule?')) {
            deleteSchedule(rowData.paotS_Id);
        }
    };

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive hover:bg-destructive/10" 
            onClick={handleDelete} 
            disabled={isDeleting} 
            title="Delete"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    );
}
