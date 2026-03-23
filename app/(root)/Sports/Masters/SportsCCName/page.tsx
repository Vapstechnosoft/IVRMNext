'use client';

import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createColumns } from './_components/columns';
import { AddForm } from './_components/add-form';
import { UpdateForm } from './_components/update-form';
import { ToggleForm } from './_components/toggle-form';
import { useSportsCCNames } from '@/hooks/sports/useSportsCCNames';
import type { SportsCCNameDTO } from '@/types/sports/masters/sports-cc-name';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function SportsCCNamePage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useSportsCCNames(searchParams);

    return (
        <SportsCCNamePageContent response={response} isLoading={isLoading} error={error} refetchAll={refetchAll} />
    );
}

import { useState } from 'react';

function SportsCCNamePageContent({
    response,
    isLoading,
    error,
    refetchAll
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetchAll: any;
}) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deletingActiveFlag, setDeletingActiveFlag] = useState<boolean>(false);

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
    const groupNameList = response?.data?.groupNameList || [];
    const tableData = response?.data?.sportsccName || [];
    const tableProps = {
        data: tableData,
        totalItems: tableData.length,
        success: response?.success,
        errorMessage: response?.message
    };

    return (
        <div className="container space-y-4 p-1">
            <div className="flex items-center justify-between">
                <Button onClick={() => setIsAdding(true)} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                    <Plus className="mr-2 h-4 w-4" /> Add Master SportsCC Name
                </Button>
            </div>

            <CollapsibleSection
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<SportsCCNameDTO>
                    {...tableProps}
                    columns={columns}
                    isLoading={isLoading}
                    error={error}
                    manualPagination={true}
                    manualSorting={true}
                    manualFiltering={true}
                    showSearchColumns={true}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading master sports cc names...'
                    noDataTitle='No Records Found'
                    errorTitle='Error Loading Names'
                />
            </CollapsibleSection>

            {isAdding && (
                <CollapsibleSection
                    title={editingId ? 'Edit Master SportsCC Name' : 'Add New Master SportsCC Name'}
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <div className='relative'>
                        <Button
                            type='button'
                            onClick={handleCancel}
                            variant='ghost'
                            size='sm'
                            className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                            <X className='h-4 w-4 text-destructive' /> Close
                        </Button>
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
                </CollapsibleSection>
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
