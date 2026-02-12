'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useAdminOnDutyApplyList } from '@/hooks/hrms/leave-management/useAdminOnDutyApply';
import { useDeleteEmployeeLeaveById } from '@/hooks/hrms/leave-management/useOnlineLeaveApplication';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddApplyLeaveForm from './_components/add-form';
import { type LeaveHistoryRow, createLeaveHistoryColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function ApplyLeavePage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);

    const { data: response, isLoading, error, refetchAll } = useAdminOnDutyApplyList(searchParams as any);

    // Transform response data to match table columns expected format
    const transformedResponse = {
        ...response,
        data: response?.data?.map((item: any) => ({
            id: item.id,
            employeeName: item.employeeName,
            leaveType: item.leaveName,
            leaveReason: item.leaveReason,
            fromDate: item.fromDate,
            toDate: item.toDate,
            noOfDays: item.totalDays,
            days: item.totalDays,
            status: item.status,
            remark: item.leaveReason,
            document: ''
        })) || []
    };

    return (
        <FormProvider<LeaveHistoryRow>>
            <ApplyLeavePageContent
                response={transformedResponse}
                isLoading={isLoading}
                error={error}
                refetchAll={refetchAll}
            />
        </FormProvider>
    );
}

function ApplyLeavePageContent({
    response,
    isLoading,
    error,
    refetchAll
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetchAll: () => void;
}) {
    const { openAddForm } = useFormContext<LeaveHistoryRow>();
    const tableProps = useDataTableProps(response);
    const { mutate: deleteLeave } = useDeleteEmployeeLeaveById();

    // Mock employee data
    const defaultEmployee = {
        name: 'Admin',
        designation: 'Administrator',
        doj: '2023-01-01',
        email: 'admin@example.com',
        phone: '9876543210'
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this leave application?')) {
            deleteLeave(id, {
                onSuccess: () => {
                    refetchAll();
                }
            });
        }
    };

    const columns = createLeaveHistoryColumns(handleDelete);

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
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<LeaveHistoryRow>
                        {...tableProps}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading leave history...'
                        noDataTitle='No Leave History'
                        noDataDescription='Apply for leave to see your history here'
                        errorTitle='Error Loading Leave History'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections refetchAll={refetchAll} defaultEmployee={defaultEmployee} />
            </div>
        </div>
    );
}

interface FormSectionsProps {
    refetchAll: () => void;
    defaultEmployee: any;
}

function FormSections({ refetchAll, defaultEmployee }: FormSectionsProps) {
    const {
        isAddFormOpen,
        closeAddForm,
        addFormRef,
    } = useFormContext<LeaveHistoryRow>();

    return (
        <>
            {/* Add Application Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='New Leave Application'
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
                            <AddApplyLeaveForm
                                defaultEmployee={defaultEmployee}
                                onSuccess={() => {
                                    refetchAll();
                                    closeAddForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
