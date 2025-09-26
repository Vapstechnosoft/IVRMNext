'use client';

import { Heading } from '@/components/layout/heading';
import { DataTable } from '@/components/ui/data-table/data-table';
import { useMasterCategory } from '@/hooks/admission/preadmission/useMasters';
import { Database, Plus, RefreshCw, X } from 'lucide-react';
import { use, useRef, useState } from 'react';
import AddMasterCategoryForm from './_components/add-form';
import UpdateMasterCategoryForm from './_components/update-form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Button } from '@/components/ui/button';
import type { IMasterCategoryList } from '@/types/admission/preadmission/masters';
import { createMasterCategoryColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterCategoryPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<IMasterCategoryList | null>(null);
    const addFormRef = useRef<HTMLDivElement>(null);
    const editFormRef = useRef<HTMLDivElement>(null);

    const handleAddClick = () => {
        // Close edit form if open
        setIsEditFormOpen(false);
        setSelectedRow(null);

        setIsAddFormOpen(true);
        setTimeout(() => {
            addFormRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 100);
    };

    const handleEditClick = (row: IMasterCategoryList) => {
        // Close add form if open
        setIsAddFormOpen(false);

        setSelectedRow(row);
        setIsEditFormOpen(true);
        setTimeout(() => {
            editFormRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 100);
    };

    const handleAddFormClose = () => {
        setIsAddFormOpen(false);
    };

    const handleEditFormClose = () => {
        setIsEditFormOpen(false);
        setSelectedRow(null);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Master Category Management' description='' />
                    </div>
                    <Button
                        type='button'
                        onClick={handleAddClick}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Master Class
                    </Button>
                </div>

                {/* Data Table Section - Collapsible but default open */}
                <CollapsibleSection
                    title='Master Category Data'
                    description='View, search, and manage all master classes in the system'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    keepContentMounted={false}>
                    <MasterCategoryTable searchParams={searchParams} onEditClick={handleEditClick} />
                </CollapsibleSection>

                {/* Add Form Section - Conditionally Rendered */}
                {isAddFormOpen && (
                    <div ref={addFormRef} className='slide-in-from-top-4 animate-in duration-300'>
                        <CollapsibleSection
                            title='Add New Master Class'
                            description='Fill in the details below to create a new master class'
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='shadow-lg'>
                            <div className='relative'>
                                <Button
                                    type='button'
                                    onClick={handleAddFormClose}
                                    variant='ghost'
                                    size='sm'
                                    className='-top-[4rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive' /> Close
                                </Button>
                                <AddMasterCategoryForm onSuccess={handleAddFormClose} className='max-w-full' />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}

                {/* Edit Form Section - Conditionally Rendered */}
                {/* {isEditFormOpen && selectedRow && (
                    <div ref={editFormRef} className='slide-in-from-top-4 animate-in duration-300'>
                        <CollapsibleSection
                            title='Edit Master Class'
                            description={`Update details for ${selectedRow.asmcL_ClassName} (${selectedRow.asmcL_ClassCode})`}
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='border-primary/20 shadow-lg'>
                            <div className='relative'>
                                <Button
                                    type='button'
                                    onClick={handleEditFormClose}
                                    variant='ghost'
                                    size='sm'
                                    className='-top-[4rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive' /> Close
                                </Button>
                                <UpdateMasterCategoryForm
                                    selectedRow={selectedRow}
                                    onSuccess={handleEditFormClose}
                                    className='max-w-full'
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
                )} */}
            </div>
        </div>
    );
}

function MasterCategoryTable({
    searchParams,
    onEditClick
}: {
    searchParams: any;
    onEditClick: (row: IMasterCategoryList) => void;
}) {
    const { data: response, isLoading: loading, error } = useMasterCategory(searchParams);

    const responseData = response?.data || [];
    const totalItems = response?.total || 0;

    const columnsWithEditHandler = createMasterCategoryColumns(onEditClick);

    if (loading) {
        return (
            <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                <RefreshCw className='h-8 w-8 animate-spin text-primary' />
                <p className='text-muted-foreground text-sm'>Loading master classes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                <div className='rounded-full bg-destructive/10 p-3'>
                    <Database className='h-6 w-6 text-destructive' />
                </div>
                <div className='space-y-2 text-center'>
                    <h3 className='font-semibold text-destructive'>Error Loading Data</h3>
                    <p className='text-muted-foreground text-sm'>{error?.message || 'Failed to load master classes'}</p>
                </div>
            </div>
        );
    }

    if (!response?.success) {
        return (
            <div className='flex flex-col items-center justify-center py-12 space-y-4'>
                <div className='rounded-full bg-destructive/10 p-3'>
                    <Database className='h-6 w-6 text-destructive' />
                </div>
                <div className='text-center space-y-2'>
                    <h3 className='font-semibold text-destructive'>Request Failed</h3>
                    <p className='text-sm text-muted-foreground'>{response?.message || 'Failed to fetch master classes'}</p>
                </div>
            </div>
        );
    }

    if (responseData.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center py-12 space-y-4'>
                <div className='rounded-full bg-muted p-3'>
                    <Database className='h-6 w-6 text-muted-foreground' />
                </div>
                <div className='text-center space-y-2'>
                    <h3 className='font-semibold'>No Master Classes Found</h3>
                    <p className='text-sm text-muted-foreground'>Get started by creating your first master class</p>
                </div>
            </div>
        );
    }

    return (
        <div className='overflow-hidden rounded-lg bg-card'>
            <DataTable
                isLoading={false}
                columns={columnsWithEditHandler}
                data={responseData}
                totalItems={totalItems}
                showViewOptions={true}
                columnPinning={{ right: ['actions'] }}
            />
        </div>
    );
}
