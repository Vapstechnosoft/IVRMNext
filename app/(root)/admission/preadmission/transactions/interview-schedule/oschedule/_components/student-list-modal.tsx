'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useScheduleReportDetails, useRemarksReportDetails } from '@/hooks/admission/preadmission/transactions/use-oral-test-schedule';
import { useEffect, useState } from 'react';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Button } from '@/components/ui/button';
import { FileDown, Printer, Loader2 } from 'lucide-react';
import { exportToExcel } from '@/lib/export-to-file';
import { ColumnDef } from '@tanstack/react-table';

interface StudentListModalProps {
    paotsId: number;
    isOpen: boolean;
    onClose: () => void;
    scheduleName: string;
    isRemarks?: boolean;
}

export default function StudentListModal({ paotsId, isOpen, onClose, scheduleName, isRemarks = false }: StudentListModalProps) {
    const { mutate: getScheduleReport, isPending: isLoadingSchedule } = useScheduleReportDetails();
    const { mutate: getRemarksReport, isPending: isLoadingRemarks } = useRemarksReportDetails();
    const [data, setData] = useState<any[]>([]);

    const isLoading = isRemarks ? isLoadingRemarks : isLoadingSchedule;

    useEffect(() => {
        if (isOpen) {
            const reportAction = isRemarks ? getRemarksReport : getScheduleReport;
            reportAction(paotsId, {
                onSuccess: (resp: any) => {
                    setData(isRemarks ? (resp?.remarksGetreportdetails || []) : (resp?.scheduleGetreportdetails || []));
                }
            });
        }
    }, [isOpen, paotsId, isRemarks]);

    const columns: ColumnDef<any>[] = [
        {
            id: 'slno',
            header: 'Sl.No',
            cell: ({ row }) => row.index + 1,
        },
        {
            accessorKey: 'studentname',
            header: 'Student Name',
        },
        {
            accessorKey: 'RegistrationNo',
            header: 'Reg. No',
        },
        {
            accessorKey: 'asmcL_ClassName',
            header: 'Class',
        },
    ];

    if (isRemarks) {
        columns.push({
            accessorKey: 'PAOTS_Remarks',
            header: 'Remarks',
        });
    }

    const handleExport = () => {
        const exportColumns = [
            { label: 'Student Name', value: 'studentname' },
            { label: 'Reg. No', value: 'RegistrationNo' },
            { label: 'Class', value: 'asmcL_ClassName' },
        ];
        if (isRemarks) {
            exportColumns.push({ label: 'Remarks', value: 'PAOTS_Remarks' });
        }
        
        exportToExcel(
            isRemarks ? `Remarks_${scheduleName}` : `Students_${scheduleName}`,
            JSON.stringify(exportColumns),
            JSON.stringify(data)
        );
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-blue-800">
                        {isRemarks ? 'Student Remarks' : 'Scheduled Student List'} - {scheduleName}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="flex justify-end gap-2 mb-4 no-print">
                    <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || data.length === 0}>
                        <FileDown className="mr-2 h-4 w-4" /> Export Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrint} disabled={isLoading || data.length === 0}>
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                </div>

                <div className="flex-1 overflow-auto border rounded-md p-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                            <p className="text-muted-foreground">Generating report...</p>
                        </div>
                    ) : (
                        <div id="printable-area">
                            <GenericDataTable
                                data={data}
                                columns={columns}
                                isLoading={false}
                                isSearchRequired={true}
                                noDataTitle="No Data Found"
                            />
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end mt-4 no-print">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
