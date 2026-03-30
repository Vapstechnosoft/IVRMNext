'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';

export const birthdayColumns: ColumnDef<any>[] = [
    // {
    //     id: 'select',
    //     header: ({ table }) => (
    //         <Checkbox
    //             checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
    //             onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //             aria-label='Select all'
    //         />
    //     ),
    //     cell: ({ row }) => (
    //         <Checkbox
    //             checked={row.getIsSelected()}
    //             onCheckedChange={(value) => row.toggleSelected(!!value)}
    //             aria-label='Select row'
    //         />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false
    // },
    {
        accessorKey: 'sno',
        header: () => <span className='font-bold text-black text-center'>SL.No</span>,
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'studentname',
        header: () => <span className='font-bold text-black text-center'>Student Name</span>
    },
    {
        accessorKey: 'admno',
        header: () => <span className='font-bold text-black text-center'>Adm. No.</span>
    },
    {
        accessorKey: 'classname',
        header: () => <span className='font-bold text-black text-center'>Class</span>
    },
    {
        accessorKey: 'sectionname',
        header: () => <span className='font-bold text-black text-center'>Section</span>
    },
    {
        accessorKey: 'amst_dob',
        header: () => <span className='font-bold text-black text-center'>Date of Birth</span>,
        cell: ({ row }) => {
            const date = row.getValue('amst_dob') as string;
            return date ? format(new Date(date), 'dd/MMM/yyyy') : 'N/A';
        }
    },
    {
        accessorKey: 'amst_photo',
        header: () => <span className='font-bold text-black text-center'>Student Photo</span>,
        cell: ({ row }) => {
            const photoUrl = row.getValue('amst_photo') as string;
            return (
                <Avatar className='h-16 w-16 rounded-md'>
                    <AvatarImage src={photoUrl} alt='Student' className='object-cover' />
                    <AvatarFallback className='rounded-md'>No Photo</AvatarFallback>
                </Avatar>
            );
        }
    },
    {
        accessorKey: 'stdaddress',
        header: () => <span className='font-bold text-black text-center'>Address</span>
    }
];
