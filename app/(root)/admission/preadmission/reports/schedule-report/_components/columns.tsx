'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import type { IScheduleReportList } from '@/types/admission/preadmission/reports';
import { format } from 'date-fns';

/**
 * Returns the column definitions for the Schedule Report data table.
 */
export const getScheduleReportColumns = (): ColumnDef<IScheduleReportList>[] => [
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
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label='Select row'
            />
        ),
        enableSorting: false,
        enableHiding: false
    },
    {
        id: 'sno',
        header: 'SL.NO',
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'regno',
        header: 'RegNo',
    },
    {
        accessorKey: 'class',
        header: 'Class',
    },
    {
        accessorKey: 'gender',
        header: 'Gender',
    },
    {
        accessorKey: 'ScheduleDate',
        header: 'Schedule Date',
        cell: ({ row }) => {
            const date = row.original.ScheduleDate;
            if (!date) return 'N/A';
            try {
                return format(new Date(date), 'dd-MM-yyyy');
            } catch (e) {
                return date;
            }
        }
    },
    {
        accessorKey: 'ScheduleTime',
        header: 'From',
    },
    {
        accessorKey: 'ScheduleTimeTo',
        header: 'To',
    },
    {
        accessorKey: 'PAOTS_Remarks',
        header: 'Remarks',
    }
];
