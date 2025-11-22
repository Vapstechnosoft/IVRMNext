'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useApplyLeave, useLeaveHistory } from '@/hooks/hrms/leave-management/useApplyLeave';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { ApplyLeaveForm } from './_components/apply-leave-form';
import { leaveHistoryColumns, type ApplyLeave, type LeaveHistoryRow } from './_components/columns';

type DefaultEmployee = {
    name: string;
    designation: string;
    doj: string;
    email: string;
    phone: string;
};

const defaultEmployee: DefaultEmployee = {
    name: 'R Siddesh Kumar',
    designation: 'Sr. HR Executive',
    doj: '2020-01-01',
    email: 'rsiddesh.kumar@example.com',
    phone: '9876543210'
};

export default function ApplyLeavePage() {
    const { data: response, isLoading, error } = useLeaveHistory();

    // Create response for useDataTableProps
    const mockResponse = {
        data: response?.data || [],
        total: response?.data?.length || 0,
        page: 1,
        pageSize: 10
    };

    return (
        <FormProvider<LeaveHistoryRow>>
            <ApplyLeavePageContent response={response} isLoading={isLoading} error={error} mockResponse={mockResponse} />
        </FormProvider>
    );
}

function ApplyLeavePageContent({
    response: _response,
    isLoading,
    error,
    mockResponse
}: {
    response: any;
    isLoading: boolean;
    error: any;
    mockResponse: any;
}) {
    const { openAddForm, closeAddForm } = useFormContext();
    const { mutate: applyLeave, isPending: _isApplying } = useApplyLeave();
    const tableProps = useDataTableProps(mockResponse);
    const todayISO = new Date().toISOString().slice(0, 10);

    const handleFormSubmit = (data: ApplyLeave) => {
        // Validate dates are not in the past
        if (data.fromDate && data.toDate) {
            if (data.fromDate < todayISO || data.toDate < todayISO) {
                toast.error('Dates cannot be in the past');
                return;
            }
            if (new Date(data.toDate) < new Date(data.fromDate)) {
                toast.error('To Date cannot be before From Date');
                return;
            }
        }
        if (!data.reason?.trim()) {
            toast.error('Reasons for Leave is required');
            return;
        }

        // Apply leave via API
        applyLeave(
            {
                data,
                HRME_Id: 0 // TODO: Get from session/user context
            },
            {
                onSuccess: () => {
                    closeAddForm();
                }
            }
        );
    };

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

                {/* Data Table Section */}
                <CollapsibleSection
                    title='EMPLOYEE LEAVE DETAILS'
                    description='View your leave application history'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<LeaveHistoryRow>
                        {...tableProps}
                        columns={leaveHistoryColumns}
                        isLoading={isLoading}
                        error={error}
                        loadingMessage='Loading leave history...'
                        noDataTitle='No Leave Applications Found'
                        noDataDescription='Get started by applying for your first leave'
                        errorTitle='Error Loading Leave History'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections defaultEmployee={defaultEmployee} onSubmit={handleFormSubmit} />
            </div>
        </div>
    );
}

function FormSections({
    defaultEmployee,
    onSubmit
}: {
    defaultEmployee: DefaultEmployee;
    onSubmit: (data: ApplyLeave) => void;
}) {
    const { isAddFormOpen, closeAddForm, addFormRef } = useFormContext();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='ONLINE LEAVE APPLICATION'
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
                            <ApplyLeaveForm 
                                defaultEmployee={defaultEmployee} 
                                onSubmit={onSubmit} 
                                onCancel={closeAddForm} 
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
