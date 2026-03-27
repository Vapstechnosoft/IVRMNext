'use client';

import { ColumnDef } from '@tanstack/react-table';
import { StudentLateInData } from '@/types/visitors-management/transactions';
import { Edit, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useStudentLateIn } from '@/hooks/visitors-management/transactions/useStudentLateIn';
import { format } from 'date-fns';

export const studentLateInColumns: ColumnDef<StudentLateInData>[] = [
    {
        id: 'serialNumber',
        header: 'SL.NO.',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'studentName',
        header: 'Student Name',
        cell: ({ row }) => <div className="font-medium">{row.getValue('studentName')}</div>,
    },
    {
        accessorKey: 'amst_AdmNo',
        header: 'Adm.No.',
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
        accessorKey: 'alieoS_AttendanceDate',
        header: 'Attendance Date',
        cell: ({ row }) => {
            const dateStr = row.getValue('alieoS_AttendanceDate') as string;
            return dateStr ? format(new Date(dateStr), 'dd/MM/yyyy') : '-';
        }
    },
    {
        accessorKey: 'alieoS_PunchDate',
        header: 'Punch Date',
        cell: ({ row }) => {
            const dateStr = row.getValue('alieoS_PunchDate') as string;
            return dateStr ? format(new Date(dateStr), 'dd/MM/yyyy') : '-';
        }
    },
    {
        accessorKey: 'alieoS_PunchTime',
        header: 'Punch Time',
    },
    {
        accessorKey: 'alieoS_Reason',
        header: 'Reason',
    },
    {
        id: 'actions',
        header: 'Action',
        cell: function ActionCell({ row }) {
            const { openEditForm } = useFormContext<StudentLateInData>();
            const { changeStatus, isChangingStatus } = useStudentLateIn();
            const isActive = row.original.alieoS_AactiveFlag;

            return (
                <div className="flex justify-end gap-2 pr-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        title="Edit"
                        onClick={() => openEditForm(row.original)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={isActive ? "text-red-600 hover:text-red-800 hover:bg-red-50" : "text-green-600 hover:text-green-800 hover:bg-green-50"}
                        title={isActive ? "Deactivate" : "Activate"}
                        onClick={() => changeStatus(row.original.alieoS_Id)}
                        disabled={isChangingStatus}
                    >
                        {isActive ? (
                            <div className="flex items-center"><PowerOff className="h-4 w-4 mr-1" /> De-Activate</div>
                        ) : (
                            <div className="flex items-center"><Power className="h-4 w-4 mr-1" /> Activate</div>
                        )}
                    </Button>
                </div>
            );
        },
    },
];
