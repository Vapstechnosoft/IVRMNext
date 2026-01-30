'use client';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IEmployeeList } from '@/types/hrms/hrms-config/employee';
import type { Row } from '@tanstack/react-table';
import { Edit, Power } from 'lucide-react';
interface ActionsCellProps {
    row: Row<IEmployeeList>;
}
export function ActionsCell({ row }: ActionsCellProps) {
    const employee = row.original;
    const { openEditForm, openToggleForm } = useFormContext<IEmployeeList>();
    const handleEdit = () => {
        openEditForm(employee);
    };
    const handleToggle = () => {
        openToggleForm(employee);
    };
    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                onClick={handleEdit}
                title="Edit Employee"
            >
                <Edit className='h-4 w-4' />
                <span className="sr-only">Edit</span>
            </Button>

            <Button
                variant="outline"
                size="sm"
                className={`h-8 w-8 p-0 ${employee.hrmE_ActiveFlag
                    ? 'border-red-200 hover:bg-red-50 hover:text-red-600 text-red-500'
                    : 'border-green-200 hover:bg-green-50 hover:text-green-600 text-green-500'}`}
                onClick={handleToggle}
                title={employee.hrmE_ActiveFlag ? 'Deactivate Employee' : 'Activate Employee'}
            >
                <Power className='h-4 w-4' />
                <span className="sr-only">{employee.hrmE_ActiveFlag ? 'Deactivate' : 'Activate'}</span>
            </Button>
        </div>
    );
}
