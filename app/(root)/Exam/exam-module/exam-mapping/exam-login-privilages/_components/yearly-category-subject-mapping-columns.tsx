'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Switch } from '@/components/ui/switch';
import { useExamLoginPrivilegesDetails } from '@/hooks/exam/exammodule/exam-mapping';
import { toggleExamLoginPrivilege } from '@/server/exam/exam-module/exam-mapping/exam-login-privilages';
import type { ILoginPrivilegeDetails } from '@/types/exam/exam-module/exam-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export const LoginPrivilegesDetailsColumns: ColumnDef<ILoginPrivilegeDetails>[] = [
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL NO' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: true
    },

    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Name' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassName')}</div>,
        enableSorting: true
    },

    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section Name' />,
        cell: ({ row }) => <div>{row.getValue('asmC_SectionName')}</div>,
        enableSorting: true
    },

    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject Name' />,
        cell: ({ row }) => <div>{row.getValue('ismS_SubjectName')}</div>,
        enableSorting: true
    },

    {
        accessorKey: 'emsS_SubSubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SubSubject Name' />,
        cell: ({ row }) => <div>{row.getValue('emsS_SubSubjectName')}</div>,
        enableSorting: true
    },

    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-center' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: ILoginPrivilegeDetails }) {
    const { refetchAll } = useExamLoginPrivilegesDetails(rowData.elP_Id, rowData.asmcL_Id, rowData.asmS_Id);
    const activeStatus = rowData.activeFlg ?? rowData.elps_ActiveFlg ?? false;
    const [isActive, setIsActive] = useState(activeStatus);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingState, setPendingState] = useState<boolean | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const updateInProgress = useRef(false);

    useEffect(() => {
        setIsActive(activeStatus);
    }, [activeStatus]);

    const handleToggle = (checked: boolean) => {
        if (updateInProgress.current) return;
        setPendingState(checked);
        setIsConfirmOpen(true);
    };

    const handleConfirm = async () => {
        if (pendingState === null || updateInProgress.current) return;
        const privilegeId = rowData.elpS_Id ?? rowData.elps_Id;
        if (typeof privilegeId !== 'number' || !Number.isFinite(privilegeId) || privilegeId <= 0) {
            toast.error('Unable to update privilege: missing privilege ID');
            return;
        }

        updateInProgress.current = true;
        setIsSubmitting(true);

        try {
            const response = await toggleExamLoginPrivilege(privilegeId);
            if (!response?.success) {
                throw new Error(response?.message || 'Failed to update privilege status');
            }

            const updatedStatus = response.data?.elps_ActiveFlg;
            const nextState = typeof updatedStatus === 'boolean' ? updatedStatus : pendingState;
            setIsActive(nextState);
            toast.success(response.message || `Privilege ${nextState ? 'activated' : 'deactivated'} successfully`);
            setIsConfirmOpen(false);
            setPendingState(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update privilege status');
            return;
        } finally {
            updateInProgress.current = false;
            setIsSubmitting(false);
        }

        try {
            await refetchAll();
        } catch {
            toast.error('Privilege status was updated, but the details could not be refreshed');
        }
    };

    const closeConfirmation = () => {
        if (isSubmitting) return;
        setIsConfirmOpen(false);
        setPendingState(null);
    };

    return (
        <>
            <div className='flex items-center justify-center gap-2'>
                <span className={`font-medium text-sm ${isActive ? 'text-green-700' : 'text-red-600'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                </span>
                <Switch
                    checked={isActive}
                    onCheckedChange={handleToggle}
                    disabled={isSubmitting || isConfirmOpen}
                    aria-label={`${isActive ? 'Deactivate' : 'Activate'} login privilege`}
                    className='disabled:opacity-100 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500'
                />
            </div>
            <AdaptiveDialog title='Confirm Login Privilege Status' isOpen={isConfirmOpen} onClose={closeConfirmation}>
                <AdaptiveBody>
                    <p>
                        Are you sure you want to <strong>{pendingState ? 'activate' : 'deactivate'}</strong> the login privilege for{' '}
                        <strong>
                            {rowData.ismS_SubjectName}
                            {rowData.emsS_SubSubjectName ? ` - ${rowData.emsS_SubSubjectName}` : ''}
                        </strong>
                        ?
                    </p>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button type='button' variant='secondary' onClick={closeConfirmation} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type='button' onClick={handleConfirm} disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : pendingState ? 'Activate' : 'Deactivate'}
                    </Button>
                </AdaptiveFooter>
            </AdaptiveDialog>
        </>
    );
}
