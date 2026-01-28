'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { IFloorDisplay } from '@/server/hostel/master-floor/server-action';
import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback, useState } from 'react';
import ViewFacilityModal from './view-facility-modal';

export const masterFloorColumns: ColumnDef<IFloorDisplay>[] = [
    {
        accessorKey: 'hlmF_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='w-full pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'hlmH_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Hostel Name' />,
        cell: ({ row }) => <div>{row.getValue('hlmH_Name')}</div>,
        enableSorting: true,
    },
    {
        accessorKey: 'hrmF_FloorName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Floor Name' />,
        cell: ({ row }) => <div>{row.getValue('hrmF_FloorName')}</div>,
        enableSorting: true,
    },
    {
        accessorKey: 'hrmF_TotalRooms',
        header: ({ column }) => <DataTableColumnHeader column={column} title='No Of Room' />,
        cell: ({ row }) => <div>{row.getValue('hrmF_TotalRooms')}</div>,
        enableSorting: true,
    },
    {
        accessorKey: 'hrmF_FloorDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
        cell: ({ row }) => <div>{row.getValue('hrmF_FloorDesc')}</div>,
        enableSorting: true,
    },
    {
        id: 'facilities',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Facility List' />,
        cell: ({ row }) => <ViewFacilityCell rowData={row.original} />,
        enableSorting: false,
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-center' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false,
    }
];

function ViewFacilityCell({ rowData }: { rowData: IFloorDisplay }) {
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 p-0 h-auto font-normal"
                onClick={() => setIsViewModalOpen(true)}
            >
                <Eye className="h-4 w-4 mr-1" /> View Facility
            </Button>
            {isViewModalOpen && (
                <ViewFacilityModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    floor={rowData}
                />
            )}
        </>
    );
}

function ActionButtonsCell({ rowData }: { rowData: IFloorDisplay }) {
    const { openToggleForm, openEditForm } = useFormContext<IFloorDisplay>();

    const handleToggle = useCallback(
        (data: IFloorDisplay) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleEdit = useCallback(
        (data: IFloorDisplay) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='hrmF_ActiveFlag'
        />
    );
}
