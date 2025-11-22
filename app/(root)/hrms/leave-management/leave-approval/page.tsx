'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { AdaptiveDialog } from '@/components/ui/extension/adaptive-dialog';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useLeaveApprovalStatus } from '@/hooks/hrms/leave-management/useLeaveApproval';
import { use, useMemo } from 'react';
import { toast } from 'sonner';
import { type LeaveApprovalRow, getLeaveApprovalColumns } from './_components/columns';
import { LeaveApprovalForm, type LeaveApprovalFormData } from './_components/leave-approval-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function LeaveApprovalPage(props: { searchParams: SearchParams }) {
    const _searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useLeaveApprovalStatus();

    // Create response for useDataTableProps
    const mockResponse = {
        data: response?.data || [],
        total: response?.data?.length || 0,
        page: 1,
        pageSize: 10
    };

    return (
        <FormProvider<LeaveApprovalRow>>
            <LeaveApprovalPageContent response={response} isLoading={isLoading} error={error} mockResponse={mockResponse} />
        </FormProvider>
    );
}

function LeaveApprovalPageContent({
    response,
    isLoading,
    error,
    mockResponse
}: {
    response: any;
    isLoading: boolean;
    error: any;
    mockResponse: any;
}) {
    const { openEditForm } = useFormContext<LeaveApprovalRow>();
    const tableProps = useDataTableProps(mockResponse);
    const { refetchAll: _refetchApprovalStatus } = useLeaveApprovalStatus();

    const handleApprove = (row: LeaveApprovalRow) => {
        openEditForm(row);
    };

    const handleReject = (row: LeaveApprovalRow) => {
        openEditForm(row);
    };

    const columns = useMemo(() => getLeaveApprovalColumns({ onApprove: handleApprove, onReject: handleReject }), []);

    // Filter pending leaves
    const pendingLeaves = (response?.data || []).filter((item: LeaveApprovalRow) => item.leaveStatus === 'Applied' || item.leaveStatus === 'Pending');

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* LEAVE APPROVAL STATUS Section */}
                <CollapsibleSection
                    title='LEAVE APPROVAL STATUS'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    {pendingLeaves.length === 0 ? (
                        <div className='py-10 text-center'>
                            <p className='font-semibold text-lg text-red-600'>NO leaves pending for approval!!</p>
                        </div>
                    ) : (
                        <div className='py-4 text-center'>
                            <p className='font-semibold text-blue-600 text-lg'>
                                {pendingLeaves.length} leave{pendingLeaves.length > 1 ? 's' : ''} pending for approval
                            </p>
                        </div>
                    )}
                </CollapsibleSection>

                {/* LEAVE APPROVAL DETAILS Section */}
                <CollapsibleSection
                    title='LEAVE APPROVAL DETAILS'
                    description='View and manage leave approval requests'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<LeaveApprovalRow>
                        {...tableProps}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading leave approvals...'
                        noDataTitle='No Leave Approvals Found'
                        noDataDescription='No leave requests available for approval'
                        errorTitle='Error Loading Leave Approvals'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const { isEditFormOpen, selectedRow, closeEditForm } = useFormContext<LeaveApprovalRow>();
    const { refetchAll } = useLeaveApprovalStatus();

    const handleFormSubmit = (formData: LeaveApprovalFormData) => {
        if (!selectedRow) return;

        // TODO: Call approve/reject API endpoint when available
        // For now, just show success message and refresh data
        toast.success(`Leave ${formData.action === 'approve' ? 'approved' : 'rejected'} successfully`);
        refetchAll();
        closeEditForm();
    };

    return (
        <>
            {/* Approval/Rejection Dialog */}
            {isEditFormOpen && selectedRow && (
                <AdaptiveDialog
                    title={`Leave Approval - ${selectedRow.employeeName}`}
                    isOpen={isEditFormOpen}
                    onClose={closeEditForm}
                    size='lg'>
                    <LeaveApprovalForm leaveRequest={selectedRow} onSubmit={handleFormSubmit} onCancel={closeEditForm} />
                </AdaptiveDialog>
            )}
        </>
    );
}
