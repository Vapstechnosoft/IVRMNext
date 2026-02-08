'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { createColumns } from './_components/columns';
import { AddForm } from './_components/add-form';
import { getSportsCCNameData, deleteSportsCCName } from '@/actions/sports/masters/sports-cc-name';
import { SportsCCNameDTO } from '@/types/sports/masters/sports-cc-name';
import { toast } from 'sonner';

export default function SportsCCNamePage() {
    const [isAdding, setIsAdding] = useState(false);
    const [editingData, setEditingData] = useState<SportsCCNameDTO | null>(null);
    const [data, setData] = useState<SportsCCNameDTO[]>([]);

    const loadData = async () => {
        const result = await getSportsCCNameData();
        setData(result);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleEdit = (item: SportsCCNameDTO) => {
        setEditingData(item);
        setIsAdding(true);
    };

    const handleDelete = async (id: number, activeFlag: boolean) => {
        try {
            const result = await deleteSportsCCName(id, activeFlag);
            if (result.success) {
                toast.success(result.message);
                loadData();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        }
    };

    const handleSuccess = () => {
        setIsAdding(false);
        setEditingData(null);
        loadData();
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingData(null);
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
                    <AddForm
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                        initialData={editingData}
                    />
                </div>
            ) : (
                <div className="border rounded-lg bg-card">
                    <DataTable columns={columns} data={data} totalItems={data.length} />
                </div>
            )}
        </div>
    );
}
