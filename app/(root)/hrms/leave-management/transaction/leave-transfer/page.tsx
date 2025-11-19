'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeaveCredit, useSaveLeaveCredit, useDeleteLeaveCredit } from '@/hooks/hrms/leave-management/useTransactions';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getLeaveCreditColumns, type LeaveCredit } from './_components/columns';
import { LeaveTransferForm, type LeaveTransferFormData } from './_components/leave-transfer-form';

export default function LeaveTransferPage() {
    const { data: response, isLoading, refetchAll } = useLeaveCredit();
    const { mutate: saveCredit, isPending: isSaving } = useSaveLeaveCredit();
    const { mutate: deleteCredit } = useDeleteLeaveCredit();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCredit, setEditingCredit] = useState<LeaveCredit | null>(null);
    const [activeTab, setActiveTab] = useState('Leave Updation');

    const data = useMemo(() => response?.data || [], [response?.data]);

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingCredit(null);
        setActiveTab('Leave Updation');
        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('leave-transfer-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingCredit(null);
        setActiveTab('Leave Updation');
    };

    const handleFormSubmit = (formData: LeaveTransferFormData) => {
        // Convert form data to LeaveCredit format
        const submitData: LeaveCredit = {
            id: editingCredit?.id || 0,
            createdAt: editingCredit?.createdAt || new Date(),
            leaveYear: formData.leaveYear,
            leaveName: formData.leaveName,
            employeeName: editingCredit?.employeeName || '', // This would come from employee selection
            leaveCredit: editingCredit?.leaveCredit || 0,
            leaveBalance: editingCredit?.leaveBalance || 0,
            type: formData.type,
            department: formData.department,
            designation: formData.designation
        };

        saveCredit(submitData, {
            onSuccess: () => {
                toast.success(editingCredit ? 'Leave transfer updated successfully' : 'Leave transfer saved successfully');
                refetchAll();
                handleFormClose();
            }
        });
    };

    const handleEdit = (credit: LeaveCredit) => {
        setEditingCredit(credit);
        setIsFormOpen(true);
        // Determine which tab based on the credit type or default to first tab
        setActiveTab('Leave Updation');
        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('leave-transfer-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this leave transfer record?')) {
            deleteCredit(id, {
                onSuccess: () => {
                    toast.success('Leave transfer deleted successfully');
                    refetchAll();
                }
            });
        }
    };

    const columns = useMemo(
        () => getLeaveCreditColumns({ onEdit: handleEdit, onDelete: handleDelete }),
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
                        Add Leave Transfer
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
                    <div id='leave-transfer-form'>
                        <CollapsibleSection
                            title={editingCredit ? 'Edit Leave Transfer' : 'Leave Transfer'}
                            description={editingCredit ? 'Update leave transfer information' : 'Fill in the details to process leave transfer'}
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                                <TabsList className='grid w-full grid-cols-3'>
                                    <TabsTrigger value='Leave Updation'>Leave Updation</TabsTrigger>
                                    <TabsTrigger value='Leave Addition'>Leave Addition</TabsTrigger>
                                    <TabsTrigger value='Leave CarryForward'>Leave CarryForward</TabsTrigger>
                                </TabsList>

                                <TabsContent value='Leave Updation' className='mt-4'>
                                    <LeaveTransferForm
                                        activeTab='Leave Updation'
                                        onSubmit={handleFormSubmit}
                                        onCancel={handleFormClose}
                                        defaultValues={editingCredit ? {
                                            type: editingCredit.type,
                                            department: editingCredit.department,
                                            designation: editingCredit.designation,
                                            leaveYear: editingCredit.leaveYear,
                                            leaveName: editingCredit.leaveName
                                        } : undefined}
                                    />
                                </TabsContent>

                                <TabsContent value='Leave Addition' className='mt-4'>
                                    <LeaveTransferForm
                                        activeTab='Leave Addition'
                                        onSubmit={handleFormSubmit}
                                        onCancel={handleFormClose}
                                        defaultValues={editingCredit ? {
                                            type: editingCredit.type,
                                            department: editingCredit.department,
                                            designation: editingCredit.designation,
                                            leaveYear: editingCredit.leaveYear,
                                            leaveName: editingCredit.leaveName
                                        } : undefined}
                                    />
                                </TabsContent>

                                <TabsContent value='Leave CarryForward' className='mt-4'>
                                    <LeaveTransferForm
                                        activeTab='Leave CarryForward'
                                        onSubmit={handleFormSubmit}
                                        onCancel={handleFormClose}
                                        defaultValues={editingCredit ? {
                                            type: editingCredit.type,
                                            department: editingCredit.department,
                                            designation: editingCredit.designation,
                                            leaveYear: editingCredit.leaveYear,
                                            leaveName: editingCredit.leaveName
                                        } : undefined}
                                    />
                                </TabsContent>
                            </Tabs>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
