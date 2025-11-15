'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGrade } from '@/hooks/hrms/useMasters';
import type { GradeDetail } from '@/types/hrms/master-grade';
import { ListOrdered, Plus, Save, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { columns, getEditableColumns } from '../../grade/_components/columns';
import GradeForm from '../../grade/_components/grade-form';

export default function GradeTab() {
    const roleId = HRMS_MI_ID;
    const { listQuery, refetchAll } = useMasterGrade(roleId);

    return (
        <FormProvider<GradeDetail>>
            <GradeTabContent response={listQuery.data} isLoading={listQuery.isLoading} error={listQuery.error} refetch={refetchAll} />
        </FormProvider>
    );
}

function GradeTabContent({
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
    const { openAddForm } = useFormContext<GradeDetail>();
    const { saveOrderMutation } = useMasterGrade(HRMS_MI_ID);
    // Memoize array to prevent unnecessary re-renders
    const rows: GradeDetail[] = useMemo(() => response?.gradelList ?? [], [response?.gradelList]);

    const [isEditOrderMode, setIsEditOrderMode] = useState(false);
    const [editedRows, setEditedRows] = useState<GradeDetail[]>([]);

    const handleSetOrder = () => {
        setIsEditOrderMode(true);
        setEditedRows([...rows]);
    };

    const handleCancelOrder = () => {
        setIsEditOrderMode(false);
        setEditedRows([]);
    };

    const handleSaveOrder = async () => {
        try {
            await saveOrderMutation.mutateAsync(editedRows);
            toast.success('Order saved successfully');
            setIsEditOrderMode(false);
            setEditedRows([]);
        } catch (_error) {
            toast.error('Failed to save order');
        }
    };

    const handleOrderChange = (rowId: number, newOrder: number) => {
        setEditedRows((prev) => prev.map((row) => (row.HRMG_Id === rowId ? { ...row, HRMG_Order: newOrder } : row)));
    };

    const displayColumns = isEditOrderMode ? getEditableColumns(handleOrderChange) : columns;
    const displayData = isEditOrderMode ? editedRows : rows;

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='font-semibold text-lg'>Grade Data</h3>
                    <p className='text-muted-foreground text-sm'>View, search, and manage all grades in the system</p>
                </div>
                <div className='flex gap-2'>
                    {isEditOrderMode ? (
                        <>
                            <Button
                                type='button'
                                onClick={handleCancelOrder}
                                variant='outline'
                                className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                                <X className='h-4 w-4' />
                                Cancel
                            </Button>
                            <Button
                                type='button'
                                onClick={handleSaveOrder}
                                disabled={saveOrderMutation.isPending}
                                className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                                <Save className='h-4 w-4' />
                                {saveOrderMutation.isPending ? 'Saving...' : 'Save Order'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                type='button'
                                onClick={handleSetOrder}
                                variant='outline'
                                className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                                <ListOrdered className='h-4 w-4' />
                                Set Order
                            </Button>
                            <Button
                                type='button'
                                onClick={openAddForm}
                                className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                                <Plus className='h-4 w-4' />
                                Add Grade
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <CollapsibleSection
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<GradeDetail>
                    data={displayData}
                    totalItems={displayData.length}
                    columns={displayColumns}
                    isLoading={isLoading}
                    error={error}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading grades...'
                    noDataTitle='No Grades Found'
                    noDataDescription='Get started by creating your first grade'
                    errorTitle='Error Loading Grades'
                />
            </CollapsibleSection>

            <FormSections refetch={refetch} />
        </div>
    );
}

function FormSections({ refetch }: { refetch: () => void }) {
    const { isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<GradeDetail>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Grade'
                        description='Fill in the details below to create a new grade'
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
                            <GradeForm
                                onSuccess={() => {
                                    closeAddForm();
                                    refetch();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Grade'
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
                            <GradeForm
                                selectedRow={selectedRow}
                                onSuccess={() => {
                                    closeEditForm();
                                    refetch();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
