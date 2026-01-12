import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

export const BookRegisterColumns: ColumnDef<BookRegisterPayload>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
        ),
        enableSorting: false,
        enableHiding: false
    },
    {
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableHiding: true,
        enableSorting: false
    },
    {
        accessorKey: 'LMB_BookTitle',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Title' />
    },
    {
        accessorKey: 'lmbanO_AccessionNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Accession No' />
    },
    {
        accessorKey: 'lmP_PublisherName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Publisher' />
    },
    {
        accessorKey: 'lmD_DepartmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />
    },
    {
        accessorKey: 'lmS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />
    },
    {
        accessorKey: 'lmL_LanguageName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Language' />
    },
    {
        accessorKey: 'lmrA_RackName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Rack' />
    },
    {
        accessorKey: 'AUTHOR_FullName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Author' />
    },
    {
        accessorKey: 'lmbanO_AvialableStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />
    },
    {
        accessorKey: 'LMB_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Active' />,
        cell: ({ row }) => {
            const isActive = row.getValue('LMB_ActiveFlag');
            return <Badge variant={isActive ? 'default' : 'destructive'}>{isActive ? 'Active' : 'Inactive'}</Badge>;
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        cell: ({ row }) => {
            // Placeholder for actions, matching the visual style of LibBookTransaction
            // Actual functionality would require passing handlers or using a Context if not utilizing ActionButtons
            return (
                <div className='flex justify-center gap-2'>
                    <Button variant='ghost' size='icon' className='h-8 w-8 text-blue-500'>
                        <Edit className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='icon' className='h-8 w-8 text-red-500'>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                </div>
            );
        },
        enableSorting: false
    }
];
