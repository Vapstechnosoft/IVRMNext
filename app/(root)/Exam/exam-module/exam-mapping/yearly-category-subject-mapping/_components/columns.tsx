import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IYearlyCategorySubjectMapping } from '@/types/exam/exam-module/exam-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export const YearlyCategorySubjectMappingColumns: ColumnDef<IYearlyCategorySubjectMapping>[] = [
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
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        }
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>
    },
    {
        accessorKey: 'emcA_CategoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
        cell: ({ row }) => <div>{row.getValue('emcA_CategoryName')}</div>
    },
    {
        accessorKey: 'emG_GroupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group' />,
        cell: ({ row }) => <div>{row.getValue('emG_GroupName')}</div>
    },
    {
        accessorKey: 'emG_ElectiveFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Elective' />,
        cell: ({ row }) => <div>{row.original.emG_ElectiveFlg ? 'Yes' : 'No'}</div>
    },
    {
        accessorKey: 'eyC_BasedOnPaperTypeFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Based On Paper Type' />,
        cell: ({ row }) => <div>{row.original.eyC_BasedOnPaperTypeFlg ? 'Yes' : 'No'}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IYearlyCategorySubjectMapping }) {
    const { openEditForm, openDetailsView, openToggleForm } = useFormContext<IYearlyCategorySubjectMapping>();

    const handleEdit = useCallback(() => openEditForm(rowData), [openEditForm, rowData]);
    const handleView = useCallback(() => openDetailsView(rowData), [openDetailsView, rowData]);
    const handleToggle = useCallback(() => openToggleForm?.(rowData), [openToggleForm, rowData]);

    return (
        <div className='flex justify-center gap-2'>
            <button type='button' onClick={handleView} className='rounded-md p-2 transition hover:bg-muted' title='View Mapping Details'>
                <Eye className='h-4 w-4 text-blue-600' />
            </button>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, delete: false, toggle: true }}
                onEdit={handleEdit}
                onToggle={handleToggle}
                toggleConditionKey='eyC_ActiveFlg'
            />
        </div>
    );
}
