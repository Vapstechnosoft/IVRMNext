'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { AdaptiveDialog } from '@/components/ui/extension/adaptive-dialog';
import { use, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getLeaveApprovalColumns, type LeaveApprovalRow } from './_components/columns';
import { LeaveApprovalForm, type LeaveApprovalFormData } from './_components/leave-approval-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function LeaveApprovalPage(props: { searchParams: SearchParams }) {
    const _searchParams = use(props.searchParams);
    const [data, setData] = useState<LeaveApprovalRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Seed demo data
    useEffect(() => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setData([
                {
                    id: 1,
                    employeeCode: '1503',
                    employeeName: 'chandrakala j k',
                    leaveName: 'Sick Leave',
                    fromDate: '2024-01-01',
                    toDate: '2024-01-01',
                    totalDays: 1,
                    leaveStatus: 'Approved',
                    remark: 'Approved'
                },
                {
                    id: 2,
                    employeeCode: '12354',
                    employeeName: 'test staff',
                    leaveName: 'Sick Leave',
                    fromDate: '2024-09-01',
                    toDate: '2024-09-01',
                    totalDays: 1,
                    leaveStatus: 'Approved',
                    remark: 'Approved'
                },
                {
                    id: 3,
                    employeeCode: '0123',
                    employeeName: 'suresh',
                    leaveName: 'Sick Leave',
                    fromDate: '2025-07-12',
                    toDate: '2025-07-14',
                    totalDays: 3,
                    leaveStatus: 'Applied',
                    remark: ''
                },
                {
                    id: 4,
                    employeeCode: '0456',
                    employeeName: 'rajesh kumar',
                    leaveName: 'Casual Leave',
                    fromDate: '2025-01-15',
                    toDate: '2025-01-17',
                    totalDays: 3,
                    leaveStatus: 'Pending',
                    remark: ''
                }
            ]);
            setIsLoading(false);
        }, 500);
    }, []);

    // Create mock response for useDataTableProps
    const mockResponse = {
        data: data,
        total: data.length,
        page: 1,
        pageSize: 10
    };

    return (
        <FormProvider<LeaveApprovalRow>>
            <LeaveApprovalPageContent data={data} setData={setData} isLoading={isLoading} mockResponse={mockResponse} />
        </FormProvider>
    );
}

function LeaveApprovalPageContent({
    data,
    setData,
    isLoading,
    mockResponse
}: {
    data: LeaveApprovalRow[];
    setData: (data: LeaveApprovalRow[]) => void;
    isLoading: boolean;
    mockResponse: any;
}) {
    const { openEditForm } = useFormContext<LeaveApprovalRow>();
    const tableProps = useDataTableProps(mockResponse);

    const handleApprove = (row: LeaveApprovalRow) => {
        openEditForm(row);
    };

    const handleReject = (row: LeaveApprovalRow) => {
        openEditForm(row);
    };

    const columns = useMemo(() => getLeaveApprovalColumns({ onApprove: handleApprove, onReject: handleReject }), []);

    // Filter pending leaves
    const pendingLeaves = data.filter((item) => item.leaveStatus === 'Applied' || item.leaveStatus === 'Pending');

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
                            <p className='text-lg font-semibold text-red-600'>NO leaves pending for approval!!</p>
                        </div>
                    ) : (
                        <div className='py-4 text-center'>
                            <p className='text-lg font-semibold text-blue-600'>
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
                        error={undefined}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading leave approvals...'
                        noDataTitle='No Leave Approvals Found'
                        noDataDescription='No leave requests available for approval'
                        errorTitle='Error Loading Leave Approvals'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections data={data} setData={setData} />
            </div>
        </div>
    );
}

function FormSections({
    data,
    setData
}: {
    data: LeaveApprovalRow[];
    setData: (data: LeaveApprovalRow[]) => void;
}) {
    const {
        isEditFormOpen,
        selectedRow,
        closeEditForm
    } = useFormContext<LeaveApprovalRow>();

    const handleFormSubmit = (formData: LeaveApprovalFormData) => {
        if (!selectedRow) return;

        const updatedData = data.map((item) => {
            if (item.id === selectedRow.id) {
                return {
                    ...item,
                    leaveStatus: formData.action === 'approve' ? 'Approved' : 'Rejected',
                    remark: formData.remark || (formData.action === 'approve' ? 'Approved' : 'Rejected')
                };
            }
            return item;
        });

        setData(updatedData);
        toast.success(`Leave ${formData.action === 'approve' ? 'approved' : 'rejected'} successfully`);
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

