'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import {
    useDeleteLeaveCreditDetails,
    useLeaveCreditDetails,
    useSaveLeaveCreditDetails
} from '@/hooks/hrms/leave-management/useTransactions';
import { Plus, X } from 'lucide-react';
import { use, useState } from 'react';
import { toast } from 'sonner';
import { type LeaveCreditDetail, getLeaveCreditDetailColumns } from './_components/columns';
import { LeaveCreditDetailsForm } from './_components/leave-credit-details-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function LeaveCreditDetailsPage(props: { searchParams: SearchParams }) {
    const _searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useLeaveCreditDetails();

    return (
        <FormProvider<LeaveCreditDetail>>
            <LeaveCreditDetailsPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function LeaveCreditDetailsPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<LeaveCreditDetail>();
    const { openEditForm, openDeleteForm } = useFormContext<LeaveCreditDetail>();
    const tableProps = useDataTableProps(response);

    const columns = getLeaveCreditDetailColumns({
        onEdit: openEditForm,
        onDelete: (id: number) => {
            const row = response?.data?.find((r: LeaveCreditDetail) => r.id === id);
            if (row) {
                openDeleteForm(row);
            }
        }
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
                        Add Leave Credit Details
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='LEAVE TRANSFER REPORT'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<LeaveCreditDetail>
                        {...tableProps}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading leave credit details...'
                        noDataTitle='No Leave Credit Details Found'
                        noDataDescription='Get started by creating your first leave credit detail'
                        errorTitle='Error Loading Leave Credit Details'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isDeleteFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeDeleteForm,
        addFormRef,
        editFormRef
    } = useFormContext<LeaveCreditDetail>();
    const { refetchAll } = useLeaveCreditDetails();
    const { mutate: saveCreditDetails } = useSaveLeaveCreditDetails();
    const { mutate: deleteCreditDetails } = useDeleteLeaveCreditDetails();
    const [activeTab, _setActiveTab] = useState('Leave Credit');

    const handleFormSubmit = (formData: LeaveCreditDetail) => {
        // Map LeaveCreditDetail to the expected API format
        const apiData = {
            HRML_Id: formData.id || 0,
            HRMLD_NoOfDays: String(formData.noOfDays || 0),
            HRMLD_MaxLeaveApplicable: formData.maxLeaveApplicable || 0,
            Emp_types: formData.type || [],
            dept_types: formData.department || [],
            desig_types: formData.designation || [],
            grade_types: formData.grade || [],
            HRMLD_CarryForFlg: formData.leaveCarryForward || false,
            HRMLD_EncashFlg: formData.leaveEncashment || false,
            HRMLDCF_MaxLeaveAplFlg: false,
            HRMLDCF_MaxLeaveCF: 0,
            selectedcarryMonthList: [],
            selectedMonthList: formData.months ? Object.keys(formData.months).filter(m => (formData.months?.[m] || 0) > 0).map(m => {
                const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                const monthIndex = MONTHS.indexOf(m);
                return monthIndex >= 0 ? monthIndex + 1 : 0;
            }).filter(m => m > 0) : [],
            ...formData
        };
        
        saveCreditDetails(apiData, {
            onSuccess: () => {
                toast.success(selectedRow ? 'Leave credit details updated successfully' : 'Leave credit details saved successfully');
                refetchAll();
                closeEditForm();
                closeAddForm();
            },
            onError: () => {
                toast.error('Failed to save leave credit details');
            }
        });
    };

    const handleDelete = () => {
        if (selectedRow) {
            deleteCreditDetails(selectedRow.id, {
                onSuccess: () => {
                    toast.success('Leave credit detail deleted successfully');
                    refetchAll();
                    closeDeleteForm();
                },
                onError: () => {
                    toast.error('Failed to delete leave credit detail');
                }
            });
        }
    };

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='LEAVE DETAILS'
                        description='Fill in the details to configure leave credit'
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
                            <LeaveCreditDetailsForm activeTab={activeTab} onSubmit={handleFormSubmit} onCancel={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='LEAVE DETAILS'
                        description='Update leave credit details information'
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
                            <LeaveCreditDetailsForm
                                activeTab={activeTab}
                                onSubmit={handleFormSubmit}
                                onCancel={closeEditForm}
                                defaultValues={{
                                    type: selectedRow.type,
                                    department: selectedRow.department,
                                    designation: selectedRow.designation,
                                    grade: selectedRow.grade,
                                    leaveName: selectedRow.leaveName,
                                    leaveCode: selectedRow.leaveCode,
                                    noOfDays: selectedRow.noOfDays,
                                    maxLeaveApplicable: selectedRow.maxLeaveApplicable,
                                    leaveCarryForward: selectedRow.leaveCarryForward,
                                    leaveEncashment: selectedRow.leaveEncashment,
                                    leaveCreditMonthWise: selectedRow.leaveCreditMonthWise,
                                    creditMonths: selectedRow.creditMonths,
                                    months: selectedRow.months
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Delete Form */}
            {isDeleteFormOpen && selectedRow && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                    <div className='mx-4 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg'>
                        <h2 className='mb-4 font-semibold text-lg'>Delete Leave Credit Detail</h2>
                        <p className='mb-6'>Are you sure you want to delete this leave credit detail? This action cannot be undone.</p>
                        <div className='flex justify-end gap-2'>
                            <Button type='button' variant='outline' onClick={closeDeleteForm}>
                                Cancel
                            </Button>
                            <Button type='button' variant='destructive' onClick={handleDelete}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
