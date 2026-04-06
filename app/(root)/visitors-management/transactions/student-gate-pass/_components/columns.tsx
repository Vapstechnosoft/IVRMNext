'use client';

import { ColumnDef } from '@tanstack/react-table';
import { StudentGatePassData } from '@/types/visitors-management/transactions';
import { Edit, Power, PowerOff, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useStudentGatePass } from '@/hooks/visitors-management/transactions/useStudentGatePass';
import { format } from 'date-fns';

export const studentGatePassColumns: ColumnDef<StudentGatePassData>[] = [
    {
        id: 'serialNumber',
        header: 'Sl.No.',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'studentname',
        header: 'Student Name',
        cell: ({ row }) => <div className="font-medium">{row.getValue('studentname')}</div>,
    },
    {
        accessorKey: 'amsT_AdmNo',
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
        accessorKey: 'gphS_GatePassNo',
        header: 'Gate Pass No.',
    },
    {
        accessorKey: 'gphS_DateTime',
        header: 'Date',
        cell: ({ row }) => {
            const dateStr = row.getValue('gphS_DateTime') as string;
            return dateStr ? format(new Date(dateStr), 'dd-MM-yyyy') : '-';
        }
    },
    {
        accessorKey: 'gphS_ReceiverName',
        header: 'Receiver Name',
    },
    {
        id: 'actions',
        header: 'Action',
        cell: function ActionCell({ row }) {
            const { openEditForm } = useFormContext<StudentGatePassData>();
            const { changeStatus, isChangingStatus } = useStudentGatePass();
            const isActive = row.original.gphS_ActiveFlg;

            return (
                <div className="flex justify-end gap-2 pr-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        title="Print Gate Pass"
                        onClick={() => {
                            // TODO: Print GP Logic
                            console.log("Print GP", row.original);
                        }}
                    >
                        <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                        title="Download Proof"
                        onClick={() => {
                            // TODO: Download logic
                            console.log("Download Proof", row.original);
                        }}
                    >
                        <Download className="h-4 w-4" />
                    </Button>
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
                        onClick={() => changeStatus(row.original.gphS_Id)}
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
