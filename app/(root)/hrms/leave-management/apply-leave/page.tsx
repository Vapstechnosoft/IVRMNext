'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
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
    const [history, setHistory] = useState<LeaveHistoryRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Seed demo data
    useEffect(() => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setHistory([
                {
                    leaveType: 'Sick Leave',
                    fromDate: '2025-01-03',
                    toDate: '2025-01-04',
                    days: 2,
                    status: 'Approved',
                    remark: 'Medical certificate submitted'
                },
                {
                    leaveType: 'Casual Leave',
                    fromDate: '2025-01-10',
                    toDate: '2025-01-11',
                    days: 2,
                    status: 'Pending',
                    remark: ''
                }
            ]);
            setIsLoading(false);
        }, 500);
    }, []);

    // Create mock response for useDataTableProps
    const mockResponse = {
        data: history,
        total: history.length,
        page: 1,
        pageSize: 10
    };

    return (
        <FormProvider<LeaveHistoryRow>>
            <ApplyLeavePageContent history={history} isLoading={isLoading} mockResponse={mockResponse} setHistory={setHistory} />
        </FormProvider>
    );
}

function ApplyLeavePageContent({
    history,
    isLoading,
    mockResponse,
    setHistory
}: {
    history: LeaveHistoryRow[];
    isLoading: boolean;
    mockResponse: any;
    setHistory: (history: LeaveHistoryRow[]) => void;
}) {
    const { openAddForm } = useFormContext();
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

        // Add to history
        const newLeave: LeaveHistoryRow = {
            leaveType: data.leaveType || 'N/A',
            fromDate: data.fromDate || '',
            toDate: data.toDate || '',
            days: data.numDays || 0,
            status: 'Applied',
            remark: data.reason
        };
        setHistory([newLeave, ...history]);
        toast.success('Leave application submitted successfully');
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
                            <ApplyLeaveForm defaultEmployee={defaultEmployee} onSubmit={onSubmit} onCancel={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
