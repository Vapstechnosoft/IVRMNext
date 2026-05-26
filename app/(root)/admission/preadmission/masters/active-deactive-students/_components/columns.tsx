'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Student } from '@/types/admission/preadmission/masters';
import type { ColumnDef } from '@tanstack/react-table';

export const activedeactiveColumns: ColumnDef<Student>[] = [
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
        accessorKey: 'student_id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='font-bold text-black' />,
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
        accessorKey: 'registration_no',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Reg. No.' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('registration_no')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'admission_no',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm. No.' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('admission_no')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'student_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('student_name') ?? 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'reason',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Reason' className='font-bold text-black' />,
        cell: ({ row, table }) => {
            const meta = table.options.meta as any;
            const isSelected = row.getIsSelected();
            const studentId = row.original.student_id;
            const value = meta?.studentData?.get(studentId)?.reason || '';

            return (
                <Select disabled={!isSelected} value={value} onValueChange={(val) => meta?.updateStudentData(studentId, 'reason', val)}>
                    <SelectTrigger className='w-[140px]'>
                        <SelectValue placeholder='Select Reason' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='Fee Due'>Fee Due</SelectItem>
                        <SelectItem value='Long Absent'>Long Absent</SelectItem>
                        <SelectItem value='Medical'>Medical</SelectItem>
                    </SelectContent>
                </Select>
            );
        }
    },
    {
        id: 'remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' className='font-bold text-black' />,
        cell: ({ row, table }) => {
            const meta = table.options.meta as any;
            const isSelected = row.getIsSelected();
            const studentId = row.original.student_id;
            const value = meta?.studentData?.get(studentId)?.remark || '';

            return (
                <Input
                    className='w-[180px]'
                    disabled={!isSelected}
                    value={value}
                    onChange={(e) => meta?.updateStudentData(studentId, 'remark', e.target.value)}
                    placeholder='Enter Remarks'
                />
            );
        }
    }
];
