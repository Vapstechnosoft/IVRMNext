
'use client';

import { useState, use } from 'react';
import { Heading } from '@/components/layout/heading';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer, FileSpreadsheet } from 'lucide-react';
import ReportForm from './_components/report-form';
import { getColumns } from './_components/columns';
import { IInvRItemConsumptionPayload, IInvRItemConsumptionReportData } from '@/types/inventory/reports/inv-r-item-consumption';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';
import { useInvRItemConsumptionReportQuery } from '@/hooks/inventory/reports/use-inv-r-item-consumption';
import { getInvRItemConsumptionReport } from '@/server/inventory/reports/inv-r-item-consumption';
import { toast } from 'sonner';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { InvRItemConsumptionPrint } from './_components/inv-r-item-consumption-print';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export default function InvRItemConsumptionPage(props: { searchParams: Promise<any> }) {
    const searchParams = use(props.searchParams);
    const [currentPayload, setCurrentPayload] = useState<IInvRItemConsumptionPayload | null>(null);
    const [printData, setPrintData] = useState<IInvRItemConsumptionReportData[]>([]);
    const componentRef = useRef<HTMLDivElement>(null);

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

    // Prepare payload for hook (convert Dates to strings to avoid serialization issues/hook unnecessary updates)
    const payloadForHook = currentPayload ? {
        ...currentPayload,
        startdate: currentPayload.startdate ? new Date(currentPayload.startdate).toISOString() : undefined,
        enddate: currentPayload.enddate ? new Date(currentPayload.enddate).toISOString() : undefined,
    } : null;

    const { data: reportResult, isFetching } = useInvRItemConsumptionReportQuery(payloadForHook as any, {
        ...searchParams,
        page: currentPage,
        page_size: pageSize,
        search_query: searchQuery
    });

    const reportData = reportResult?.data?.get_ICReport || [];
    const totalRecords = reportResult?.total || 0;

    const handleReportGenerated = (payload: any) => {
        if (payload) {
            setCurrentPayload(payload);
            setCurrentPage(1);
            setSearchQuery(null);
        } else {
            setCurrentPayload(null);
            setCurrentPage(1);
            setSearchQuery(null);
        }
    };

    const columns = getColumns(currentPayload?.typeflag || 'All', currentPayload?.optionflag);

    const tableProps = useDataTableProps({
        enablePagination: true,
        enableSorting: true,
        enableSearching: true,
        isSearchRequired: true,
    });

    const handlePrintContent = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Item Consumption Report - ${new Date().toISOString().split('T')[0]}`
    });

    const fetchAllData = async (action: 'print' | 'excel') => {
        if (!currentPayload) return [];
        try {
            toast.loading(`Fetching all records for ${action}...`, { id: 'fetch-all' });
            
            const p: any = {
                ...currentPayload,
                startdate: currentPayload.startdate ? new Date(currentPayload.startdate).toISOString() : undefined,
                enddate: currentPayload.enddate ? new Date(currentPayload.enddate).toISOString() : undefined,
            };

            const response = await getInvRItemConsumptionReport(p, { ...searchParams, page: 1, page_size: 100000, search_query: searchQuery || '' });
            
            const allData = response?.data?.get_ICReport || [];
            
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
            const typeflag = currentPayload?.typeflag || 'All';
            const optionflag = currentPayload?.optionflag;

            dataToExport = allData.map((row: any, index: number) => {
                const base: any = {
                    "SL.No": index + 1
                };

                const dateVal = row.icDate ? format(new Date(row.icDate), 'dd/MM/yyyy') : '';

                if (typeflag === 'Overall') {
                    if (optionflag === 'Item') {
                        base["Item"] = row.itemName || '';
                        base["UOM"] = row.invmuoM_UOMName || '';
                        base["Quantity"] = Number(row.icQty || 0).toFixed(2);
                    } else if (optionflag === 'Staff') {
                        base["Employee Name"] = row.memberName || '';
                        base["Employee Code"] = row.memberCode || '';
                        base["Quantity"] = Number(row.icQty || 0).toFixed(2);
                    } else if (optionflag === 'Department') {
                        base["Department"] = row.memberName || '';
                        base["Quantity"] = Number(row.icQty || 0).toFixed(2);
                    } else if (optionflag === 'Student') {
                        base["Student Name"] = row.memberName || '';
                        base["Admission No."] = row.memberCode || '';
                        base["Quantity"] = Number(row.icQty || 0).toFixed(2);
                    }
                } else if (typeflag === 'Detailed' && optionflag === 'Item') {
                    base["Item"] = row.itemName || '';
                    base["UOM"] = row.invmuoM_UOMName || '';
                    base["Date"] = dateVal;
                    base["Quantity"] = Number(row.icQty || 0).toFixed(2);
                } else {
                    base["Item"] = row.itemName || '';
                    base["UOM"] = row.invmuoM_UOMName || '';
                    base["Date"] = dateVal;
                    base["Quantity"] = Number(row.icQty || 0).toFixed(2);
                }

                return base;
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "IC Report");
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
            saveAs(data, "Item_Consumption_Report.xlsx");
            toast.success('Excel downloaded successfully');
        }
    };

    return (
        <div className="space-y-6">
            <Heading
                title="Item Consumption Report"
                description="Generate Item Consumption Reports"
            />

            <ReportForm onReportGenerated={handleReportGenerated} isLoading={isFetching} />

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

                        <GenericDataTable
                            {...tableProps}
                            data={reportData}
                            columns={columns}
                            isLoading={isFetching}
                            totalItems={totalRecords}
                        />
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
                <InvRItemConsumptionPrint ref={componentRef} data={printData} payload={currentPayload} />
            </div>
        </div>
    );
}
