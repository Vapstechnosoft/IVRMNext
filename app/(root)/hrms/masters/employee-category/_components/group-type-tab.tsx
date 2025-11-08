'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGroupType } from '@/hooks/hrms/useMasters';
import type { GroupTypeDetail } from '@/types/hrms/master-group-type';
import { ListOrdered, Plus, Save, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { columns, getEditableColumns } from '../../group-type/_components/columns';
import GroupTypeForm from '../../group-type/_components/group-type-form';

export default function GroupTypeTab() {
    const roleId = HRMS_MI_ID;
    const { listQuery } = useMasterGroupType(roleId);

    console.log('📊 [GROUP TYPE TAB] Main component - isLoading:', listQuery.isLoading);
    console.log('📊 [GROUP TYPE TAB] Main component - isFetching:', listQuery.isFetching);
    console.log('📊 [GROUP TYPE TAB] Main component - dataUpdatedAt:', listQuery.dataUpdatedAt);

    return (
        <FormProvider<GroupTypeDetail>>
            <GroupTypeTabContent response={listQuery.data} isLoading={listQuery.isLoading} error={listQuery.error} />
        </FormProvider>
    );
}

function GroupTypeTabContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<GroupTypeDetail>();
    const { saveOrderMutation } = useMasterGroupType(HRMS_MI_ID);
    // Memoize array to prevent unnecessary re-renders
    const rows: GroupTypeDetail[] = useMemo(() => response?.grouptypeList ?? [], [response?.grouptypeList]);

    console.log('📊 [GROUP TYPE TAB] Component render - rows count:', rows.length);
    console.log('📊 [GROUP TYPE TAB] Sample row orders:', rows.slice(0, 3).map(r => `ID=${r.HRMGT_Id}, Order=${r.HRMGT_Order}`));

    const [isEditOrderMode, setIsEditOrderMode] = useState(false);
    const [editedRows, setEditedRows] = useState<GroupTypeDetail[]>([]);

    const handleSetOrder = () => {
        console.log('🔵 [ORDER] Set Order button clicked');
        console.log('🔵 [ORDER] Current rows count:', rows.length);
        setIsEditOrderMode(true);
        setEditedRows([...rows]);
    };

    const handleCancelOrder = () => {
        console.log('🔵 [ORDER] Cancel Order clicked');
        setIsEditOrderMode(false);
        setEditedRows([]);
    };

    const handleSaveOrder = async () => {
        console.log('🔵 [ORDER] ========== SAVE ORDER ==========');
        console.log('🔵 [ORDER] Edited rows to save:', JSON.stringify(editedRows, null, 2));
        console.log('🔵 [ORDER] Number of rows:', editedRows.length);
        
        try {
            console.log('🟡 [ORDER] Calling saveOrderMutation.mutateAsync...');
            await saveOrderMutation.mutateAsync(editedRows);
            console.log('🟢 [ORDER] Save order successful');
            toast.success('Order saved successfully');
            setIsEditOrderMode(false);
            setEditedRows([]);
        } catch (error) {
            console.log('🔴 [ORDER] Error saving order:', error);
            toast.error('Failed to save order');
        }
        console.log('🔵 [ORDER] ========== SAVE ORDER END ==========');
    };

    const handleOrderChange = (rowId: number, newOrder: number) => {
        console.log('🔵 [ORDER] Order changed - Row ID:', rowId, 'New Order:', newOrder);
        setEditedRows((prev) => {
            const updated = prev.map((row) => (row.HRMGT_Id === rowId ? { ...row, HRMGT_Order: newOrder } : row));
            console.log('🔵 [ORDER] Updated row:', updated.find(r => r.HRMGT_Id === rowId));
            return updated;
        });
    };

    const displayColumns = isEditOrderMode ? getEditableColumns(handleOrderChange) : columns;
    const displayData = isEditOrderMode ? editedRows : rows;

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='font-semibold text-lg'>Group Type Data</h3>
                    <p className='text-muted-foreground text-sm'>View, search, and manage all group types in the system</p>
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
                                Add Group Type
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
                <GenericDataTable<GroupTypeDetail>
                    data={displayData}
                    totalItems={displayData.length}
                    columns={displayColumns}
                    isLoading={isLoading}
                    error={error}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading group types...'
                    noDataTitle='No Group Types Found'
                    noDataDescription='Get started by creating your first group type'
                    errorTitle='Error Loading Group Types'
                />
            </CollapsibleSection>

            <FormSections />
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<GroupTypeDetail>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Group Type'
                        description='Fill in the details below to create a new group type'
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
                            <GroupTypeForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Group Type'
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
                            <GroupTypeForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
