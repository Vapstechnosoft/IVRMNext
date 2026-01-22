'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useHomeWork } from '@/hooks/upload/transactions/useHomeWork';
import type { IHomeWork } from '@/schemas/upload/transactions/ivrm-homework.schema';
import { Loader2, Plus, X } from 'lucide-react';
import { Suspense } from 'react';
import AddHomeWorkForm from './_components/add-form';
import { homeWorkColumns } from './_components/columns';
import UpdateHomeWorkForm from './_components/update-form';
import { deleteHomeWork } from '@/server/upload/transactions/ivrm-homework/server-action';
import { toast } from 'sonner';

export default function HomeWorkPage() {
    return (
        <Suspense fallback={<div className='flex h-full items-center justify-center'><Loader2 className='h-8 w-8 animate-spin' /></div>}>
            <HomeWorkContent />
        </Suspense>
    );
}

function HomeWorkContent() {
    const { data, isLoading, error, refetchAll } = useHomeWork();

    return (
        <FormProvider<IHomeWork>>
            <HomeWorkManager
                data={data}
                isLoading={isLoading}
                error={error}
                refetchAll={refetchAll}
            />
        </FormProvider>
    );
}

function HomeWorkManager({
    data,
    isLoading,
    error,
    refetchAll
}: {
    data: any;
    isLoading: boolean;
    error: any;
    refetchAll: () => void;
}) {
    const { openAddForm, isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } = useFormContext<IHomeWork>();

    const tableProps = {
        data: data?.classwork || [],
        isLoading,
        error
    };

    const handleToggle = async (row: IHomeWork) => {
        if (!row.ihW_Id) return;
        try {
            const result = await deleteHomeWork(row.ihW_Id);
            if (result.success) {
                toast.success(result.message);
                refetchAll();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to toggle status');
        }
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add HomeWork
                    </Button>
                </div>

                <CollapsibleSection
                    title='Home Work Upload'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg'>
                    <GenericDataTable<IHomeWork>
                        {...tableProps}
                        columns={homeWorkColumns as any}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading homework...'
                        noDataTitle='No HomeWork Found'
                        noDataDescription='Get started by creating your first homework entry'
                        errorTitle='Error Loading HomeWork'
                    />
                </CollapsibleSection>

                {isAddFormOpen && (
                    <div ref={addFormRef}>
                        <CollapsibleSection
                            title='Add New HomeWork'
                            defaultOpen={true}
                            variant='outline'
                            className='slide-in-from-top-4 animate-in shadow-lg'>
                            <div className='relative'>
                                <Button
                                    type='button'
                                    onClick={closeAddForm}
                                    variant='ghost'
                                    size='sm'
                                    className='absolute -top-12 right-0 border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive' /> Close
                                </Button>
                                <AddHomeWorkForm
                                    onSuccess={() => { closeAddForm(); refetchAll(); }}
                                    yearList={data?.yearlist || []}
                                    classList={data?.classlist || []}
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}

                {isEditFormOpen && selectedRow && (
                    <div ref={editFormRef}>
                        <CollapsibleSection
                            title='Edit HomeWork'
                            defaultOpen={true}
                            variant='outline'
                            className='slide-in-from-top-4 animate-in shadow-lg'>
                            <div className='relative'>
                                <Button
                                    type='button'
                                    onClick={closeEditForm}
                                    variant='ghost'
                                    size='sm'
                                    className='absolute -top-12 right-0 border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive' /> Close
                                </Button>
                                <UpdateHomeWorkForm
                                    selectedRow={selectedRow}
                                    onSuccess={() => { closeEditForm(); refetchAll(); }}
                                    yearList={data?.yearlist || []}
                                    classList={data?.classlist || []}
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
