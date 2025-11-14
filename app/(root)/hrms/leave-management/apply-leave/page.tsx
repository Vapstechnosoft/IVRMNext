'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/extension/field';
import { useLeaveBalance, useLeaveHistory } from '@/hooks/hrms/leave-management/useApplyLeave';
import { Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import AddApplyLeaveForm from './_components/add-form';
import { type ApplyLeave, leaveBalanceColumns, leaveHistoryColumns } from './_components/columns';

const defaultEmployee = {
    name: 'R Siddesh Kumar',
    designation: 'Sr. HR Executive',
    doj: '2020-01-01',
    email: '',
    phone: '0'
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
    const [leaveSearchQuery, setLeaveSearchQuery] = useState('');

    const employeeDetails = defaultEmployee;
    const leaveBalances = balanceResponse?.data || [];
    const leaveHistory = historyResponse?.data || [];

    // Filter leave history based on search query
    const filteredLeaveHistory = useMemo(() => {
        if (!leaveSearchQuery.trim()) return leaveHistory;
        const query = leaveSearchQuery.toLowerCase();
        return leaveHistory.filter(
            (leave: any) =>
                leave.leaveType?.toLowerCase().includes(query) ||
                leave.status?.toLowerCase().includes(query)
        );
    }, [leaveHistory, leaveSearchQuery]);

    const balanceTableProps = useDataTableProps({
        data: leaveBalances,
        totalItems: leaveBalances.length
    });

    const historyTableProps = useDataTableProps({
        data: filteredLeaveHistory,
        totalItems: filteredLeaveHistory.length
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Apply Leave
                    </Button>
                </div>

                {/* Employee Details Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
                        <div className='space-y-2'>
                            <Label>Employee Name</Label>
                            <div className='rounded-md border bg-muted/50 p-2 font-medium'>
                                {employeeDetails.name || '-'}
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <Label>DOJ</Label>
                            <div className='rounded-md border bg-muted/50 p-2 font-medium'>
                                {employeeDetails.doj ? new Date(employeeDetails.doj).toLocaleDateString('en-GB') : '-'}
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <Label>Designation</Label>
                            <div className='rounded-md border bg-muted/50 p-2 font-medium'>
                                {employeeDetails.designation || '-'}
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <Label>Email</Label>
                            <div className='rounded-md border bg-muted/50 p-2 font-medium'>
                                {employeeDetails.email || '-'}
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <Label>Phone</Label>
                            <div className='rounded-md border bg-muted/50 p-2 font-medium'>
                                {employeeDetails.phone || '-'}
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Employee Leave Details Section - Balance Table */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
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
                </CollapsibleSection>

                {/* Employee Leave Details Section - History Table */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='space-y-4'>
                        <div className='flex justify-end'>
                            <div className='relative w-full max-w-sm'>
                                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                                <Input
                                    placeholder='search here...'
                                    value={leaveSearchQuery}
                                    onChange={(e) => setLeaveSearchQuery(e.target.value)}
                                    className='pl-9'
                                />
                            </div>
                        </div>
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
                </CollapsibleSection>

                {/* Forms */}
                <FormSections employeeDetails={employeeDetails} />
            </div>
        </div>
    );
}

function FormSections({ employeeDetails }: { employeeDetails: typeof defaultEmployee }) {
    const { isAddFormOpen, closeAddForm, addFormRef } = useFormContext<ApplyLeave>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='ONLINE LEAVE APPLICATION'
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
                            <AddApplyLeaveForm defaultEmployee={employeeDetails} onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
