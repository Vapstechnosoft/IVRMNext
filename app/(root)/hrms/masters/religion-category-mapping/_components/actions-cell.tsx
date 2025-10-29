'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useActivateDeactivateReligionCategoryMapping } from '@/hooks/hrms/useReligionCategoryMapping';
import type { ReligionCategoryMappingDetail } from '@/types/hrms/religion-category-mapping';
import type { Row } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Power } from 'lucide-react';

interface ActionsCellProps {
    row: Row<ReligionCategoryMappingDetail>;
}

export function ActionsCell({ row }: ActionsCellProps) {
    const mapping = row.original;
    const { openEditForm } = useFormContext<ReligionCategoryMappingDetail>();
    const { mutate: toggleStatus } = useActivateDeactivateReligionCategoryMapping();

    const handleEdit = () => {
        openEditForm(mapping);
    };

    const handleToggleStatus = () => {
        toggleStatus({
            IRCC_Id: mapping.IRCC_Id,
            IRCC_ActiveFlg: !mapping.IRCC_ActiveFlg
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                    <span className='sr-only'>Open menu</span>
                    <MoreHorizontal className='h-4 w-4' />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEdit}>
                    <Edit className='mr-2 h-4 w-4' />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleStatus}>
                    <Power className='mr-2 h-4 w-4' />
                    {mapping.IRCC_ActiveFlg ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
