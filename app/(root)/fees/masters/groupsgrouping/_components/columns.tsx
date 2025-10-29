// _components/columns.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterGroupsGrouping } from '@/types/fees/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback, useState } from 'react';

export const feegroupgroupingColoumn: ColumnDef<IMasterGroupsGrouping>[] = [
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
        accessorKey: 'fmgG_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
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
        accessorKey: 'fmgG_GroupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Name' />,
        cell: ({ row }) => {
            const value = row.getValue('fmgG_GroupName') as string;
            return <div className='font-medium'>{value || '—'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmgG_GroupCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Code' />,
        cell: ({ row }) => {
            const raw = row.getValue('fmgG_GroupCode');
            const value = raw === undefined || raw === null ? '—' : String(raw);
            return <div>{value}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },

    {
        accessorKey: 'selectedFeeGroupIds',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Group IDs' />,
        cell: ({ row }) => {
            const ids = row.getValue('selectedFeeGroupIds') as number[];
            const count = ids?.length || 0;
            return <SelectedFeeGroupsCell ids={ids} count={count} />;
        },
        enableSorting: false,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

// Selected Fee Groups View Modal
function SelectedFeeGroupsCell({
    ids,
    count
}: {
    ids: number[];
    count: number;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className='flex items-center gap-2'>
                <Button variant='ghost' size='sm' onClick={() => setOpen(true)} className='h-7 px-2 text-xs' disabled={count === 0}>
                    <Eye className='mr-1 h-3 w-3' />
                    View ({count})
                </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Selected Fee Group IDs ({count})</DialogTitle>
                    </DialogHeader>
                    <div className='max-h-96 space-y-2 overflow-y-auto'>
                        {ids && ids.length > 0 ? (
                            <ul className='list-inside list-disc space-y-1 text-sm'>
                                {ids.map((id) => (
                                    <li key={id} className='text-foreground'>
                                        Fee Group ID: <span className='font-mono font-semibold'>{id}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className='text-muted-foreground text-sm'>No fee groups selected.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

// Action Buttons (Edit, Toggle, Delete)
function ActionButtonsCell({ rowData }: { rowData: IMasterGroupsGrouping }) {
    const { openEditForm, openDeleteForm } = useFormContext<IMasterGroupsGrouping>();

    const handleEdit = useCallback((data: IMasterGroupsGrouping) => openEditForm(data), [openEditForm]);

    const handleDelete = useCallback((data: IMasterGroupsGrouping) => openDeleteForm(data), [openDeleteForm]);

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: false, delete: true }}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    );
}
