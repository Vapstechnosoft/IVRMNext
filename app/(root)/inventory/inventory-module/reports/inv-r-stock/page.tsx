'use client';

import { useState, use, useEffect, useRef } from 'react';
import { Heading } from '@/components/layout/heading';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { format } from 'date-fns';

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
    const [pageSize] = useQueryState(
        tableSearchVariables.page_size,
        parseAsInteger.withOptions({ shallow: false }).withDefault(10)
    );
    const [searchQuery, setSearchQuery] = useQueryState(
        tableSearchVariables.search,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );
    const [searchColumns, setSearchColumns] = useQueryState(
        tableSearchVariables.search_columns,
        parseAsString.withOptions({ shallow: false }).withDefault('All')
    );
    console.log("payload", currentPayload);

    const { data: reportResult, isFetching } = useInvRStockReportQuery(currentPayload, {
        ...searchParams,
        page: currentPage,
        page_size: pageSize,
        search_query: searchQuery,
        search_columns: searchColumns
    });
    console.log("reportResult", reportResult?.data);

    const reportData = reportResult?.data || [];
    const totalRecords = reportResult?.total || 0;

    const handleReportGenerated = (data: IInvRStockReportData[], payload: any, total: number) => {
        if (payload === null) {
            setCurrentPayload(null);
            setCurrentPage(1);
            setSearchQuery(null);
            setSearchColumns('All');
            return;
        }

        if (total === 0) {
            toast.error("No record found");
        }

        // Seed the query cache to avoid immediate refetch
        queryClient.setQueryData(['invRStockReport', payload, { ...searchParams, page: 1, page_size: pageSize, search_query: '' }], {
            success: true,
            data: data,
            total: total,
            page: 1,
            page_size: pageSize,
            message: 'Report generated successfully'
        });

        setCurrentPayload(payload);
        setCurrentPage(1);
        setSearchQuery(null);
        setSearchColumns('All');
    };

    // Show toast for empty search results or initial empty report
    useEffect(() => {
        if (!isFetching && currentPayload && totalRecords === 0) {
            toast.error("No record found");
        }
    }, [isFetching, totalRecords, searchQuery, currentPayload]);

    const isOverall = currentPayload?.overallflag === 'Overall';
    const columns = getColumns(currentPayload?.optionflag || 'All', isOverall);

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

            const allData = response?.data || [];

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
            const isOverall = currentPayload?.overallflag === 'Overall';

            dataToExport = allData.map((row: any, index: number) => {
                const base: any = {
                    "SL.No": index + 1
                };

                if (optionflag !== 'Item') { base["Item"] = row.invmI_ItemName || ''; }
                base["Opening Balance"] = Number(row.purOBQty || 0).toFixed(2);
                if (!isOverall) {
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

    const tableProps = useDataTableProps(reportResult);

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            <Heading
                title="Stock Report"
                description="Generate Inventory Stock Reports"
            />

            <ReportForm onReportGenerated={handleReportGenerated} />

            {currentPayload && (
                <CollapsibleSection title="Report Result" defaultOpen={true}>
                    <div className="p-6 space-y-8 bg-white text-slate-900 rounded-lg shadow-sm border border-slate-200">
                        {/* Header Section */}
                        <div className="flex flex-col items-center justify-center space-y-3 mb-8 border-b border-slate-200 pb-6">
                            <h3 className="text-3xl font-bold uppercase tracking-tight text-slate-800 text-center">
                                Stock Report
                            </h3>
                            <div className="w-24 h-1 bg-primary rounded-full"></div>
                            <p className="text-lg font-medium text-slate-600 uppercase tracking-wide">
                                {currentPayload.startdate ? format(new Date(currentPayload.startdate), 'dd/MM/yyyy') : 'N/A'} - {currentPayload.enddate ? format(new Date(currentPayload.enddate), 'dd/MM/yyyy') : 'N/A'}
                            </p>
                        </div>

                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex gap-4 items-center">
                                <div className="flex gap-2 items-center">
                                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Total Records:</span>
                                    <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-200">{totalRecords}</Badge>
                                </div>
                                <div className="h-4 w-[1px] bg-slate-300"></div>
                                <div className="flex gap-2 items-center">
                                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Type:</span>
                                    <Badge variant="outline" className="border-primary/30 text-primary uppercase text-[10px]">{currentPayload.optionflag}</Badge>
                                </div>
                            </div>
                            <div className="flex gap-3 items-center">
                                <Button
                                    variant="outline"
                                    className="w-fit border-green-600 text-green-700 hover:bg-green-50 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                                    onClick={handleExportExcel}
                                >
                                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                                    onClick={handlePrint}
                                >
                                    <Printer className="mr-2 h-4 w-4" /> Print
                                </Button>
                            </div>
                        </div>

                        <div>
                            <GenericDataTable
                                {...tableProps}
                                columns={columns}
                                isLoading={isFetching}
                                totalItems={totalRecords}
                                isSearchRequired={true}
                                showSearchColumns={true}
                                noDataTitle="No Stock Records Found"
                                noDataDescription="No records found matching your selection or search criteria."
                            />

                            {/* Total Closing Stock (Only if OptionFlag is Item) */}
                            {currentPayload?.optionflag === 'Item' && reportData.length > 0 && (
                                <div className="flex justify-end mt-4">
                                    <Card className="w-full md:w-[350px] bg-muted/10 border-slate-200 print:bg-transparent print:border-none print:shadow-none shadow-sm">
                                        <CardHeader className="py-3">
                                            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground print:text-black">Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 flex justify-between items-center border-t mt-2">
                                            <span className="font-bold text-slate-700">Closing Stock:</span>
                                            <span className="font-mono text-xl font-bold text-primary">{closingStockTotal.toFixed(2)}</span>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
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
