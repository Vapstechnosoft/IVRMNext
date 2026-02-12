'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useAdminOnDutyApplyList, useDeleteLeaveById } from '@/hooks/hrms/leave-management/useAdminOnDutyApply';
import { tableSearchVariables } from '@/lib/data-table.config';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useState } from 'react';
import ApplyLeaveForm from './_components/apply-leave-form';
import { getAdminOnDutyApplyColumns } from './_components/columns';
import { ViewLeaveDetailsDialog } from './_components/view-dialog';

export default function AdminOnDutyApplyPage() {
    const [page] = useQueryState(tableSearchVariables.page, parseAsInteger.withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withDefault(10));
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));
    const [sortColumn] = useQueryState(tableSearchVariables.sort_column, parseAsString.withDefault(''));
    const [sortDirection] = useQueryState(tableSearchVariables.sort_direction, parseAsString.withDefault(''));

    const {
        data: adminOnDutyList,
        isLoading,
        error
    } = useAdminOnDutyApplyList({
        page,
        pageSize,
        searchQuery,
        sortColumn,
        sortDirection
    });

    const [viewLeaveId, setViewLeaveId] = useState<number | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

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
        }
    });

    return (
        <div className='flex flex-col gap-4 p-4'>
            <CollapsibleSection title='Apply On Duty Leave' defaultOpen>
                <ApplyLeaveForm />
            </CollapsibleSection>

            <CollapsibleSection title='Applied Leaves List' defaultOpen>
                <GenericDataTable
                    columns={columns}
                    isLoading={isLoading}
                    {...tableProps}
                    loadingMessage='Loading leave applications...'
                    noDataTitle='No leave applications found'
                    error={error}
                />
            </CollapsibleSection>

            <ViewLeaveDetailsDialog
                leaveId={viewLeaveId}
                open={isViewOpen}
                onOpenChange={setIsViewOpen}
            />
        </div>
    );
}
