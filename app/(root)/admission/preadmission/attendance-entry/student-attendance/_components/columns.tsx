'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export interface IStudentAttendance {
    id: number;
    studentName: string;
    rollNo: string;
    admNo: string;
    status: 'Present' | 'Absent' | 'Late' | 'Half Day';
}

export const studentAttendanceColumns: ColumnDef<IStudentAttendance>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='w-full pl-6'>{continuousIndex}</div>;
        }
    },
    {
        accessorKey: 'studentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => <div>{row.getValue('studentName')}</div>
    },
    {
        accessorKey: 'rollNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Roll No' />,
        cell: ({ row }) => <div>{row.getValue('rollNo')}</div>
    },
    {
        accessorKey: 'admNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No' />,
        cell: ({ row }) => <div>{row.getValue('admNo')}</div>
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => (
            <div className='flex gap-2'>
                {/* Mock checkboxes/radios */}
                <label className='flex items-center gap-1'>
                    <input type='radio' name={`status-${row.original.id}`} defaultChecked={row.original.status === 'Present'} /> P
                </label>
                <label className='flex items-center gap-1'>
                    <input type='radio' name={`status-${row.original.id}`} defaultChecked={row.original.status === 'Absent'} /> A
                </label>
                <label className='flex items-center gap-1'>
                    <input type='radio' name={`status-${row.original.id}`} defaultChecked={row.original.status === 'Late'} /> L
                </label>
            </div>
        )
    }
];
