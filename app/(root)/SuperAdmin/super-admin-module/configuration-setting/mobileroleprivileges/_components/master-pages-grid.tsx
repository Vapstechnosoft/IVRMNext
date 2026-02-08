'use client';

import { InputText } from '@/components/ui/extension/input-text';
import { Checkbox } from '@/components/ui/checkbox';
import { IMobileRolePrivilege } from '@/types/super-admin/configuration-setting/mobileroleprivileges';
import { useState } from 'react';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { ColumnDef } from '@tanstack/react-table';

interface MasterPagesGridProps {
    data: IMobileRolePrivilege[];
    onSelect: (item: IMobileRolePrivilege, isChecked: boolean) => void;
}

export function MasterPagesGrid({ data, onSelect }: MasterPagesGridProps) {
    if (!data || data.length === 0) return null;

    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 1,
        pageSize: 10,
    });

    const filteredData = data.filter(item =>
        item.ivrmmaP_AppPageName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: ColumnDef<IMobileRolePrivilege>[] = [
        {
            id: 'serialNumber',
            header: 'SL.NO',
            cell: ({ row }) => {
                return (
                    <div>
                        {(pagination.pageIndex - 1) * pagination.pageSize + row.index + 1}
                    </div>
                );
            },
        },
        {
            accessorKey: 'ivrmmaP_AppPageName',
            header: 'Page Name',
        },
        {
            id: 'actions',
            header: 'Select',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex justify-center">
                        <Checkbox
                            checked={item.checked || false}
                            onCheckedChange={(c) => onSelect(item, c as boolean)}
                        />
                    </div>
                );
            },
        },
    ];

    return (
        <div className="border rounded-xl shadow-md bg-white overflow-hidden border-slate-200">
            <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-6 bg-[#7C3AED] rounded-full"></span>
                    Available Master Pages
                </h3>
                <div className="w-72">
                    <InputText
                        placeholder="Search pages..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPagination(prev => ({ ...prev, pageIndex: 1 }));
                        }}
                        className="bg-white border-slate-200"
                    />
                </div>
            </div>
            <div className="p-4">
                <GenericDataTable
                    columns={columns}
                    data={filteredData}
                    isLoading={false}
                    isPaginationRequired={true}
                    totalItems={filteredData.length}
                />
            </div>
        </div>
    );
}
