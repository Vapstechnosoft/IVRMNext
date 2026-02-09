'use client';

import { useState } from 'react';
import { Heading } from '@/components/layout/heading';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Button } from '@/components/ui/button';
import { Printer, FileSpreadsheet } from 'lucide-react';
import ReportForm from './_components/report-form';
import { IInvRMonthEndReportData, IInvRMonthEndReportPayload, IInvRMonthEndReportTableRow } from '@/types/inventory/reports/inv-r-month-end-report';
import { getInvRMonthEndReport } from '@/server/inventory/reports/inv-r-month-end-report';
import { toast } from 'sonner';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { columns } from './_components/columns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function InvRMonthEndReportPage() {
    const [reportData, setReportData] = useState<IInvRMonthEndReportData | null>(null);
    const [currentPayload, setCurrentPayload] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showReport, setShowReport] = useState(false);

    const handleReportGenerated = async (data: IInvRMonthEndReportPayload, extraPayload: any) => {
        setIsLoading(true);
        const result = await getInvRMonthEndReport(data);
        if (result.success && result.data) {
            setReportData(result.data);
            setCurrentPayload({ ...data, ...extraPayload }); // Merge with extra info like Year/Month names
            setShowReport(true);
        } else {
            setReportData(null);
            setShowReport(false);
            toast.error(result.message || "No records found");
        }
        setIsLoading(false);
    };

    const handlePrint = () => {
        window.print();
    };

    const getTableData = (): IInvRMonthEndReportTableRow[] => {
        if (!reportData) return [];
        return [
            {
                id: 1,
                inventory: 'GRN',
                count: reportData.grnCount,
                sms: reportData.sms,
                email: reportData.email
            },
            {
                id: 2,
                inventory: 'SALES',
                count: reportData.salesCount,
                sms: reportData.sms,
                email: reportData.email
            },
            {
                id: 3,
                inventory: 'ITEM CONSUMPTION',
                count: reportData.itemCount,
                sms: reportData.sms,
                email: reportData.email
            }
        ];
    };

    const tableData = getTableData();

    const handleExport = () => {
        if (!reportData) return;
        const dataToExport = tableData.map(row => ({
            "SL.NO": row.id,
            "INVENTORY": row.inventory,
            "COUNT": row.count,
            "SMS": row.sms,
            "EMAIL": row.email
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Month End Report");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
        saveAs(data, "Inventory_Month_End_Report.xlsx");
    };

    const chartData = reportData ? [
        { name: 'GRN COUNT', count: reportData.grnCount },
        { name: 'SALES COUNT', count: reportData.salesCount },
        { name: 'ITEM CONS.', count: reportData.itemCount },
        { name: 'SMS COUNT', count: reportData.sms },
        { name: 'EMAIL COUNT', count: reportData.email },
    ] : [];

    return (
        <div className="space-y-6">
            <div className="print:hidden">
                <Heading
                    title="Inventory Month End Report"
                    description="Generate Inventory Month End Report"
                />
            </div>

            <div className="print:hidden">
                <ReportForm onReportGenerated={handleReportGenerated} isLoading={isLoading} />
            </div>

            {showReport && reportData && currentPayload && (
                <CollapsibleSection title="Report Result" defaultOpen={true}>
                    <div className="p-4 space-y-8 bg-white text-black" id="printable-area">
                        {/* Header Section mimicking the Angular template */}
                        <div className="flex flex-col items-center justify-center space-y-2 mb-8">
                            <h3 className="text-xl font-bold uppercase underline">
                                INVENTORY {currentPayload.Month_Name} MONTH END REPORT
                            </h3>
                        </div>

                        {/* Info Section */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="space-y-2">
                                <div className="grid grid-cols-[100px_1fr]">
                                    <span className="font-semibold">Name</span>
                                    <span>: {currentPayload.IE_Name}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr]">
                                    <span className="font-semibold">Designation</span>
                                    <span>: Implementation Engineer</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr]">
                                    <span className="font-semibold">Module</span>
                                    <span>: Inventory</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="grid grid-cols-[100px_1fr]">
                                    <span className="font-semibold">Date</span>
                                    <span>: {format(new Date(), 'dd/MM/yyyy')}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr]">
                                    <span className="font-semibold">Year</span>
                                    <span>: {currentPayload.ASMAY_Year}</span>
                                </div>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="mb-8">
                            <GenericDataTable
                                data={tableData}
                                columns={columns}
                                isLoading={isLoading}
                                totalItems={tableData.length}
                                isSearchRequired={false}
                                isPaginationRequired={false}
                            />
                        </div>

                        {/* Chart Section */}
                        <div className="h-[300px] w-full mb-8 print:hidden">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#3b82f6" name="Count" barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Signature Section */}
                        <div className="grid grid-cols-2 gap-16 mt-16 pt-8 break-inside-avoid">
                            <div className="space-y-12">
                                <div className="border-t border-black pt-2 w-48">Implementation Engineer:</div>
                                <div className="border-t border-black pt-2 w-48">End User:</div>
                            </div>
                            <div className="space-y-12">
                                <div className="border-t border-black pt-2 w-48">Nodal Officer:</div>
                                <div className="border-t border-black pt-2 w-32">Seal</div>
                            </div>
                        </div>

                        {/* Action Buttons (Hidden in Print) */}
                        <div className="flex justify-center gap-4 mt-8 print:hidden">
                            <Button variant="outline" onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </Button>
                            <Button variant="outline" onClick={handleExport}>
                                <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" /> Export Excel
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
