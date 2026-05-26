'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import type { IPrivilegePage } from '@/types/super-admin/super-admin-module/general-setting/privileges';
import type { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';

interface MasterPagesGridProps {
    data: IPrivilegePage[];
    onSelect: (item: IPrivilegePage, isChecked: boolean) => void;
}

export function MasterPagesGrid({ data, onSelect }: MasterPagesGridProps) {
    if (!data || data.length === 0) return null;

    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 1,
        pageSize: 10
    });

    const filteredData = data.filter((item) => item.ivrmmP_PageName.toLowerCase().includes(searchTerm.toLowerCase()));

    const _paginatedData = filteredData.slice((pagination.pageIndex - 1) * pagination.pageSize, pagination.pageIndex * pagination.pageSize);

    const _columns: ColumnDef<IPrivilegePage>[] = [
        {
            id: 'serialNumber',
            header: 'SL.NO',
            cell: ({ row }) => {
                return <div>{(pagination.pageIndex - 1) * pagination.pageSize + row.index + 1}</div>;
            }
        },
        {
            accessorKey: 'ivrmmP_PageName',
            header: 'Page Name'
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className='flex justify-center'>
                        <label title='Add Cart' className='cursor-pointer'>
                            <Checkbox checked={item.checked || false} onCheckedChange={(c) => onSelect(item, c as boolean)} />
                        </label>
                    </div>
                );
            }
        }
    ];

    return (
        <div className='mb-4 rounded-md border bg-white shadow-sm'>
            <div className='flex items-center justify-between border-b bg-gray-50 p-3'>
                <h3 className='font-semibold'>Master Pages</h3>
                <div className='w-64'>
                    <InputText
                        placeholder='Search here...'
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPagination((prev) => ({ ...prev, pageIndex: 1 }));
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
