'use client';

import { useState, useCallback, useMemo, use, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';

import { Heading } from "@/components/layout/heading";
import { GenericDataTable, useDataTableProps } from "@/components/ui/data-table/generic-data-table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    IInvVendorPaymentDetails,
    IInvVendorPaymentOverallReport,
    IInvVendorPaymentReportPayload,
    IInvVendorPaymentVendorReport,
} from "@/types/inventory/reports/inv-r-vendor-payment";
import { tableSearchVariables } from '@/lib/data-table.config';

import { overallColumns, vendorDetailsColumns, vendorPaymentColumns } from "./_components/columns";
import VendorPaymentReportForm from "./_components/vendor-payment-report-form";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import { Badge } from "@/components/ui/badge";
import { Printer, FileSpreadsheet } from "lucide-react";
import { useInvVendorDetails, useInvVendorPaymentReportQuery } from "@/hooks/inventory/reports/use-inv-r-vendor-payment";
import { getInvVendorPaymentReport } from '@/server/inventory/reports/inv-r-vendor-payment';
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { InvVendorPaymentPrint } from "./_components/inv-r-vendor-payment-print";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function VendorPaymentReportPage(props: { searchParams: Promise<any> }) {
    const searchParams = use(props.searchParams);
    const [currentPayload, setCurrentPayload] = useState<IInvVendorPaymentReportPayload | null>(null);
    const [reportType, setReportType] = useState<"Overall" | "Vendor">("Overall");

    // Details State
    const [detailsData, setDetailsData] = useState<IInvVendorPaymentDetails[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVendorName, setSelectedVendorName] = useState("");
    const [printData, setPrintData] = useState<any[]>([]);
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

    const { data: reportResult, isFetching } = useInvVendorPaymentReportQuery(currentPayload, {
        ...searchParams,
        page: currentPage,
        page_size: pageSize,
        search_query: searchQuery
    });

    const reportData = reportResult?.data || [];
    const totalRecords = reportResult?.total || 0;

    const { mutate: fetchDetails, isPending: isDetailsLoading } = useInvVendorDetails();

    const handleReportGenerated = (payload: IInvVendorPaymentReportPayload | null) => {
        if (payload) {
            // Show toast for empty initial report
            if (totalRecords === 0 && !isFetching && currentPayload) {
                toast.error("No record found");
            }
            setCurrentPayload(payload);
            setReportType(payload.reporttype);
            setCurrentPage(1);
            setSearchQuery(null);
        } else {
            setCurrentPayload(null);
            setCurrentPage(1);
            setSearchQuery(null);
        }
    };

    // Show toast for empty search results or initial empty report
    useEffect(() => {
        if (!isFetching && currentPayload && totalRecords === 0) {
            toast.error("No record found");
        }
    }, [isFetching, totalRecords, searchQuery, currentPayload]);

    const handleVendorClick = useCallback((vendor: IInvVendorPaymentVendorReport) => {
        if (!currentPayload) return;

        setSelectedVendorName(vendor.vendorName);

        const payload = {
            INVMS_Id: vendor.invmS_Id,
            Fromdate: currentPayload.Fromdate,
            Todate: currentPayload.Todate,
        };

        fetchDetails(payload, {
            onSuccess: (response: any) => {
                if (response.success) {
                    // Handle various data structures as seen in original code
                    const data = Array.isArray(response.data.getvendordetails)
                        ? response.data.getvendordetails
                        : response.data.getvendordetails?.$values || [];
                    setDetailsData(data);
                    setIsModalOpen(true);
                } else {
                    setDetailsData([]);
                    // Toast handled by hook or here? Hook handles onError, but we check success flag here.
                    // The hook has onSuccess but we are overriding it here to handle specific data structure?
                    // Wait, useMutation options override definition? No, they chain/merge usually.
                    // Let's rely on manual check here.
                    if (response.message) toast.error(response.message);
                }
            }
        });
    }, [currentPayload, fetchDetails]);

    const columns = useMemo(() => {
        return reportType === "Overall"
            ? overallColumns
            : vendorPaymentColumns(handleVendorClick);
    }, [reportType, handleVendorClick]);

    // Calculate Totals for Main Table
    const totals = useMemo(() => {
        return reportData.reduce((acc: any, curr: any) => {
            if (reportType === "Overall") {
                const item = curr as IInvVendorPaymentOverallReport;
                return {
                    amount: acc.amount + Number(item.invmgrN_TotalPaid || 0),
                    paid: 0,
                    balance: 0
                };
            } else {
                const item = curr as IInvVendorPaymentVendorReport;
                return {
                    amount: acc.amount + Number(item.totalAmount || 0),
                    paid: acc.paid + Number(item.totalPaidAmount || 0),
                    balance: acc.balance + Number(item.balanceAmount || 0),
                };
            }
        }, { amount: 0, paid: 0, balance: 0 });
    }, [reportData, reportType]);

    // Calculate Totals for Details Modal
    const detailsTotals = useMemo(() => {
        return detailsData.reduce((acc, curr) => {
            return {
                amount: acc.amount + Number(curr.totalAmount || 0),
                paid: acc.paid + Number(curr.totalPaidAmount || 0),
                balance: acc.balance + Number(curr.balanceAmount || 0),
            };
        }, { amount: 0, paid: 0, balance: 0 });
    }, [detailsData]);

    const tableProps = useDataTableProps({
        enablePagination: true,
        enableSorting: true,
        enableSearching: true,
        isSearchRequired: true,
    });

    const handlePrintContent = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Vendor Payment Report - ${new Date().toISOString().split('T')[0]}`
    });

    const fetchAllData = async (action: 'print' | 'excel') => {
        if (!currentPayload) return [];
        try {
            toast.loading(`Fetching all records for ${action}...`, { id: 'fetch-all' });
            
            const p: any = {
                ...currentPayload,
            };

            const response = await getInvVendorPaymentReport(p, { ...searchParams, page: 1, page_size: 100000, search_query: searchQuery || '' });
            
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
            const rType = currentPayload?.reporttype || 'Overall';

            dataToExport = allData.map((row: any, index: number) => {
                const base: any = {
                    "SL.No": index + 1
                };

                if (rType === 'Overall') {
                    base["Supplier"] = row.invmS_SupplierName || '';
                    base["Payment Date"] = row.invspT_PaymentDate ? format(new Date(row.invspT_PaymentDate), 'dd-MM-yyyy') : '';
                    base["Mode Of Payment"] = row.invspT_ModeOfPayment || '';
                    base["Amount"] = Number(row.invmgrN_TotalPaid || 0).toFixed(2);
                    base["Remarks"] = row.invspT_Remarks || '';
                } else if (rType === 'Vendor') {
                    base["Vendor Name"] = row.vendorName || '';
                    base["GST No"] = row.gstNo || '';
                    base["Amount"] = Number(row.totalAmount || 0).toFixed(2);
                    base["Paid Amount"] = Number(row.totalPaidAmount || 0).toFixed(2);
                    base["Balance Amount"] = Number(row.balanceAmount || 0).toFixed(2);
                }

                return base;
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "VP Report");
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
            saveAs(data, "Vendor_Payment_Report.xlsx");
            toast.success('Excel downloaded successfully');
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            <Heading
                title="Vendor Payment Report"
                description="View overall and vendor-wise payment reports."
            />

            <VendorPaymentReportForm
                onReportGenerated={handleReportGenerated}
                isLoading={isFetching}
            />

            {currentPayload && (
                <CollapsibleSection title="Report Result" defaultOpen={true}>
                    <div className="p-6 space-y-8 bg-white text-slate-900 rounded-lg shadow-sm border border-slate-200">
                        {/* Header Section */}
                        <div className="flex flex-col items-center justify-center space-y-3 mb-8 border-b border-slate-200 pb-6">
                            <h3 className="text-3xl font-bold uppercase tracking-tight text-slate-800 text-center">
                                Vendor Payment Report
                            </h3>
                            <div className="w-24 h-1 bg-primary rounded-full"></div>
                            <p className="text-lg font-medium text-slate-600 uppercase tracking-wide">
                                {currentPayload.Fromdate ? format(new Date(currentPayload.Fromdate), 'dd/MM/yyyy') : 'N/A'} - {currentPayload.Todate ? format(new Date(currentPayload.Todate), 'dd/MM/yyyy') : 'N/A'}
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
                                    <Badge variant="outline" className="border-primary/30 text-primary uppercase text-[10px]">{currentPayload.reporttype}</Badge>
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

                        <div className="relative">
                            <GenericDataTable
                                {...tableProps}
                                data={reportData}
                                columns={columns as any}
                                isLoading={isFetching}
                                totalItems={totalRecords}
                                isSearchRequired={true}
                                noDataTitle="No Payments Found"
                                noDataDescription="No records found matching your vendor or date selection."
                            />
                        </div>

                        {/* Summary Footer */}
                        {reportData.length > 0 && (
                            <div className="flex justify-end mt-4">
                                <Card className="w-full md:w-[400px] bg-muted/10 print:bg-transparent print:border-none print:shadow-none">
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-sm font-semibold uppercase text-muted-foreground print:text-black">Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm pt-0">
                                        <div className="flex justify-between font-medium">
                                            <span>Total Amount:</span>
                                            <span className="font-mono">{totals.amount.toFixed(2)}</span>
                                        </div>
                                        {reportType === "Vendor" && (
                                            <>
                                                <div className="flex justify-between text-green-600 print:text-black">
                                                    <span>Total Paid:</span>
                                                    <span className="font-mono">{totals.paid.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-destructive print:text-black">
                                                    <span>Total Balance:</span>
                                                    <span className="font-mono">{totals.balance.toFixed(2)}</span>
                                                </div>
                                            </>
                                        )}
                                        <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                            <span>Net Total:</span>
                                            <span className="font-mono">{(totals.amount).toFixed(2)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </CollapsibleSection>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Vendor Payment Details - {selectedVendorName}</DialogTitle>
                        <div className="text-sm text-muted-foreground">
                            {currentPayload && (
                                <span>
                                    {format(new Date(currentPayload.Fromdate), "dd-MM-yyyy")} TO {format(new Date(currentPayload.Todate), "dd-MM-yyyy")}
                                </span>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => window.print()}>
                                Print Details
                            </Button>
                        </div>
                        <GenericDataTable
                            data={detailsData}
                            columns={vendorDetailsColumns}
                            isLoading={isDetailsLoading}
                            totalItems={detailsData.length}
                            isSearchRequired={false}
                        />

                        {/* Details Summary */}
                        {detailsData.length > 0 && (
                            <div className="flex justify-end">
                                <Card className="w-full md:w-1/2 bg-muted/20">
                                    <CardContent className="py-2 text-sm">
                                        <div className="grid grid-cols-3 gap-4 font-semibold text-center">
                                            <div>
                                                <div className="text-xs text-muted-foreground">Total Amount</div>
                                                <div>{detailsTotals.amount.toFixed(2)}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Total Paid</div>
                                                <div>{detailsTotals.paid.toFixed(2)}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Total Balance</div>
                                                <div>{detailsTotals.balance.toFixed(2)}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
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
                <InvVendorPaymentPrint ref={componentRef} data={printData} payload={currentPayload} />
            </div>
        </div>
    );
}
