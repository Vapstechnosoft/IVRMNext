

'use client';
import { useState, use } from 'react';
import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, FileSpreadsheet } from 'lucide-react';
import ReportForm from './_components/report-form';
import { getColumns } from './_components/columns';
import { IInvRStockReportData, IInvRStockPayload } from '@/types/inventory/reports/inv-r-stock';
import { Badge } from '@/components/ui/badge';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';
import { useInvRStockReportQuery } from '@/hooks/inventory/reports/use-inv-r-stock';
import { useQueryClient } from '@tanstack/react-query';
import { getInvRStockReport } from '@/server/inventory/reports/inv-r-stock';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import { InvRStockPrint } from './_components/inv-r-stock-print';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useRef } from 'react';

// Helper function to calculate closing stock
const calculateClosingStock = (data: IInvRStockReportData[]) => {
    return data.reduce((acc, curr) => acc + (curr.invstO_AvaiableStock || 0), 0);
};

export default function InvRStockPage(props: { searchParams: Promise<any> }) {
    const searchParams = use(props.searchParams);
    const [currentPayload, setCurrentPayload] = useState<IInvRStockPayload | null>(null);
    const [printData, setPrintData] = useState<IInvRStockReportData[]>([]);
    const componentRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    // Pagination & Search State synced with URL
    const [currentPage, setCurrentPage] = useQueryState(
        tableSearchVariables.page,
        parseAsInteger.withOptions({ shallow: false }).withDefault(1)
    );
    const [pageSize, setPageSize] = useQueryState(
        tableSearchVariables.page_size,
        parseAsInteger.withOptions({ shallow: false }).withDefault(10)
    );
    const [searchQuery, setSearchQuery] = useQueryState(
        tableSearchVariables.search,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );

    const { data: reportResult, isFetching } = useInvRStockReportQuery(currentPayload, {
        ...searchParams,
        page: currentPage,
        page_size: pageSize,
        search_query: searchQuery
    });

    const reportData = reportResult?.data?.get_StockReport || [];
    const totalRecords = reportResult?.total || 0;

    const handleReportGenerated = (data: IInvRStockReportData[], payload: any, total: number) => {
        // Seed the query cache to avoid immediate refetch
        queryClient.setQueryData(['invRStockReport', payload, { ...searchParams, page: 1, page_size: pageSize, search_query: '' }], {
            success: true,
            data: { get_StockReport: data },
            total: total,
            page: 1,
            page_size: pageSize,
            message: 'Report generated successfully'
        });

        setCurrentPayload(payload);
        setCurrentPage(1);
        setSearchQuery(null);
    };

    const columns = getColumns(currentPayload?.optionflag || 'All', currentPayload?.overallflag || false);

    // Calculate Closing Stock Totals
    const closingStockTotal = calculateClosingStock(reportData);

    const handlePrintContent = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Stock Report - ${new Date().toISOString().split('T')[0]}`
    });

    const fetchAllData = async (action: 'print' | 'excel') => {
        if (!currentPayload) return [];
        try {
            toast.loading(`Fetching all records for ${action}...`, { id: 'fetch-all' });
            
            const response = await getInvRStockReport(currentPayload, { ...searchParams, page: 1, page_size: 100000, search_query: searchQuery || '' });
            
            const allData = response?.data?.get_StockReport || [];
            
            if (allData.length === 0) {
                toast.dismiss('fetch-all');
                toast.error(`Failed to fetch ${action} data`);
                return [];
            }
            toast.dismiss('fetch-all');
            return allData;
        } catch (error) {
             console.error(`${action} fetch error:`, error);
             toast.dismiss('fetch-all');
             toast.error(`Error fetching ${action} data`);
             return [];
        }
    };

    const handlePrint = async () => {
        const allData = await fetchAllData('print');
        if (allData.length > 0) {
            setPrintData(allData);
            toast.success(`Ready to print ${allData.length} records`);
            setTimeout(() => {
                handlePrintContent();
            }, 500);
        }
    };

    const handleExportExcel = async () => {
        const allData = await fetchAllData('excel');
        if (allData.length > 0) {
            let dataToExport: any[] = [];
            
            const optionflag = currentPayload?.optionflag || 'All';
            const overallflag = currentPayload?.overallflag || false;

            dataToExport = allData.map((row: any, index: number) => {
                const base: any = {
                    "SL.No": index + 1
                };

                if (optionflag !== 'Item') { base["Item"] = row.invmI_ItemName || ''; }
                base["Opening Balance"] = Number(row.purOBQty || 0).toFixed(2);
                if (!overallflag) {
                    base["Rate"] = Number(row.invstO_PurchaseRate || 0).toFixed(2);
                    base["OB Amount"] = Number(row.obAmount || 0).toFixed(2);
                }
                base["Sale Qty"] = Number(row.salesQty || 0).toFixed(2);
                base["Item Cons."] = Number(row.invstO_ItemConQty || 0).toFixed(2);
                base["Checked Out"] = Number(row.invstO_CheckedOutQty || 0).toFixed(2);
                base["Stock +"] = Number(row.invstO_PhyPlusQty || 0).toFixed(2);
                base["Stock -"] = Number(row.invstO_PhyMinQty || 0).toFixed(2);
                base["Balance"] = Number(row.invstO_AvaiableStock || 0).toFixed(2);

                return base;
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Report");
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
            saveAs(data, "Stock_Report.xlsx");
            toast.success('Excel downloaded successfully');
        }
    };

    return (
        <div className="space-y-6">
            <Heading
                title="Stock Report"
                description="Generate Inventory Stock Reports"
            />

            <ReportForm onReportGenerated={handleReportGenerated} />

            {reportData.length > 0 && (
                <CollapsibleSection title="Report Result" defaultOpen={true}>
                    <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center bg-muted/20 p-2 rounded border">
                            <div className="flex gap-2 items-center">
                                <span className="font-semibold text-sm">Total Records:</span>
                                <Badge variant="secondary">{totalRecords}</Badge>
                            </div>
                            <div className="flex gap-2 items-center">
                                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
                                </Button>
                                <Button variant="outline" size="sm" onClick={handlePrint}>
                                    <Printer className="mr-2 h-4 w-4" /> Print
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <GenericDataTable
                                data={reportData}
                                columns={columns}
                                isLoading={isFetching}
                                totalItems={totalRecords}
                                isSearchRequired={true}
                            // enableSorting={true} // Usually handled by columns
                            />
                        </div>

                        {/* Total Closing Stock (Only if OptionFlag is Item) */}
                        {currentPayload?.optionflag === 'Item' && (
                            <div className="flex justify-end mt-4">
                                <Card className="w-full md:w-[300px] bg-muted/10">
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <span className="font-bold">Closing Stock:</span>
                                        <span className="font-mono text-lg font-bold">{closingStockTotal.toFixed(2)}</span>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                    </div>
                </CollapsibleSection>
            )}

            {/* Hidden Print Component */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    overflow: 'visible',
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: -1
                }}>
                <InvRStockPrint ref={componentRef} data={printData} payload={currentPayload} />
            </div>
        </div>
    );
}
