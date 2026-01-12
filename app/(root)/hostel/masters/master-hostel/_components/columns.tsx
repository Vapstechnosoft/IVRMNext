'use client';

import { DataTableColumnHeader as ColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IHostel } from '@/server/hostel/master-hostel/server-action';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { Eye } from 'lucide-react';

export interface IHostelDisplay extends IHostel {
    ivrmmC_CountryName?: string;
    ivrmmS_Name?: string;
}

const columnHelper = createColumnHelper<IHostelDisplay>();

export const masterHostelColumns: ColumnDef<IHostelDisplay, any>[] = [
    columnHelper.display({
        id: 'sn',
        header: 'SL NO',
        cell: (info) => info.row.index + 1,
        enableSorting: false
    }),
    columnHelper.accessor('hlmH_Name', {
        header: ({ column }) => <ColumnHeader column={column} title='Hostel Name' />
    }),
    columnHelper.accessor('hlmH_TotalFloor', {
        header: ({ column }) => <ColumnHeader column={column} title='Total Floor' />
    }),
    columnHelper.accessor('hlmH_TotalRoom', {
        header: ({ column }) => <ColumnHeader column={column} title='Total Room' />
    }),
    columnHelper.accessor('ivrmmC_CountryName', {
        header: ({ column }) => <ColumnHeader column={column} title='Country' />
    }),
    columnHelper.accessor('ivrmmS_Name', {
        header: ({ column }) => <ColumnHeader column={column} title='State' />
    }),
    columnHelper.accessor('hlmH_City', {
        header: ({ column }) => <ColumnHeader column={column} title='City' />
    }),
    columnHelper.accessor('hlmH_ContactNo', {
        header: ({ column }) => <ColumnHeader column={column} title='Contact' />
    }),
    columnHelper.accessor('hlmH_Address', {
        header: ({ column }) => <ColumnHeader column={column} title='Address' />
    }),
    columnHelper.display({
        id: 'facilityList',
        header: 'Facility List',
        cell: (info) => <ViewFacilitiesCell rowData={info.row.original} />
    }),
    columnHelper.display({
        id: 'wardenList',
        header: 'Warden List',
        cell: (info) => <ViewWardensCell rowData={info.row.original} />
    }),
    columnHelper.display({
        id: 'view',
        header: 'View',
        cell: (info) => <ViewDocumentsCell rowData={info.row.original} />
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => <ActionButtonsCell rowData={info.row.original} />
    })
];

import { useState } from 'react';
import { ViewDocumentsModal, ViewFacilitiesModal, ViewWardensModal } from './view-modals';

// ... (existing imports and interface)

// ... (existing columns definitions up to ViewFacilitiesCell)

function ViewFacilitiesCell({ rowData }: { rowData: IHostelDisplay }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <button
                type='button'
                className='flex items-center gap-1 text-primary hover:text-blue-600 hover:underline'
                onClick={() => setIsOpen(true)}>
                <Eye className='h-4 w-4' /> View Facility
            </button>
            {isOpen && <ViewFacilitiesModal isOpen={isOpen} onClose={() => setIsOpen(false)} hostel={rowData} />}
        </>
    );
}

function ViewWardensCell({ rowData }: { rowData: IHostelDisplay }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <button
                type='button'
                className='flex items-center gap-1 text-primary hover:text-blue-600 hover:underline'
                onClick={() => setIsOpen(true)}>
                <Eye className='h-4 w-4' /> View Emps
            </button>
            {isOpen && <ViewWardensModal isOpen={isOpen} onClose={() => setIsOpen(false)} hostel={rowData} />}
        </>
    );
}

function ViewDocumentsCell({ rowData }: { rowData: IHostelDisplay }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <button
                type='button'
                className='flex items-center gap-1 text-primary hover:text-blue-600 hover:underline'
                onClick={() => setIsOpen(true)}>
                <Eye className='h-4 w-4' />
            </button>
            {isOpen && <ViewDocumentsModal isOpen={isOpen} onClose={() => setIsOpen(false)} hostel={rowData} />}
        </>
    );
}

function ActionButtonsCell({ rowData }: { rowData: IHostelDisplay }) {
    const { openEditForm, openToggleForm } = useFormContext<IHostelDisplay>();
    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={openEditForm}
            onToggle={openToggleForm}
            toggleConditionKey='hlmH_ActiveFlag'
        />
    );
}
