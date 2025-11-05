'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLoan } from '@/hooks/hrms/useMasters';
import type { MasterLoanDetail, MasterLoanResponse } from '@/types/hrms/master-loan';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<MasterLoanDetail>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-medium'>Sl No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 60
    },
    {
        accessorKey: 'HRML_LoanType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Loan Type' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRML_Max',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Maximum Amount' className='whitespace-nowrap' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start whitespace-nowrap' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: MasterLoanDetail }) {
    const { openEditForm } = useFormContext<MasterLoanResponse>();
    const { toggleMutation } = useMasterLoan(HRMS_MI_ID);

    const handleEdit = useCallback(
        (data: MasterLoanDetail) => {
            console.log('🔵 [LOAN COLUMNS] handleEdit called');
            console.log('🔵 [COLUMNS] Edit button clicked for row:', JSON.stringify(data, null, 2));
            console.log('🔵 [COLUMNS] HRMLN_Id:', data.HRMLN_Id);
            console.log('🔵 [COLUMNS] HRML_LoanType:', data.HRML_LoanType);
            console.log('🔵 [COLUMNS] HRML_Max:', data.HRML_Max);
            console.log('🔵 [COLUMNS] Calling openEditForm...');
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: MasterLoanDetail, newState: boolean) => {
            console.log('🔵 [LOAN COLUMNS] handleToggle called');
            console.log('🔵 [COLUMNS] Toggle data:', { HRMLN_Id: data.HRMLN_Id, currentState: data.HRMLN_ActiveFlag, newState });
            
            try {
                const result = await toggleMutation.mutateAsync({
                    HRMLN_Id: data.HRMLN_Id,
                    HRMLN_ActiveFlag: newState,
                    MI_Id: HRMS_MI_ID
                });
                console.log('🟢 [COLUMNS] Toggle success:', result);
                
                // Check if loan is mapped/in use
                if (result && typeof result === 'object' && 'retrunMsg' in result) {
                    const retrunMsg = (result as any).retrunMsg;
                    console.log('📝 [COLUMNS] retrunMsg:', retrunMsg);
                    
                    if (retrunMsg === 'Mapped') {
                        console.log('⚠️ [COLUMNS] Loan is mapped/in use');
                        toast.error('Cannot deactivate - Loan type is currently assigned/in use');
                        return;
                    }
                }
                
                toast.success(`Loan ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (error: any) {
                console.log('🔴 [COLUMNS] Toggle error:', error);
                toast.error(`Failed to ${newState ? 'activate' : 'deactivate'} loan`);
            }
        },
        [toggleMutation]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='HRMLN_ActiveFlag'
        />
    );
}
