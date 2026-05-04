'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IOralTestSchedule } from '@/types/admission/preadmission/transactions/oral-test-schedule';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users, FileText, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useDeleteOralTestSchedule } from '@/hooks/admission/preadmission/transactions/use-oral-test-schedule';
import { toast } from 'sonner';

export const oralTestScheduleColumns: ColumnDef<IOralTestSchedule>[] = [
    {
        id: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sl.No" />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return pageIndex * pageSize + row.index + 1;
        },
    },
    {
        accessorKey: 'paotS_ScheduleName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Schedule Name" />,
    },
    {
        accessorKey: 'paotS_ScheduleDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => format(new Date(row.original.paotS_ScheduleDate), 'dd-MM-yyyy'),
    },
    {
        accessorKey: 'paotS_ScheduleTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Time From" />,
    },
    {
        accessorKey: 'paotS_ScheduleTimeTo',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Time To" />,
    },
    {
        accessorKey: 'ocount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Student Count" />,
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
        cell: ({ row }) => <ActionButtons rowData={row.original} />,
    },
];

function ActionButtons({ rowData }: { rowData: IOralTestSchedule }) {
    const { openEditForm, openDetailsView, openToggleForm, openMappedview } = useFormContext<IOralTestSchedule>();
    const { mutate: deleteSchedule, isPending: isDeleting } = useDeleteOralTestSchedule();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this schedule?')) {
            deleteSchedule(rowData.paotS_Id);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => openDetailsView(rowData)} title="View Students">
                <Users className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600" onClick={() => openEditForm(rowData)} title="Edit">
                <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete} disabled={isDeleting} title="Delete">
                <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => openToggleForm(rowData)} title="View Remarks">
                <FileText className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600" onClick={() => openMappedview(rowData)} title="Update Participants">
                <UserPlus className="h-4 w-4" />
            </Button>
        </div>
    );
}
