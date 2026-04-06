'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import {
    useAdminOnDutyApplyList,
    useDeleteLeaveById,
    useToggleOnDutyStatus
} from '@/hooks/hrms/leave-management/useAdminOnDutyApply';
import { tableSearchVariables } from '@/lib/data-table.config';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useState } from 'react';
import ApplyLeaveForm from './_components/apply-leave-form';
import { getAdminOnDutyApplyColumns } from './_components/columns';
import { ViewLeaveDetailsDialog } from './_components/view-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AdminOnDutyApply } from '@/types/hrms/leave-management/admin-on-duty-apply';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Plus, X } from 'lucide-react';

export default function AdminOnDutyApplyPage() {
    const [page] = useQueryState(tableSearchVariables.page, parseAsInteger.withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withDefault(10));
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));
    const [sortColumn] = useQueryState(tableSearchVariables.sort_column, parseAsString.withDefault(''));
    const [sortDirection] = useQueryState(tableSearchVariables.sort_direction, parseAsString.withDefault(''));

    const {
        data: adminOnDutyList,
        isLoading,
        error,
        refetchAll
    } = useAdminOnDutyApplyList({
        page,
        pageSize,
        searchQuery,
        sortColumn,
        sortDirection
    });


    const [viewLeaveId, setViewLeaveId] = useState<number | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingRow, setEditingRow] = useState<AdminOnDutyApply | null>(null);

    const { mutate: deleteLeave } = useDeleteLeaveById();

    const tableProps = useDataTableProps(adminOnDutyList);

    const columns = getAdminOnDutyApplyColumns({
        onView: (id) => {
            setViewLeaveId(id);
            setIsViewOpen(true);
        },
        onDelete: (id) => {
            if (confirm('Are you sure you want to delete this leave request?')) {
                deleteLeave(id);
            }
        },
        onEdit: (row) => {
            setEditingRow(row);
            setShowForm(true);
            // Scroll to form
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-6'>
                    {/* Header with Add Button */}
                    <div className='flex justify-end'>
                        <Button
                            type='button'
                            onClick={() => {
                                if (showForm) {
                                    setEditingRow(null);
                                }
                                setShowForm(!showForm);
                            }}
                            className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'
                        >
                            {/* {showForm ? <X className='h-4 w-4' /> : <Plus className='h-4 w-4' />}
                            {showForm ? 'Close Form' : 'Add Admin On Duty'} */}
                            <p>Add Admin On Duty</p>
                        </Button>
                    </div>

                    {/* Data Table Section */}
                    <CollapsibleSection
                        title="Admin On Duty Details"
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg'
                    >
                        <GenericDataTable
                            columns={columns}
                            isLoading={isLoading}
                            data={adminOnDutyList?.data || []}
                            totalItems={adminOnDutyList?.total || 0}
                            success={adminOnDutyList?.success}
                            errorMessage={adminOnDutyList?.message}
                            loadingMessage='Loading leave applications...'
                            noDataTitle='No leave applications found'
                            noDataDescription='New applications will appear here once submitted.'
                            error={error}
                        />
                    </CollapsibleSection>

                    {/* Form Section */}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className='w-full'
                            >
                                <CollapsibleSection
                                    title={editingRow ? 'Edit On Duty Application' : 'Add New On Duty Application'}
                                    defaultOpen={true}
                                    variant='outline'
                                    size='md'
                                    className='slide-in-from-top-4 animate-in shadow-lg duration-300'
                                >
                                    <div className='relative'>
                                        <Button
                                            type='button'
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditingRow(null);
                                            }}
                                            variant='ghost'
                                            size='sm'
                                            className='-top-[3.5rem] absolute right-9 w-fit border p-2 shadow-md hover:bg-destructive/10'
                                        >
                                            <X className='h-4 w-4 text-destructive ' /> Close
                                        </Button>
                                        <ApplyLeaveForm
                                            editingRow={editingRow}
                                            onSuccess={() => {
                                                refetchAll();
                                                setShowForm(false);
                                                setEditingRow(null);
                                            }}
                                            onCancel={() => {
                                                setShowForm(false);
                                                setEditingRow(null);
                                            }}
                                        />
                                    </div>
                                </CollapsibleSection>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <ViewLeaveDetailsDialog
                    leaveId={viewLeaveId}
                    open={isViewOpen}
                    onOpenChange={setIsViewOpen}
                />
            </div>
        </div>
    );
}
