'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterLibraryList } from '@/types/library/masters/masters';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { useEffect } from 'react';
import AddMasterLibraryForm from './add-form';
import { masterLibraryColumns } from './columns';
import ToggleMasterLibraryForm from './toggle-form';
import UpdateMasterLibraryForm from './update-form';

export default function LibraryCreationTab({
    response,
    isLoading,
    error,
    refetch
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetch: () => void;
}) {
    const { openAddForm } = useFormContext<IMasterLibraryList>();
    const tableProps = useDataTableProps(
        Array.isArray(response)
            ? { data: response, success: true }
            : response?.data?.liballdata
              ? { ...response, data: response.data.liballdata }
              : response?.data?.list
                ? { ...response, data: response.data.list }
                : response?.alldata
                  ? { ...response, data: response.alldata }
                  : response?.get_master_library
                    ? { ...response, data: response.get_master_library }
                    : response?.['master-library-list']
                      ? { ...response, data: response['master-library-list'] }
                      : response
    );

    return (
        <div className='space-y-4'>
            {/* Header */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='space-y-1' />

                <Button
                    type='button'
                    onClick={openAddForm}
                    className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                    <Plus className='h-4 w-4' />
                    Add Master Library
                </Button>
            </div>

            {/* Data Table Section */}
            <CollapsibleSection
                defaultOpen
                title='LIBRARY LIST'
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<IMasterLibraryList>
                    {...tableProps}
                    columns={masterLibraryColumns}
                    isLoading={isLoading}
                    error={error}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading Master Library...'
                    noDataTitle='No Records Found'
                    noDataDescription='Start by adding a new Master Library'
                    errorTitle='Error Loading Data'
                />
            </CollapsibleSection>

            {/* Forms */}
            <FormSections refetch={refetch} />
        </div>
    );
}

function FormSections({ refetch }: { refetch: () => void }) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        closeAddForm,
        closeToggleForm,
        closeEditForm,
        addFormRef,
        editFormRef
    } = useFormContext<IMasterLibraryList>();

    useEffect(() => {
        if (isEditFormOpen && !selectedRow) {
            console.error('FormSections: Edit form open but selectedRow is undefined');
        }
    }, [isEditFormOpen, selectedRow]);

    const queryClient = useQueryClient();
    const handleSuccess = () => {
        refetch();
        queryClient.invalidateQueries({ queryKey: ['MASTER_LIBRARY_LIST'] });
    };

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Master Library'
                        description='Fill in the details below to create a new mapping'
                        defaultOpen
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <AddMasterLibraryForm
                                onSuccess={() => {
                                    handleSuccess();
                                    closeAddForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleMasterLibraryForm rowData={selectedRow} onClose={closeToggleForm} />}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Master Library'
                        description='Update the Master Library details below'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateMasterLibraryForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
