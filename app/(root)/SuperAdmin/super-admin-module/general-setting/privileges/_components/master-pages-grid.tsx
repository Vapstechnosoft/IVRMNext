'use client';

import { InputText } from '@/components/ui/extension/input-text';
import { Checkbox } from '@/components/ui/checkbox';
import { IPrivilegePage } from '@/types/super-admin/super-admin-module/general-setting/privileges';
import { useState, useMemo } from 'react';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { ColumnDef } from '@tanstack/react-table';

interface MasterPagesGridProps {
    data: IPrivilegePage[];
    onSelect: (item: IPrivilegePage, isChecked: boolean) => void;
}

export function MasterPagesGrid({ data, onSelect }: MasterPagesGridProps) {
    if (!data || data.length === 0) return null;

    const [searchTerm, setSearchTerm] = useState('');
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        return (data || []).filter(item =>
            item.ivrmmP_PageName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    const paginatedData = useMemo(() => {
        const start = (pageIndex - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, pageIndex, pageSize]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPageIndex(1);
    };

    const handlePageChange = (page: number) => {
        setPageIndex(page);
    };

    const columns: ColumnDef<IPrivilegePage>[] = [
        {
            id: 'serialNumber',
            header: 'SL.NO',
            cell: ({ row }) => {
                return (
                    <div>
                        {(pageIndex - 1) * pageSize + row.index + 1}
                    </div>
                );
            },
        },
        {
            accessorKey: 'ivrmmP_PageName',
            header: 'Page Name',
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex justify-center">
                        <label title="Add Cart" className="cursor-pointer">
                            <Checkbox
                                checked={item.checked || false}
                                onCheckedChange={(c) => onSelect(item, c as boolean)}
                            />
                        </label>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="border rounded-md shadow-sm bg-white mb-4">
            <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold">Master Pages</h3>
                <div className="w-64">
                    <InputText
                        placeholder="Search here..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>
            <div className="p-4">
                <GenericDataTable
                    columns={columns}
                    data={paginatedData}
                    totalItems={filteredData.length}
                    isLoading={false}
                    isSearchRequired={false}
                    isPaginationRequired={true}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}
