'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterOnlinePaymentHeadgroupList } from '@/types/fees/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const masterClassYearlyCategoryColumns: ColumnDef<IMasterOnlinePaymentHeadgroupList>[] = [
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
        accessorKey: 'fopM_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'className',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('className')}</div>
    },
    {
        accessorKey: 'submerchandId',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sub Merchant Id' />,
        cell: ({ row }) => <div>{row.getValue('submerchandId')}</div>
    },
    {
        accessorKey: 'groupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Name' />,
        cell: ({ row }) => <div>{row.getValue('groupName')}</div>
    },
    {
        accessorKey: 'headName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Head Name' />,
        cell: ({ row }) => <div>{row.getValue('headName')}</div>
    },
    {
        accessorKey: 'installmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment' />,
        cell: ({ row }) => <div>{row.getValue('installmentName')}</div>
    },
    {
        accessorKey: 'termName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Term' />,
        cell: ({ row }) => <div>{row.getValue('termName')}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({
    rowData
}: {
    rowData: IMasterOnlinePaymentHeadgroupList;
}) {
    const { openToggleForm, openEditForm } = useFormContext<IMasterOnlinePaymentHeadgroupList>();

    const handleToggle = useCallback((data: IMasterOnlinePaymentHeadgroupList) => openToggleForm(data), [openToggleForm]);

    const handleEdit = useCallback(
        async (data: IMasterOnlinePaymentHeadgroupList) => {
            try {
                const response = '';
                // const response = await getOnlinePaymentHeadGroupEdit(data.fopM_Id);

                //if (response.success && response.data && response.data.length > 0) {
                // const apiData = response.data[0];

                // const transformedData: SelectedRowData = {
                //   fopM_Id: apiData.fopM_Id,
                //   asmaY_Id: 176,
                //   asmcL_ID: apiData.asmcL_Id,
                //   className: data.className,
                //   fpgd_id: apiData.fpgd_id,
                //   fmg_id: apiData.fmg_id,
                //   groupName: data.groupName,
                //   fmh_HeadId: apiData.fmH_Id,
                //   fti_id: apiData.fti_id,
                //   installmentName: data.installmentName,
                //   fmt_id: apiData.fmt_id,
                //   institutionName: "vidya_vikas_vidya_samste",
                // };

                // openEditForm(transformedData);
                // } else {
                //   toast.error("Failed to fetch edit data");
                // }
            } catch (error) {
                console.error('Error fetching edit data:', error);
                toast.error('An error occurred while loading edit data');
            }
        },
        [openEditForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='fycC_ActiveFlag'
        />
    );
}
