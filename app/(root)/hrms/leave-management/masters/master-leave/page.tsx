'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getMasterLeaveColumns, type MasterLeave } from './_components/columns';
import { LeaveForm } from './_components/leave-form';

const masterLeaveDB = createLocalCrud<MasterLeave>('masterLeave');

export default function MasterLeavePage() {
    const [data, setData] = useState<MasterLeave[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLeave, setEditingLeave] = useState<MasterLeave | null>(null);

    const loadData = () => {
        try {
            const result = masterLeaveDB.list();
            setData(result);
        } catch (error) {
            console.error('Error loading master leaves:', error);
            toast.error('Failed to load master leaves');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingLeave(null);
        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('master-leave-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingLeave(null);
    };

    const handleFormSubmit = (formData: MasterLeave) => {
        try {
            if (editingLeave) {
                masterLeaveDB.update(editingLeave.id, formData);
                toast.success('Master leave updated successfully');
            } else {
                masterLeaveDB.create(formData);
                toast.success('Master leave created successfully');
            }
            loadData();
            handleFormClose();
        } catch (error) {
            console.error('Error saving master leave:', error);
            toast.error('Failed to save master leave');
        }
    };

    const handleEdit = (leave: MasterLeave) => {
        setEditingLeave(leave);
        setIsFormOpen(true);
        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('master-leave-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this master leave?')) {
            try {
                masterLeaveDB.remove(id);
                toast.success('Master leave deleted successfully');
                loadData();
            } catch (error) {
                console.error('Error deleting master leave:', error);
                toast.error('Failed to delete master leave');
            }
        }
    };

    const handleToggleStatus = (leave: MasterLeave) => {
        try {
            masterLeaveDB.update(leave.id, { isActive: !leave.isActive });
            toast.success(`Master leave ${leave.isActive ? 'deactivated' : 'activated'} successfully`);
            loadData();
        } catch (error) {
            console.error('Error toggling master leave status:', error);
            toast.error('Failed to toggle master leave status');
        }
    };

    const columns = useMemo(
        () => getMasterLeaveColumns({ onEdit: handleEdit, onDelete: handleDelete, onToggleStatus: handleToggleStatus }),
        [handleEdit, handleDelete, handleToggleStatus]
    );

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex justify-end'>
                    <Button onClick={handleAddClick} variant='default' className='w-fit'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Master Leave
                    </Button>
                </div>

                {/* Table Section */}
                <CollapsibleSection
                    title='Master Leave List'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable data={data} columns={columns} totalItems={data.length} isLoading={false} />
                </CollapsibleSection>

                {/* Form Section */}
                {isFormOpen && (
                    <div id='master-leave-form'>
                        <CollapsibleSection
                            title={editingLeave ? 'Edit Master Leave' : 'Add Master Leave'}
                            description=''
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <LeaveForm editingLeave={editingLeave} onSubmit={handleFormSubmit} onCancel={handleFormClose} />
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
