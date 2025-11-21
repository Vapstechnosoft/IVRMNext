'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getLeaveAuthorizationColumns, type LeaveAuthorization } from './_components/columns';
import { LeaveAuthorizationForm } from './_components/leave-authorization-form';

const leaveAuthDB = createLocalCrud<LeaveAuthorization>('leaveAuthorization');

export default function LeaveAuthorizationPage() {
    const [data, setData] = useState<LeaveAuthorization[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAuth, setEditingAuth] = useState<LeaveAuthorization | null>(null);

    const loadData = () => {
        try {
            const result = leaveAuthDB.list();
            setData(result);
        } catch (error) {
            console.error('Error loading leave authorizations:', error);
            toast.error('Failed to load leave authorizations');
        }
    };

    useEffect(() => {
        loadData();

        // Add sample data if no data exists
        const existingData = leaveAuthDB.list();
        if (existingData.length === 0) {
            const sampleData: Omit<LeaveAuthorization, 'id' | 'createdAt'>[] = [
                {
                    institution: 'Vaps Knowledge Services Pvt Ltd',
                    gradeName: 'Manager',
                    groupTypeName: 'VKS',
                    departmentName: 'Sales and Marketing',
                    designationName: 'Assistant Business Development Manager',
                    leaveType: 'Comp Off',
                    orderOfApproval: '1',
                    approvalPerson: 'Benoy Yogesh Shetty',
                    finalFlag: false
                },
                {
                    institution: 'Vaps Knowledge Services Pvt Ltd',
                    gradeName: 'Manager',
                    groupTypeName: 'VKS',
                    departmentName: 'Sales and Marketing',
                    designationName: 'Assistant Business Development Manager',
                    leaveType: 'Optional Leave',
                    orderOfApproval: '1',
                    approvalPerson: 'Benoy Yogesh Shetty',
                    finalFlag: false
                },
                {
                    institution: 'Vaps Knowledge Services Pvt Ltd',
                    gradeName: 'Manager',
                    groupTypeName: 'VKS',
                    departmentName: 'Sales and Marketing',
                    designationName: 'Assistant Business Development Manager',
                    leaveType: 'Optional Leave',
                    orderOfApproval: '1',
                    approvalPerson: 'Benoy Yogesh Shetty',
                    finalFlag: false
                }
            ];

            sampleData.forEach((data) => leaveAuthDB.create(data));
            loadData();
        }
    }, []);

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingAuth(null);
        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('leave-auth-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingAuth(null);
    };

    const handleFormSubmit = (formData: LeaveAuthorization) => {
        try {
            if (editingAuth) {
                leaveAuthDB.update(editingAuth.id, formData);
                toast.success('Leave authorization updated successfully');
            } else {
                leaveAuthDB.create(formData);
                toast.success('Leave authorization created successfully');
            }
            loadData();
            handleFormClose();
        } catch (error) {
            console.error('Error saving leave authorization:', error);
            toast.error('Failed to save leave authorization');
        }
    };

    const handleEdit = (auth: LeaveAuthorization) => {
        setEditingAuth(auth);
        setIsFormOpen(true);
        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('leave-auth-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this leave authorization?')) {
            try {
                leaveAuthDB.remove(id);
                toast.success('Leave authorization deleted successfully');
                loadData();
            } catch (error) {
                console.error('Error deleting leave authorization:', error);
                toast.error('Failed to delete leave authorization');
            }
        }
    };

    const columns = useMemo(() => getLeaveAuthorizationColumns({ onEdit: handleEdit, onDelete: handleDelete }), [handleEdit, handleDelete]);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex justify-end'>
                    <Button onClick={handleAddClick} variant='default' className='w-fit'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Leave Authorization
                    </Button>
                </div>

                {/* Grid View Section */}
                <CollapsibleSection
                    title=''
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    {/* Data Table */}
                    <GenericDataTable data={data} columns={columns} totalItems={data.length} isLoading={false} />
                </CollapsibleSection>

                {/* Form Section */}
                {isFormOpen && (
                    <div id='leave-auth-form'>
                        <CollapsibleSection
                            title={editingAuth ? 'Edit Leave Authorization' : 'Add Leave Authorization'}
                            description=''
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <LeaveAuthorizationForm
                                editingLeaveAuthorization={editingAuth}
                                onSubmit={handleFormSubmit}
                                onCancel={handleFormClose}
                            />
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
