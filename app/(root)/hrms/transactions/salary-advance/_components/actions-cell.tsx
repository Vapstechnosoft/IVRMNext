'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useToggleSalaryAdvanceStatus } from '@/hooks/hrms/useTransactions';
import type { SalaryAdvanceItem } from '@/types/hrms/salary-advance';
import { toast } from 'sonner';

interface ActionsCellProps {
    rowData: SalaryAdvanceItem;
}

export function ActionsCell({ rowData }: ActionsCellProps) {
    const { openEditForm } = useFormContext<SalaryAdvanceItem>();
    const toggleMutation = useToggleSalaryAdvanceStatus();

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={(data: SalaryAdvanceItem) => {
                openEditForm(data);
            }}
            onToggle={(data: SalaryAdvanceItem, newState: boolean) => {
                toggleMutation.mutate(
                    {
                        hresaId: data.HRESA_Id,
                        activeFlag: newState
                    },
                    {
                        onSuccess: () => {
                            toast.success(`Successfully ${newState ? 'activated' : 'deactivated'} the salary advance record`);
                        }
                    }
                );
            }}
            toggleConditionKey='HRESA_ActiveFlag'
        />
    );
}
