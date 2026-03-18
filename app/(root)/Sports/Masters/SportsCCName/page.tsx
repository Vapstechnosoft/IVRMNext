'use client';

import { use, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { createColumns } from './_components/columns';
import { AddForm } from './_components/add-form';
import { UpdateForm } from './_components/update-form';
import { ToggleForm } from './_components/toggle-form';
import { SportsCCNameDTO } from '@/types/sports/masters/sports-cc-name';
import { useSportsCCName } from '@/hooks/sports/useSportsCCName';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function SportsCCNamePage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deletingActiveFlag, setDeletingActiveFlag] = useState<boolean>(false);

    const { data: response, isLoading, refetchAll } = useSportsCCName(searchParams);

    const data = response?.data?.sportsccName || [];
    const groupNameList = response?.data?.groupNameList || [];
    const totalItems = response?.total || response?.data?.count || data.length;

    const handleEdit = (item: SportsCCNameDTO) => {
        setEditingId(item.spccmscC_Id);
        setIsAdding(true);
    };

    const handleDelete = (row: SportsCCNameDTO) => {
        setDeletingId(row.spccmscC_Id);
        setDeletingActiveFlag(!!row.spccmscC_ActiveFlag);
    };

    const handleSuccess = () => {
        setIsAdding(false);
        setEditingId(null);
        setDeletingId(null);
        refetchAll();
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setDeletingId(null);
    };

    const columns = createColumns({ onEdit: handleEdit, onDelete: handleDelete });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Master SportsCC Name</h1>
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add New
                    </Button>
                )}
            </div>

            {isAdding ? (
                <div className="border rounded-lg p-6 bg-card">
                    {editingId ? (
                        <UpdateForm
                            id={editingId}
                            onSuccess={handleSuccess}
                            onCancel={handleCancel}
                            groupNameList={groupNameList}
                        />
                    ) : (
                        <AddForm
                            onSuccess={handleSuccess}
                            onCancel={handleCancel}
                            groupNameList={groupNameList}
                        />
                    )}
                </div>
            ) : (
                <div className="border rounded-lg bg-card overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={data}
                        totalItems={totalItems}
                        isLoading={isLoading}
                        manualPagination={true}
                        manualSorting={true}
                        manualFiltering={true}
                    />
                </div>
            )}

            {deletingId && (
                <ToggleForm
                    id={deletingId}
                    activeFlag={deletingActiveFlag}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
}
