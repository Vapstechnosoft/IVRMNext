'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useLeaveBalance, useLeaveHistory } from '@/hooks/hrms/leave-management/useApplyLeave';
import { Plus, X } from 'lucide-react';
import AddApplyLeaveForm from './_components/add-form';
import { type ApplyLeave, leaveBalanceColumns, leaveHistoryColumns } from './_components/columns';

const defaultEmployee = {
    name: 'R Siddesh Kumar',
    designation: 'Sr. HR Executive',
    doj: '2020-01-01'
};

export default function ApplyLeavePage() {
    const { data: balanceResponse, isLoading: isLoadingBalance, error: balanceError } = useLeaveBalance();
    const { data: historyResponse, isLoading: isLoadingHistory, error: historyError } = useLeaveHistory();

    return (
        <FormProvider<ApplyLeave>>
            <ApplyLeavePageContent
                balanceResponse={balanceResponse}
                historyResponse={historyResponse}
                isLoadingBalance={isLoadingBalance}
                isLoadingHistory={isLoadingHistory}
                balanceError={balanceError}
                historyError={historyError}
            />
        </FormProvider>
    );
}

function ApplyLeavePageContent({
    balanceResponse,
    historyResponse,
    isLoadingBalance,
    isLoadingHistory,
    balanceError,
    historyError
}: {
    balanceResponse: any;
    historyResponse: any;
    isLoadingBalance: boolean;
    isLoadingHistory: boolean;
    balanceError: any;
    historyError: any;
}) {
    const { openAddForm } = useFormContext<ApplyLeave>();

    const balanceTableProps = useDataTableProps({
        data: balanceResponse?.data || [],
        totalItems: balanceResponse?.data?.length || 0
    });

    const historyTableProps = useDataTableProps({
        data: historyResponse?.data || [],
        totalItems: historyResponse?.data?.length || 0
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Online Leave Application' description='' />
                    </div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Apply Leave
                    </Button>
                </div>

                {/* Employee Leave Details */}
                <CollapsibleSection
                    title='Employee Leave Details'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div>
                            <h3 className='mb-2 font-semibold text-sm'>Current Balances</h3>
                            <GenericDataTable
                                {...balanceTableProps}
                                columns={leaveBalanceColumns}
                                isLoading={isLoadingBalance}
                                error={balanceError}
                                showViewOptions={false}
                                loadingMessage='Loading leave balances...'
                                noDataTitle='No Leave Balance Found'
                                noDataDescription='No leave balances available'
                                errorTitle='Error Loading Leave Balance'
                            />
                        </div>
                        <div>
                            <h3 className='mb-2 font-semibold text-sm'>Past Applications</h3>
                            <GenericDataTable
                                {...historyTableProps}
                                columns={leaveHistoryColumns}
                                isLoading={isLoadingHistory}
                                error={historyError}
                                showViewOptions={false}
                                loadingMessage='Loading leave history...'
                                noDataTitle='No Leave History Found'
                                noDataDescription='No past leave applications'
                                errorTitle='Error Loading Leave History'
                            />
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Form */}
                <FormSection />
            </div>
        </div>
    );
}

function FormSection() {
    const { isAddFormOpen, closeAddForm, addFormRef } = useFormContext<ApplyLeave>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Apply for Leave'
                        description='Fill in the details below to apply for leave'
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
                            <AddApplyLeaveForm defaultEmployee={defaultEmployee} onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
