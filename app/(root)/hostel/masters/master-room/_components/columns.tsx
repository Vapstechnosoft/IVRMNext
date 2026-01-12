'use client';

import { DataTableColumnHeader as ColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IRoomDisplay } from '@/server/hostel/master-room/server-action';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { ViewFacilitiesModal } from './view-modals';

const columnHelper = createColumnHelper<IRoomDisplay>();

export const masterRoomColumns: ColumnDef<IRoomDisplay, any>[] = [
    columnHelper.display({
        id: 'sn',
        header: 'SL NO',
        cell: (info) => info.row.index + 1,
        enableSorting: false
    }),
    columnHelper.accessor('hlmH_Name', {
        header: ({ column }) => <ColumnHeader column={column} title='Hostel Name' />
    }),
    columnHelper.accessor('hrmF_FloorName', {
        header: ({ column }) => <ColumnHeader column={column} title='Floor' />
    }),
    columnHelper.accessor('hlmrcA_RoomCategory', {
        header: ({ column }) => <ColumnHeader column={column} title='Room Category' />
    }),
    columnHelper.accessor('hrmrM_SharingFlg', {
        header: ({ column }) => <ColumnHeader column={column} title='Sharing' />,
        cell: (info) => (info.getValue() ? 'Yes' : 'No')
    }),
    columnHelper.accessor('hrmrM_ACFlg', {
        header: ({ column }) => <ColumnHeader column={column} title='Room Type' />,
        cell: (info) => (info.getValue() ? 'AC' : 'Non-AC')
    }),
    columnHelper.accessor('hrmrM_RoomNo', {
        header: ({ column }) => <ColumnHeader column={column} title='Room No.' />
    }),
    columnHelper.accessor('hrmrM_BedCapacity', {
        header: ({ column }) => <ColumnHeader column={column} title='Bed Capacity' />
    }),
    columnHelper.display({
        id: 'facilityList',
        header: 'Facility List',
        cell: (info) => <ViewFacilitiesCell rowData={info.row.original} />
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Action',
        cell: (info) => <ActionButtonsCell rowData={info.row.original} />
    })
];

function ViewFacilitiesCell({ rowData }: { rowData: IRoomDisplay }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <button
                type='button'
                className='flex items-center gap-1 text-primary hover:text-blue-600 hover:underline'
                onClick={() => setIsOpen(true)}>
                <Eye className='h-4 w-4' /> View Facility
            </button>
            {isOpen && <ViewFacilitiesModal isOpen={isOpen} onClose={() => setIsOpen(false)} room={rowData} />}
        </>
    );
}

function ActionButtonsCell({ rowData }: { rowData: IRoomDisplay }) {
    const { openEditForm, openToggleForm } = useFormContext<IRoomDisplay>();
    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={openEditForm}
            onToggle={openToggleForm}
            toggleConditionKey='hrmrM_ActiveFlag'
        />
    );
}
