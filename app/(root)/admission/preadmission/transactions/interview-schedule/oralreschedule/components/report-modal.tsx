'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useReScheduleReportDetails } from '@/hooks/admission/preadmission/transactions/use-oral-test-reschedule';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Button } from '@/components/ui/button';
import { FileDown, Printer, Loader2, XCircle } from 'lucide-react';
import { exportToExcel } from '@/lib/export-to-file';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { format } from 'date-fns';
import { IOralTestSchedule } from '@/types/admission/preadmission/transactions/oral-test-schedule';

interface ReportModalProps {
    rowData: IOralTestSchedule | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ReportModal({ rowData, isOpen, onClose }: ReportModalProps) {
    const schid = rowData ? String(rowData.paotS_Id) : '';
    const { data: response, isLoading } = useReScheduleReportDetails(schid);
    
    const data = response?.data || response?.allreports || [];


    const formatTime = (time: string) => {
        if (!time) return 'N/A';
        const parts = time.split(':');
        if (parts.length < 2) return time;
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h12 = hours % 12 || 12;
        return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
    };

    const columns: ColumnDef<any>[] = [
        {
            id: 'slno',
            header: ({ column }) => <DataTableColumnHeader column={column} title="SL.NO" />,
            cell: ({ row }) => row.index + 1,
            size: 60,
        },
        {
            accessorKey: 'regno',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Reg. No" />,
        },
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Student Name" />,
        },
        {
            accessorKey: 'gender',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Gender" />,
        },
        {
            accessorKey: 'scheduledate',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Schedule Date" />,
            cell: ({ row }) => {
                const date = row.original.scheduledate || row.original.ScheduleDate;
                return date ? format(new Date(date), 'dd-MM-yyyy') : 'N/A';
            },
        },
        {
            id: 'time',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Time" />,
            cell: ({ row }) => {
                const from = row.original.scheduletime || row.original.ScheduleTime || '';
                const to = row.original.scheduletimeto || row.original.ScheduleTimeTo || '';
                return `${formatTime(from)} - ${formatTime(to)}`;
            },
        }
    ];

    const handleExport = () => {
        if (!rowData) return;
        const exportColumns = [
            { label: 'Reg. No', value: 'regno' },
            { label: 'Student Name', value: 'name' },
            { label: 'Gender', value: 'gender' },
            { label: 'Schedule Date', value: 'scheduledate' },
            { label: 'Start Time', value: 'scheduletime' },
            { label: 'End Time', value: 'scheduletimeto' },
        ];
        
        exportToExcel(
            `Reschedule_Report_${rowData.paotS_ScheduleName}`,
            JSON.stringify(exportColumns),
            JSON.stringify(data)
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] w-[1100px] max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
                <div className="printable-content flex-1 flex flex-col overflow-auto">
                    {/* Custom Header Section */}
                    <div className="bg-white px-6 py-4 flex items-center justify-between border-b shadow-sm relative z-10">
                        <div className="flex-1">
                            <h2 className="text-[#004a99] font-bold text-[13px] uppercase tracking-wider">RE-SCHEDULED STUDENTS: {data.length}</h2>
                        </div>
                        
                        <div className="flex-[2] text-center space-y-0.5">
                            <h2 className="text-[#004a99] font-black text-sm uppercase tracking-widest">{rowData?.paotS_ScheduleName}</h2>
                            {rowData && (
                                <p className="text-[#004a99] font-bold text-[11px] opacity-90">
                                    {format(new Date(rowData.paotS_ScheduleDate), 'dd-MM-yyyy')} - {formatTime(rowData.paotS_ScheduleTime)} TO {formatTime(rowData.paotS_ScheduleTimeTo)}
                                </p>
                            )}
                        </div>

                        <div className="flex-1 flex justify-end items-center gap-4 no-print">
                            <button onClick={handleExport} className="hover:scale-110 transition-transform duration-200" title="Export Excel">
                                <FileDown className="h-6 w-6 text-[#2e7d32]" strokeWidth={2.5} />
                            </button>
                            <button onClick={() => window.print()} className="hover:scale-110 transition-transform duration-200" title="Print List">
                                <Printer className="h-6 w-6 text-[#455a64]" strokeWidth={2.5} />
                            </button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={onClose} 
                                className="h-8 rounded-sm border-[#cfd8dc] text-[#455a64] font-bold text-xs hover:bg-slate-50 px-4"
                            >
                                Close
                            </Button>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="flex-1 overflow-auto bg-slate-50/30">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-[#0066cc] mb-4 opacity-50" />
                                <p className="text-[#0066cc] font-bold text-xs animate-pulse">GENERATING REPORT...</p>
                            </div>
                        ) : (
                            <div className="p-4">
                                <div className="bg-white rounded-sm shadow-md border border-slate-200 overflow-hidden [&_thead_tr_th]:bg-blue-600 [&_thead_tr_th]:text-white [&_thead_tr_th]:font-bold [&_thead_tr_th]:py-2.5 [&_thead_tr_th]:text-[11px] [&_thead_tr_th]:border-r [&_thead_tr_th]:border-blue-500 [&_thead_tr_th:last-child]:border-r-0 [&_thead_tr_th_button]:hover:bg-transparent [&_thead_tr_th_button]:hover:text-white [&_tbody_tr_td]:text-[11px] [&_tbody_tr_td]:py-1.5 [&_tbody_tr_td]:border-r [&_tbody_tr_td]:border-slate-100 [&_tbody_tr_td:last-child]:border-r-0 [&_tbody_tr:nth-child(even)]:bg-slate-50/60 transition-colors">
                                    <GenericDataTable
                                        data={data}
                                        columns={columns}
                                        isLoading={false}
                                        isSearchRequired={false}
                                        noDataTitle="No Students Found"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Footer Section */}
                <div className="bg-white px-6 py-4 flex justify-end items-center border-t no-print shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative z-10">
                    <Button onClick={onClose} className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white text-[11px] font-black h-9 px-6 rounded-sm uppercase tracking-widest shadow-md transition-all active:scale-95">
                        <XCircle className="mr-2.5 h-4 w-4" /> Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
