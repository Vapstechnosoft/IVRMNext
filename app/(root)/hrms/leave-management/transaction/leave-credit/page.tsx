'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getLeaveCreditColumns, type LeaveCredit } from './_components/columns';
import { LeaveCreditForm } from './_components/leave-credit-form';

const leaveCreditDB = createLocalCrud<LeaveCredit>('leaveCredit');

export default function LeaveCreditPage() {
    const [data, setData] = useState<LeaveCredit[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCredit, setEditingCredit] = useState<LeaveCredit | null>(null);
    const [activeTab, setActiveTab] = useState('Leave Credit');

    const loadData = () => {
        try {
            const result = leaveCreditDB.list();
            setData(result);
        } catch (error) {
            console.error('Error loading leave credits:', error);
            toast.error('Failed to load leave credits');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingCredit(null);
        setActiveTab('Leave Credit');
        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('leave-credit-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingCredit(null);
        setActiveTab('Leave Credit');
    };

    const handleFormSubmit = (formData: LeaveCredit) => {
        try {
            if (editingCredit) {
                leaveCreditDB.update(editingCredit.id, formData);
                toast.success('Leave credit updated successfully');
            } else {
                leaveCreditDB.create(formData);
                toast.success('Leave credit created successfully');
            }
            loadData();
            handleFormClose();
        } catch (error) {
            console.error('Error saving leave credit:', error);
            toast.error('Failed to save leave credit');
        }
    };

    const handleEdit = (credit: LeaveCredit) => {
        setEditingCredit(credit);
        setIsFormOpen(true);
        setActiveTab('Leave Credit');
        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('leave-credit-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this leave credit?')) {
            try {
                leaveCreditDB.remove(id);
                toast.success('Leave credit deleted successfully');
                loadData();
            } catch (error) {
                console.error('Error deleting leave credit:', error);
                toast.error('Failed to delete leave credit');
            }
        }
    };

    const columns = useMemo(
        () => getLeaveCreditColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        [handleEdit, handleDelete]
    );

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Leave Management' description='Leave Credit Process' />
                    </div>
                    <Button onClick={handleAddClick} className='bg-blue-600 hover:bg-blue-700'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Leave Credit
                    </Button>
                </div>

                {/* Table Section */}
                <CollapsibleSection
                    title='Leave Transfer Report'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='mb-4'>
                        <p className='text-gray-600 text-sm'>Total grid records: {data.length}</p>
                    </div>
                    <GenericDataTable data={data} columns={columns} totalItems={data.length} isLoading={false} />
                </CollapsibleSection>

                {/* Form Section */}
                {isFormOpen && (
                    <div id='leave-credit-form'>
                        <CollapsibleSection
                            title={editingCredit ? 'Edit Leave Credit' : 'Add Leave Credit'}
                            description=''
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <LeaveCreditForm
                                editingCredit={editingCredit}
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
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
