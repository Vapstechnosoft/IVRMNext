'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Search as SearchIcon } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { IMobilePrivilegeRecord } from '@/types/super-admin/configuration-setting/mobileroleprivileges';

interface MobileRolePrivilegeListGridProps {
    data: IMobilePrivilegeRecord[];
    totalCount: number;
    onDelete: (item: IMobilePrivilegeRecord) => void;
    isLoading?: boolean;
}

export function MobileRolePrivilegeListGrid({
    data,
    totalCount,
    onDelete,
    isLoading
}: MobileRolePrivilegeListGridProps) {
    const columns: ColumnDef<IMobilePrivilegeRecord>[] = useMemo(() => [
        {
            id: 'sno',
            header: 'SL.NO',
            cell: ({ row }) => row.index + 1, // DataTable handles pagination context or we can add it if needed
        },
        {
            accessorKey: 'institutename',
            header: 'Institution',
        },
        {
            accessorKey: 'ivrmrT_Role',
            header: 'Role Name',
        },
        {
            accessorKey: 'ivrmmaP_AppPageName',
            header: 'Page Name',
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                        onClick={() => onDelete(row.original)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ], [onDelete]);

    return (
        <Card className="w-full shadow-xl border-t-4 border-[#7C3AED] hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-slate-50/50 pb-4">
                <CardTitle className="text-xl font-bold flex items-center text-slate-800">
                    <div className="w-2 h-8 bg-[#7C3AED] rounded-full mr-3" />
                    Mobile APP Rolewise Module Page list
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <DataTable
                    columns={columns}
                    data={data}
                    totalItems={totalCount}
                    isLoading={isLoading}
                    isSearchRequired={true}
                    isPaginationRequired={true}
                />
            </CardContent>
        </Card>
    );
}
