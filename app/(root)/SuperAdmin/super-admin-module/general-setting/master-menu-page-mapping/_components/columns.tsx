'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { ColumnDef } from '@tanstack/react-table';
import { IMasterMenuPageMappingDTO } from '@/types/super-admin/super-admin-module/general-setting/master-menu-page-mapping';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useCallback } from 'react';

export const columns: ColumnDef<IMasterMenuPageMappingDTO>[] = [
    {
        accessorKey: 'slno',
        header: 'SL.NO',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'modulename',
        header: 'Module Name',
    },
    {
        accessorKey: 'menuname',
        header: 'Menu Name',
    },
    {
        accessorKey: 'submenuname',
        header: 'Sub Menu Name',
    },
    {
        accessorKey: 'pagename',
        header: 'Page Name',
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
    },
];

function ActionButtonsCell({ rowData }: { rowData: IMasterMenuPageMappingDTO }) {
    // We need to verify if useFormContext is available. It is wrapped in page.tsx.
    const { openDeleteForm } = useFormContext<IMasterMenuPageMappingDTO>();

    const handleDelete = useCallback(
        (data: IMasterMenuPageMappingDTO) => {
            openDeleteForm(data);
        },
        [openDeleteForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: false, delete: true, toggle: false }}
            onDelete={handleDelete}
        />
    );
}
