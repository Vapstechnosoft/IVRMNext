'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IStatusStudent } from '@/types/admission/preadmission/status';
import type { ColumnDef } from '@tanstack/react-table';

export const getStatusColumns = (
    statusList: { pamsT_Id: number; pamsT_Status: string }[],
    onStatusChange: (id: number, statusId: number) => void,
    onRemarkChange: (id: number, remark: string) => void,
    studentStatus: string,
    rptStatus: boolean
): ColumnDef<IStatusStudent>[] => [
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
        accessorKey: 'name',
        header: 'Student Name',
    },
    {
        accessorKey: 'pasR_RegistrationNo',
        header: 'Reg.No',
    },
    {
        accessorKey: 'statusName',
        header: 'Current Status',
    },
    {
        id: 'updateStatus',
        header: 'Update Status',
        cell: ({ row }) => {
            const student = row.original;
            return (
                <Select
                    disabled={studentStatus !== '786'}
                    value={student.pamsT_Id ? String(student.pamsT_Id) : undefined}
                    onValueChange={(val) => onStatusChange(student.pasR_Id, Number(val))}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusList.map((status) => (
                            <SelectItem key={status.pamsT_Id} value={String(status.pamsT_Id)}>
                                {status.pamsT_Status}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        },
    },
    {
        id: 'remark',
        header: 'Remark',
        cell: ({ row }) => {
            const student = row.original;
            return (
                <Input
                    value={student.remarks || ''}
                    onChange={(e) => onRemarkChange(student.pasR_Id, e.target.value)}
                    placeholder="Enter remark"
                    className="h-8"
                />
            );
        }
    },
    {
        accessorKey: 'remark',
        header: 'Previous Remark',
    },
    {
        accessorKey: 'className',
        header: 'Admitted Class',
    },
    {
        accessorKey: 'repeat_Class_Id',
        header: 'Repeat Class',
    },
    {
        accessorKey: 'pasR_Sex',
        header: 'Sex',
    }
];
