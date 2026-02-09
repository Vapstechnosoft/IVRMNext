'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';

import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface IConsecutiveConstraintList {
    ttC_Id: number;
    asmayYear: string;
    categoryName: string;
    noOfPeriods: number;
    className: string;
    sectionName: string;
    staffName: string;
    subjectName: string;
    ttC_ActiveFlag: boolean;
}

export const columns: ColumnDef<IConsecutiveConstraintList>[] = [
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
        accessorKey: 'ttmD_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'ttmD_DayName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Day Name' />,
        cell: ({ row }) => <div>{row.getValue('ttmD_DayName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ttmD_DayCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Day Code' />,
        cell: ({ row }) => <div>{row.getValue('ttmD_DayCode')}</div>,
        enableSorting: true,
        enableHiding: true
    },

    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IConsecutiveConstraintList }) {
    const { openEditForm, openToggleForm } = useFormContext<IConsecutiveConstraintList>();

    const handleEdit = useCallback(
        (data: IConsecutiveConstraintList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IConsecutiveConstraintList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='ttmD_ActiveFlag'
        />
    );
}

// export const columns: ColumnDef<IConsecutiveConstraintList>[] = [
//     {
//         accessorKey: 'asmayYear',
//         header: 'Academic Year'
//     },
//     {
//         accessorKey: 'categoryName',
//         header: 'Category'
//     },
//     {
//         accessorKey: 'className',
//         header: 'Class'
//     },
//     {
//         accessorKey: 'sectionName',
//         header: 'Section'
//     },
//     {
//         accessorKey: 'staffName',
//         header: 'Staff'
//     },
//     {
//         accessorKey: 'subjectName',
//         header: 'Subject'
//     },
//     {
//         accessorKey: 'ttC_NoOfPeriods',
//         header: 'Total Periods'
//     },
//     {
//         id: 'actions',
//         header: 'Actions',
//         cell: ({ row }) => {
//             const { openEditForm } = useFormContext();

//             const handleDelete = async () => {
//                 if (confirm('Are you sure you want to delete this record?')) {
//                     try {
//                         const res = await deleteConsecutiveConstraints(row.original.ttC_Id);
//                         if (res.returnval === true) {
//                             toast.success('Record Deleted Successfully');
//                             window.location.reload();
//                         } else {
//                             toast.error('Failed to Delete Record');
//                         }
//                     } catch (error) {
//                         console.error(error);
//                         toast.error('An error occurred while deleting');
//                     }
//                 }
//             };

//             const handleStatusChange = async (checked: boolean) => {
//                 try {
//                     const payload = { ...row.original, ttC_ActiveFlag: !checked };
//                     // API expects the whole object or specific ID/Flag? Controller says: expects entity
//                     // Swapping logic: checked=true means we want to active.
//                     // The component Switch checked state reflects current state.
//                     // OnChange, if it was true, it becomes false.

//                     // We need to send the object. existing logic:
//                     // apiService.create("Consecutive/deactivate", employee)
//                     const res = await deactivateConsecutiveConstraints(row.original);
//                     if (res.returnval === true) {
//                         toast.success(row.original.ttC_ActiveFlag ? 'Deactivated Successfully' : 'Activated Successfully');
//                         window.location.reload();
//                     } else {
//                         toast.error('Failed to Update Status');
//                     }
//                 } catch (error) {
//                     console.error(error);
//                     toast.error('An error occurred');
//                 }
//             };

//             return (
//                 <div className='flex items-center space-x-2'>
//                     <Button variant='ghost' size='icon' onClick={() => openEditForm(row.original)}>
//                         <Pencil className='h-4 w-4 text-blue-500' />
//                     </Button>
//                     <Switch checked={row.original.ttC_ActiveFlag} onCheckedChange={handleStatusChange} />
//                     <Button variant='ghost' size='icon' onClick={handleDelete}>
//                         <Trash2 className='h-4 w-4 text-red-500' />
//                     </Button>
//                 </div>
//             );
//         }
//     }
// ];
