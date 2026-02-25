'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Plus, X } from 'lucide-react';
import { type IConsecutiveConstraintList, columns } from './columns';
import ConsecutiveConstraintsForm from './consecutive-constraints-form';
import ToggleConsecutiveConstraintsForm from './toggle-form';

interface ConsecutiveConstraintsProps {
    response: any;
    isLoading: boolean;
    error: any;
    refetchAll: () => Promise<any>;
}

export default function ConsecutiveConstraints({ response, isLoading, error, refetchAll }: ConsecutiveConstraintsProps) {
    return <ConsecutiveConstraintsContent response={response} isLoading={isLoading} error={error} refetchAll={refetchAll} />;
}

function ConsecutiveConstraintsContent({ response, isLoading, error, refetchAll }: ConsecutiveConstraintsProps) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        openAddForm,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<IConsecutiveConstraintList>();

    const dataList = response?.consecutivelst || [];
    const tableProps = useDataTableProps(response);

    const handleSuccess = () => {
        closeAddForm();
        closeEditForm();
        refetchAll();
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    {!isAddFormOpen && !isEditFormOpen && (
                        <Button
                            type='button'
                            onClick={openAddForm}
                            className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            <Plus className='h-4 w-4' />
                            Add Consecutive Constraints
                        </Button>
                    )}
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IConsecutiveConstraintList>
                        {...tableProps}
                        data={dataList}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading constraints...'
                        noDataTitle='No Consecutive Constraints Found'
                        noDataDescription='Add a new constraint to get started'
                    />
                </CollapsibleSection>

                {/* Forms Section - Below Table as requested */}

                {isAddFormOpen && (
                    <div ref={addFormRef}>
                        <CollapsibleSection
                            title='Add Consecutive Constraints'
                            description='Fill in the details below'
                            defaultOpen={true}
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
                                <ConsecutiveConstraintsForm initialData={response} onSuccess={handleSuccess} onCancel={closeAddForm} />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}

                {isEditFormOpen && selectedRow && (
                    <div ref={editFormRef}>
                        <CollapsibleSection
                            title='Edit Consecutive Constraints'
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
                                <ConsecutiveConstraintsForm
                                    initialData={response}
                                    editData={selectedRow}
                                    onSuccess={handleSuccess}
                                    onCancel={closeEditForm}
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}

                {isToggleFormOpen && selectedRow && <ToggleConsecutiveConstraintsForm rowData={selectedRow} onClose={closeToggleForm} />}
            </div>
        </div>
    );
}
