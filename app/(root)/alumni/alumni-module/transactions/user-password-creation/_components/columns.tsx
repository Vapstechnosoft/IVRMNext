import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IStudent } from '@/types/alumni/user-password-creation';
import type { ColumnDef } from '@tanstack/react-table';

export const userPasswordCreationColumns: ColumnDef<IStudent>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <div className='flex justify-center'>
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
            </div>
        ),
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'sno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SNO' className='justify-center font-bold text-black' />,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>
    },
    {
        accessorKey: 'studentname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='NAME' className='font-bold text-black' />,
        cell: ({ row }) => <span className='uppercase'>{row.original.studentname}</span>
    },
    {
        accessorKey: 'amst_admno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='ADMISSION NUMBER' className='font-bold text-black' />
    },
    {
        accessorKey: 'asmcl_classname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='CLASS' className='font-bold text-black' />
    },
    {
        accessorKey: 'asmc_sectionname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SECTION' className='font-bold text-black' />
    }
];
