import { ColumnDef } from '@tanstack/react-table';
import { IBMICalculation } from '@/types/sports/transactions/bmi-calculation';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useBMICalculation } from '@/hooks/sports/useBMICalculation';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

export const bmiCalculationColumns: ColumnDef<IBMICalculation>[] = [
    {
        accessorKey: 'spccshW_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
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
        cell: ({ row }) => {
            const remark = row.original.spccshW_BMIRemark || row.original.SPCCSHW_BMIRemark;
            let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
            if (remark === 'Normal') variant = 'default';
            if (remark === 'Overweight') variant = 'secondary';
            if (remark === 'Obese' || remark === 'Extreme Obese') variant = 'destructive';

            return <Badge variant={variant}>{remark}</Badge>;
        }
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const { deactivate } = useBMICalculation();
            const { openEditForm } = useFormContext<IBMICalculation>();
            
            return (
                <ActionButtons
                    rowData={row.original}
                    buttons={{
                        edit: true,
                        toggle: true,
                        delete: false
                    }}
                    onEdit={() => openEditForm(row.original)}
                    onToggle={(data) => {
                        deactivate.mutate(data.spccshW_Id || data.SPCCSHW_Id || 0);
                    }}
                    toggleConditionKey='spccmhW_ActiveFlag'
                />
            );
        },
    },
];
