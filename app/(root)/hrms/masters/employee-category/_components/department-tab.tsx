'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterDepartment } from '@/hooks/hrms/useMasters';
import type { ApiSearchparams } from '@/types';
import type { DepartmentDetail } from '@/types/hrms/master-department';
import { ListOrdered, Plus, Save, X } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { columns, getEditableColumns } from '../../department/_components/columns';
import DepartmentForm from '../../department/_components/department-form';

export default function DepartmentTab() {
    const roleId = HRMS_MI_ID;

    // Read pagination and search params from URL
    const [page] = useQueryState('page', parseAsInteger.withDefault(1));
    const [page_size] = useQueryState('page_size', parseAsInteger.withDefault(10));
    const [search_query] = useQueryState('search_query', parseAsString.withDefault(''));
    const [search_column] = useQueryState('search_column', parseAsString.withDefault(''));
    const [sort_column] = useQueryState('sort_column', parseAsString.withDefault(''));
    const [sort_direction] = useQueryState('sort_direction', parseAsString.withDefault(''));

    const searchParams: ApiSearchparams = {
        page,
        page_size,
        search_query: search_query || undefined,
        search_column: search_column || undefined,
        sort_column: sort_column || undefined,
        sort_direction: sort_direction || undefined
    };

    const { listQuery, refetchAll } = useMasterDepartment(roleId, searchParams);

    return (
        <FormProvider<DepartmentDetail>>
            <DepartmentTabContent response={listQuery.data} isLoading={listQuery.isLoading} error={listQuery.error} refetch={refetchAll} />
        </FormProvider>
    );
}

function DepartmentTabContent({
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
    const { openAddForm } = useFormContext<DepartmentDetail>();
    const { saveOrderMutation } = useMasterDepartment(HRMS_MI_ID);
    // Memoize array to prevent unnecessary re-renders
    // API now returns data as an array directly, or in departmentList for backward compatibility
    const rows: DepartmentDetail[] = useMemo(() => {
        if (Array.isArray(response?.data)) {
            return response.data;
        }
        return response?.departmentList ?? [];
    }, [response?.data, response?.departmentList]);

    const [isEditOrderMode, setIsEditOrderMode] = useState(false);
    const [editedRows, setEditedRows] = useState<DepartmentDetail[]>([]);

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
        setEditedRows((prev) => prev.map((row) => (row.HRMD_Id === rowId ? { ...row, HRMD_Order: newOrder } : row)));
    };

    const displayColumns = isEditOrderMode ? getEditableColumns(handleOrderChange) : columns;
    const displayData = isEditOrderMode ? editedRows : rows;

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='font-semibold text-lg'>Department Data</h3>
                    <p className='text-muted-foreground text-sm'>View, search, and manage all departments in the system</p>
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
                                Add Department
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
                <GenericDataTable<DepartmentDetail>
                    data={displayData}
                    totalItems={response?.total ?? displayData.length}
                    columns={displayColumns}
                    isLoading={isLoading}
                    error={error}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading departments...'
                    noDataTitle='No Departments Found'
                    noDataDescription='Get started by creating your first department'
                    errorTitle='Error Loading Departments'
                />
            </CollapsibleSection>

            <FormSections refetch={refetch} />
        </div>
    );
}

function FormSections({ refetch }: { refetch: () => void }) {
    const { isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<DepartmentDetail>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Department'
                        description='Fill in the details below to create a new department'
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
                            <DepartmentForm
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
                        title='Edit Department'
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
                            <DepartmentForm
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
