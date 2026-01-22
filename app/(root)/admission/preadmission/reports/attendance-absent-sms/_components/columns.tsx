'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export interface IAttendanceAbsentSmsReport {
    RowNo: number;
    AMST_FirstName: string;
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    AMST_RollNumber: string;
    AMST_PhoneNumber: string;
    AMST_FatherName: string;
    AMST_MotherName: string;
    AttendanceDate: string;
    AttendanceStatus: string;
}

const serialNumberColumn: ColumnDef<IAttendanceAbsentSmsReport> = {
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

const studentNameColumn: ColumnDef<IAttendanceAbsentSmsReport> = {
    accessorKey: 'AMST_FirstName',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
    cell: ({ row }) => <div>{row.getValue('AMST_FirstName') || 'N.A'}</div>
};

const classNameColumn: ColumnDef<IAttendanceAbsentSmsReport> = {
    accessorKey: 'ASMCL_ClassName',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
    cell: ({ row }) => <div>{row.getValue('ASMCL_ClassName') || 'N.A'}</div>
};

const sectionColumn: ColumnDef<IAttendanceAbsentSmsReport> = {
    accessorKey: 'ASMC_SectionName',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
    cell: ({ row }) => <div>{row.getValue('ASMC_SectionName') || 'N.A'}</div>
};

const rollNumberColumn: ColumnDef<IAttendanceAbsentSmsReport> = {
    accessorKey: 'AMST_RollNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Roll No' />,
    cell: ({ row }) => <div>{row.getValue('AMST_RollNumber') || 'N.A'}</div>
};

const phoneColumn: ColumnDef<IAttendanceAbsentSmsReport> = {
    accessorKey: 'AMST_PhoneNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Phone' />,
    cell: ({ row }) => <div>{row.getValue('AMST_PhoneNumber') || 'N.A'}</div>
};

const fatherNameColumn: ColumnDef<IAttendanceAbsentSmsReport> = {
    accessorKey: 'AMST_FatherName',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Father Name' />,
    cell: ({ row }) => <div>{row.getValue('AMST_FatherName') || 'N.A'}</div>
};

const motherNameColumn: ColumnDef<IAttendanceAbsentSmsReport> = {
    accessorKey: 'AMST_MotherName',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Mother Name' />,
    cell: ({ row }) => <div>{row.getValue('AMST_MotherName') || 'N.A'}</div>
};

export const getAttendanceAbsentSmsColumns = (): ColumnDef<IAttendanceAbsentSmsReport>[] => {
    return [
        serialNumberColumn,
        studentNameColumn,
        classNameColumn,
        sectionColumn,
        rollNumberColumn,
        phoneColumn,
        fatherNameColumn,
        motherNameColumn
    ];
};
