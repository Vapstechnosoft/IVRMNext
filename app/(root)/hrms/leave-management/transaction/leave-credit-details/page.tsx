'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useLeaveCreditDetails, useSaveLeaveCreditDetails, useDeleteLeaveCreditDetails } from '@/hooks/hrms/leave-management/useTransactions';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getLeaveCreditDetailColumns, type LeaveCreditDetail } from './_components/columns';
import { LeaveCreditDetailsForm } from './_components/leave-credit-details-form';

export default function LeaveCreditDetailsPage() {
    const { data: response, isLoading, refetchAll } = useLeaveCreditDetails();
    const { mutate: saveCreditDetails, isPending: isSaving } = useSaveLeaveCreditDetails();
    const { mutate: deleteCreditDetails } = useDeleteLeaveCreditDetails();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<LeaveCreditDetail | null>(null);
    const [activeTab, setActiveTab] = useState('Leave Credit');

    const data = useMemo(() => response?.data || [], [response?.data]);

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingRow(null);
        setActiveTab('Leave Credit');
        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('leave-credit-details-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingRow(null);
        setActiveTab('Leave Credit');
    };

    const handleFormSubmit = (formData: LeaveCreditDetail) => {
        saveCreditDetails(formData, {
            onSuccess: () => {
                toast.success(editingRow ? 'Leave credit details updated successfully' : 'Leave credit details saved successfully');
                refetchAll();
                handleFormClose();
            },
            onError: () => {
                toast.error('Failed to save leave credit details');
            }
        });
    };

    const handleEdit = (row: LeaveCreditDetail) => {
        setEditingRow(row);
        setIsFormOpen(true);
        // Determine which tab based on the row data or default to first tab
        setActiveTab('Leave Credit');
        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('leave-credit-details-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this leave credit detail record?')) {
            deleteCreditDetails(id, {
                onSuccess: () => {
                    toast.success('Leave credit detail deleted successfully');
                    refetchAll();
                },
                onError: () => {
                    toast.error('Failed to delete leave credit detail');
                }
            });
        }
    };

    const columns = useMemo(
        () => getLeaveCreditDetailColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        []
    );

    const tableProps = useDataTableProps({
        data: data,
        columns: columns,
        totalItems: data.length,
        searchParams: {},
        onSearchParamsChange: () => {}
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header with Add Button */}
                <div className='flex justify-end'>
                    <Button onClick={handleAddClick} variant='default' className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Leave Credit Details
                    </Button>
                </div>

                {/* Table Section */}
                <CollapsibleSection
                    title=''
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable {...tableProps} columns={columns} isLoading={isLoading} />
                </CollapsibleSection>

                {/* Form Section with Tabs */}
                {isFormOpen && (
                    <div id='leave-credit-details-form'>
                        <CollapsibleSection
                            title={editingRow ? 'Edit Leave Credit Details' : 'Leave Credit Details'}
                            description={editingRow ? 'Update leave credit details information' : 'Fill in the details to configure leave credit'}
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <LeaveCreditDetailsForm
                                activeTab={activeTab}
                                onSubmit={handleFormSubmit}
                                onCancel={handleFormClose}
                                defaultValues={editingRow ? {
                                    type: editingRow.type,
                                    department: editingRow.department,
                                    designation: editingRow.designation,
                                    grade: editingRow.grade,
                                    leaveName: editingRow.leaveName,
                                    leaveCode: editingRow.leaveCode,
                                    noOfDays: editingRow.noOfDays,
                                    maxLeaveApplicable: editingRow.maxLeaveApplicable,
                                    leaveCarryForward: editingRow.leaveCarryForward,
                                    leaveEncashment: editingRow.leaveEncashment,
                                    leaveCreditMonthWise: editingRow.leaveCreditMonthWise,
                                    creditMonths: editingRow.creditMonths,
                                    months: editingRow.months
                                } : undefined}
                            />
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
