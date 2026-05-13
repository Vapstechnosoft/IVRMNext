'use client';
 
import { use, useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Heading } from '@/components/layout/heading';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, FileSpreadsheet } from 'lucide-react';
import ReportForm from './_components/report-form';
import { getColumns } from './_components/columns';
import { Badge } from '@/components/ui/badge';
import { useQueryState, parseAsInteger, parseAsString } from 'nuqs';
import { InvRSalesSchema } from '@/schemas/inventory/reports/inv-r-sales';
import { tableSearchVariables } from '@/lib/data-table.config';
import { useInvRSalesReportQuery } from '@/hooks/inventory/reports/use-inv-r-sales';
import { getInvRSalesReport } from '@/server/inventory/reports/inv-r-sales';
import { toast } from 'sonner';
import { InvRSalesPrint } from './_components/inv-r-sales-print';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
 
interface ReportTotals {
    amount: number;
    tax: number;
    discount: number;
}
 
const calculateReportTotals = (data: any[]): ReportTotals => {
    return data.reduce((acc: ReportTotals, curr: any) => {
        const amount = curr.total_Amount ?? curr.invtsL_Amount ?? curr.saleAmount ?? curr.invtsl_Amount ?? 0;
        const tax = curr.tax_Amt ?? curr.invtsL_TaxAmt ?? curr.saleTax ?? curr.invtsl_TaxAmt ?? 0;
        const discount = curr.discount_Amt ?? curr.invtsL_DiscountAmt ?? curr.saleDiscount ?? curr.invtsl_DiscountAmt ?? 0;
 
        return {
            amount: acc.amount + Number(amount),
            tax: acc.tax + Number(tax),
            discount: acc.discount + Number(discount)
        };
    }, { amount: 0, tax: 0, discount: 0 } as ReportTotals);
};
 
export default function InvRSalesPage(props: { searchParams: Promise<any> }) {
    const searchParams = use(props.searchParams);
    const [currentPage, setPage] = useQueryState(
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
 
    const [currentPayload, setCurrentPayload] = useState<InvRSalesSchema | null>(null);
    const [printData, setPrintData] = useState<any[]>([]);
 
    const payloadForHook = currentPayload ? {
        ...currentPayload,
        startdate: currentPayload.startdate instanceof Date ? currentPayload.startdate.toISOString() : currentPayload.startdate,
        enddate: currentPayload.enddate instanceof Date ? currentPayload.enddate.toISOString() : currentPayload.enddate,
    } : null;
 
    const { data: reportResult, isFetching } = useInvRSalesReportQuery(payloadForHook as any, {
        ...searchParams,
        page: currentPage,
        page_size: pageSize,
        search_query: searchQuery
    });
 
    const reportData = reportResult?.data?.get_SalesReport || [];
    const totalRecords = reportResult?.total || 0;
 
    const handleReportSubmit = (payload: InvRSalesSchema | null) => {
        // Handle reset or empty
        if (!payload || Object.keys(payload).length === 0) {
            setCurrentPayload(null);
            setPage(1);
            setSearchQuery(null);
            return;
        }
 
        // Show toast for empty initial report
        if (totalRecords === 0 && !isFetching && currentPayload) {
            toast.error("No record found");
        }
 
        setCurrentPayload(payload);
        setPage(1);
        setSearchQuery(null);
    };
 
    // Show toast for empty search results or initial empty report
    useEffect(() => {
        if (!isFetching && currentPayload && totalRecords === 0) {
            toast.error("No record found");
        }
    }, [isFetching, totalRecords, searchQuery, currentPayload]);
 
    const columns = getColumns(
        currentPayload?.typeflag || 'All',
        currentPayload?.optionflag,
        currentPayload?.showTax || false,
        currentPayload?.showDiscount || false,
        currentPage,
        pageSize
    );
 
    const totals = calculateReportTotals(reportData);
 
    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrintContent = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Sales Report - ${new Date().toISOString().split('T')[0]}`
    });
 
    const fetchAllData = async (action: 'print' | 'excel') => {
        if (!currentPayload) return [];
        try {
            toast.loading(`Fetching all records for ${action}...`, { id: 'fetch-all' });
            
            const p: any = {
                ...currentPayload,
                startdate: currentPayload.startdate instanceof Date ? currentPayload.startdate.toISOString() : currentPayload.startdate,
                enddate: currentPayload.enddate instanceof Date ? currentPayload.enddate.toISOString() : currentPayload.enddate,
            };
 
            const response = await getInvRSalesReport(p, { ...searchParams, page: 1, page_size: 100000, search_query: searchQuery || '' });
            
            const allData = response?.data?.get_SalesReport || [];
            
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
            const showTax = currentPayload?.showTax || false;
            const showDiscount = currentPayload?.showDiscount || false;
 
            dataToExport = allData.map((row: any, index: number) => {
                const base: any = {
                    "SL.No": index + 1
                };
 
                const saleDate = row.sales_Date || row.invmsL_SalesDate || row.invmsl_SalesDate;
 
                if (typeflag === 'All') {
                    base["Item"] = row.item_Name || row.invmI_ItemName || row.invmi_ItemName || '';
                    base["Sale No"] = row.invmsL_SalesNo || row.invmsl_SalesNo || row.Invmsl_SalesNo || '';
                    base["Sale Date"] = saleDate ? saleDate.split('T')[0] : '';
                } else if (typeflag === 'Detailed') {
                    base["Sale No"] = row.invmsL_SalesNo || row.invmsl_SalesNo || row.Invmsl_SalesNo || '';
                    base["Sale Date"] = saleDate ? saleDate.split('T')[0] : '';
                    base["Item"] = row.item_Name || row.invmI_ItemName || row.invmi_ItemName || '';
                    
                    if (['Student', 'Staff', 'Customer', 'Saleno'].includes(optionflag || '')) {
                        base["Name"] = row.membername || row.memberName || '';
                    }
                } else if (typeflag === 'Overall') {
                    if (optionflag === 'Item') {
                        base["Item"] = row.item_Name || row.invmI_ItemName || row.invmi_ItemName || '';
                    } else if (['Student', 'Staff', 'Customer'].includes(optionflag || '')) {
                         base["Name"] = row.membername || row.memberName || '';
                    }
                }
 
                base["Quantity"] = Number(row.sales_Qty ?? row.invtsL_SalesQty ?? row.saleQty ?? row.invtsl_SalesQty ?? 0).toFixed(2);
                base["Price"] = Number(row.sales_Price ?? row.invtsL_SalesPrice ?? row.salePrice ?? row.invtsl_SalesPrice ?? 0).toFixed(2);
                base["Amount"] = Number(row.total_Amount ?? row.invtsL_Amount ?? row.saleAmount ?? row.invtsl_Amount ?? 0).toFixed(2);
 
                if (showTax) {
                     base["Tax"] = Number(row.tax_Amt ?? row.invtsL_TaxAmt ?? row.saleTax ?? row.invtsl_TaxAmt ?? 0).toFixed(2);
                }
                if (showDiscount) {
                     base["Discount"] = Number(row.discount_Amt ?? row.invtsL_DiscountAmt ?? row.saleDiscount ?? row.invtsl_DiscountAmt ?? 0).toFixed(2);
                }
 
                return base;
            });
 
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
            saveAs(data, "Sales_Report.xlsx");
            toast.success('Excel downloaded successfully');
        }
    };
 
    const tableProps = useDataTableProps({
        enablePagination: true,
        enableSorting: false,
        enableSearching: true, // Grid Search enabled
        isSearchRequired: true,
    });
 
    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            <Heading
                title="Sales Report"
                description="Generate Sales Reports"
            />
 
            <ReportForm onSubmit={handleReportSubmit} isLoading={isFetching} />
 
            {currentPayload && (
                <CollapsibleSection title="Report Result" defaultOpen={true}>
                    <div className="p-6 space-y-8 bg-white text-slate-900 rounded-lg shadow-sm border border-slate-200">
                        {/* Header Section */}
                        <div className="flex flex-col items-center justify-center space-y-3 mb-8 border-b border-slate-200 pb-6">
                            <h3 className="text-3xl font-bold uppercase tracking-tight text-slate-800 text-center">
                                Sales Report
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
                                    <Badge variant="outline" className="border-primary/30 text-primary uppercase text-[10px]">{currentPayload.typeflag}</Badge>
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
                                data={reportData}
                                columns={columns}
                                totalItems={totalRecords}
                                isLoading={isFetching}
                                isSearchRequired={true}
                                noDataTitle="No Sales Found"
                                noDataDescription="No records found matching your search criteria."
                            />
 
                            {reportData.length > 0 && (
                                <div className="flex justify-end mt-4">
                                    <Card className="w-full md:w-[400px] bg-muted/10 print:bg-transparent print:border-none print:shadow-none">
                                        <CardHeader className="py-3">
                                            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground print:text-black">Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm pt-0">
                                            {(currentPayload?.showDiscount) && (
                                                <div className="flex justify-between text-destructive print:text-black">
                                                    <span>Total Discount (-):</span>
                                                    <span className="font-mono">{totals.discount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {(currentPayload?.showTax) && (
                                                <div className="flex justify-between text-green-600 print:text-black">
                                                    <span>Total Tax (+):</span>
                                                    <span className="font-mono">{totals.tax.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                                <span>Total Amount:</span>
                                                <span className="font-mono">{totals.amount.toFixed(2)}</span>
                                            </div>
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
                <InvRSalesPrint ref={componentRef} data={printData} payload={currentPayload} />
            </div>
        </div>
    );
}
