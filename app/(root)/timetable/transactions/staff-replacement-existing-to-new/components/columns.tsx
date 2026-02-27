import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { StaffReplacementGridData } from '@/types/timetable/Transaction/staff-replacement-existing-to-new';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<StaffReplacementGridData>[] = [
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
    //         <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    //     size: 24
    // },
    {
        id: 'sno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='S.No' />,
        cell: ({ row }) => <div className='pl-4'>{row.index + 1}</div>,
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'ttmC_CategoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
        cell: ({ row }) => <div>{row.getValue('ttmC_CategoryName')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassName')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        cell: ({ row }) => <div>{row.getValue('asmC_SectionName')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'staffName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Staff' />,
        cell: ({ row }) => <div>{row.getValue('staffName')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />,
        cell: ({ row }) => <div>{row.getValue('ismS_SubjectName')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'ttmP_PeriodName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Period' />,
        cell: ({ row }) => <div>{row.getValue('ttmP_PeriodName')}</div>,
        enableSorting: true,
        enableHiding: false
    }
];
