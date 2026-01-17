'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Power, PowerOff } from 'lucide-react';
import { IBMICalculation } from '@/types/sports/transactions/bmi-calculation';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useBMICalculation } from '@/hooks/sports/useBMICalculation';
import { toast } from 'sonner';

export const bmiCalculationColumns: ColumnDef<IBMICalculation>[] = [
    {
        accessorKey: 'serialNumber',
        header: 'Sl.No.',
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'asmaY_Year',
        header: 'Year',
    },
    {
        accessorKey: 'studentName',
        header: 'Student Name',
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: 'Adm No.',
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: 'Class',
    },
    {
        accessorKey: 'asmC_SectionName',
        header: 'Section',
    },
    {
        accessorKey: 'asondate',
        header: 'As On Date',
    },
    {
        accessorKey: 'spccshW_Height',
        header: 'Height',
    },
    {
        accessorKey: 'spccshW_Weight',
        header: 'Weight',
    },
    {
        accessorKey: 'spccshW_BMI',
        header: 'BMI',
    },
    {
        accessorKey: 'spccshW_BMIRemark',
        header: 'Remark',
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const { openEditForm } = useFormContext<IBMICalculation>();
            const { deactivate } = useBMICalculation();
            const record = row.original;

            const handleEdit = () => {
                openEditForm(record);
            };

            const handleDeactivate = async () => {
                const action = record.spccmhW_ActiveFlag ? 'deactivate' : 'activate';
                const result = await deactivate.mutateAsync(record);
                if (result.success) {
                    toast.success(`Record ${action}d successfully`);
                } else {
                    toast.error(`Failed to ${action} record`);
                }
            };

            return (
                <div className='flex items-center gap-2'>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={handleEdit}
                        className='h-8 w-8 text-primary hover:bg-primary/10'
                    >
                        <Edit2 className='h-4 w-4' />
                    </Button>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={handleDeactivate}
                        className={`h-8 w-8 ${record.spccmhW_ActiveFlag ? 'text-destructive hover:bg-destructive/10' : 'text-success hover:bg-success/10'}`}
                    >
                        {record.spccmhW_ActiveFlag ? <PowerOff className='h-4 w-4' /> : <Power className='h-4 w-4' />}
                    </Button>
                </div>
            );
        }
    }
];
