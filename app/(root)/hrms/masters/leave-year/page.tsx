'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLeaveYear } from '@/hooks/hrms/useMasters';
import type { LeaveYearDetail } from '@/types/hrms/master-leave-year';
import { ListOrdered, Plus, Save, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { columns, getEditableColumns } from './_components/columns';
import LeaveYearForm from './_components/leave-year-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterLeaveYearPage(_props: {
    searchParams: SearchParams;
}) {
    const roleId = HRMS_MI_ID;
    const { listQuery } = useMasterLeaveYear(roleId);

    return (
        <FormProvider<LeaveYearDetail>>
            <MasterLeaveYearPageContent response={listQuery.data} isLoading={listQuery.isLoading} error={listQuery.error} />
        </FormProvider>
    );
}

function MasterLeaveYearPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<LeaveYearDetail>();
    const { saveOrderMutation } = useMasterLeaveYear(HRMS_MI_ID);
    const rows: LeaveYearDetail[] = response?.leaveYearList ?? [];

    // Minimal logging - only when data changes
    // console.log('📊 [LEAVE YEAR PAGE] rows count:', rows.length);

    const [isEditOrderMode, setIsEditOrderMode] = useState(false);
    const [editedRows, setEditedRows] = useState<LeaveYearDetail[]>([]);

    const handleSetOrder = () => {
        setIsEditOrderMode(true);
        setEditedRows([...rows]);
    };

    const handleCancelOrder = () => {
        setIsEditOrderMode(false);
        setEditedRows([]);
    };

    const handleSaveOrder = async () => {
        console.log('🔵 [ORDER] ========== SAVE ORDER ==========');
        console.log('🔵 [ORDER] Edited rows to save:', JSON.stringify(editedRows, null, 2));
        console.log('🔵 [ORDER] Number of rows:', editedRows.length);
        
        try {
            console.log('🟡 [ORDER] Calling saveOrderMutation.mutateAsync...');
            const result = await saveOrderMutation.mutateAsync(editedRows);
            console.log('🟢 [ORDER] Save order result:', result);
            toast.success('Order saved successfully');
            setIsEditOrderMode(false);
            setEditedRows([]);
            console.log('🟢 [ORDER] Order saved successfully');
        } catch (error) {
            console.log('🔴 [ORDER] Error saving order:', error);
            toast.error('Failed to save order');
        }
        console.log('🔵 [ORDER] ========== SAVE ORDER END ==========');
    };

    const handleOrderChange = (rowId: number, newOrder: number) => {
        setEditedRows((prev) => {
            return prev.map((row) => {
                if (row.HRMLY_Id === rowId) {
                    return { ...row, HRMLY_LeaveYearOrder: newOrder };
                }
                return row;
            });
        });
    };

    const displayColumns = isEditOrderMode ? getEditableColumns(handleOrderChange) : columns;

    const displayData = isEditOrderMode ? editedRows : rows;

    return (
        <div className='min-h-screen'>
            <div className='container mx-auto space-y-6 px-4 py-6 md:px-6 lg:px-8'>
                <div className='flex justify-end gap-2'>
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
                                Add Leave Year
                            </Button>
                        </>
                    )}
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<LeaveYearDetail>
                        data={displayData}
                        totalItems={displayData.length}
                        columns={displayColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading leave years...'
                        noDataTitle='No Leave Years Found'
                        noDataDescription='Get started by creating your first leave year'
                        errorTitle='Error Loading Leave Years'
                    />
                </CollapsibleSection>

                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<LeaveYearDetail>();

    const handleCloseAddForm = () => {
        closeAddForm();
    };

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Leave Year'
                        description='Fill in the details below to create a new leave year'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={handleCloseAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <LeaveYearForm onSuccess={handleCloseAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Leave Year'
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
                            <LeaveYearForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
