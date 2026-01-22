'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export interface IOverallDailyAttendanceReport {
    RowNo: number;
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    TOTAL: number;
    PRESENT: number;
    ABSENT: number;
    HALFDAY: number;
    ASMCL_Id: string;
    ASMS_ID: string;
    ASMCL_Order: number;
}

const serialNumberColumn: ColumnDef<IOverallDailyAttendanceReport> = {
    accessorKey: 'RowNo',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
    cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        const continuousIndex = pageIndex * pageSize + row.index + 1;
        return <div className='pl-6'>{continuousIndex}</div>;
    },
    enableSorting: true,
    enableHiding: false
};

const classNameColumn: ColumnDef<IOverallDailyAttendanceReport> = {
    accessorKey: 'ASMCL_ClassName',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
    cell: ({ row }) => <div>{row.getValue('ASMCL_ClassName') || 'N.A'}</div>
};

const sectionColumn: ColumnDef<IOverallDailyAttendanceReport> = {
    accessorKey: 'ASMC_SectionName',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
    cell: ({ row }) => <div>{row.getValue('ASMC_SectionName') || 'N.A'}</div>
};

const totalStrengthColumn: ColumnDef<IOverallDailyAttendanceReport> = {
    accessorKey: 'TOTAL',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Total Strength' />,
    cell: ({ row }) => <div className='text-center'>{row.getValue('TOTAL') ?? 0}</div>
};

const presentColumn: ColumnDef<IOverallDailyAttendanceReport> = {
    accessorKey: 'PRESENT',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Present' />,
    cell: ({ row }) => <div className='text-center'>{row.getValue('PRESENT') ?? 0}</div>
};

const absentColumn: ColumnDef<IOverallDailyAttendanceReport> = {
    accessorKey: 'ABSENT',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Absent' />,
    cell: ({ row }) => <div className='text-center'>{row.getValue('ABSENT') ?? 0}</div>
};

const halfDayColumn: ColumnDef<IOverallDailyAttendanceReport> = {
    accessorKey: 'HALFDAY',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Half Day' />,
    cell: ({ row }) => <div className='text-center'>{row.getValue('HALFDAY') ?? 0}</div>
};

export const getOverallDailyAttendanceColumns = (): ColumnDef<IOverallDailyAttendanceReport>[] => {
    return [serialNumberColumn, classNameColumn, sectionColumn, totalStrengthColumn, presentColumn, absentColumn, halfDayColumn];
};
