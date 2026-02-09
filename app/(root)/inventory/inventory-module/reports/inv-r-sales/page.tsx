'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Heading } from '@/components/layout/heading';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import ReportForm from './_components/report-form';
import { getColumns } from './_components/columns';
import { IInvRSalesReportData } from '@/types/inventory/reports/inv-r-sales';
import { Badge } from '@/components/ui/badge';
import { useQueryState, parseAsInteger } from 'nuqs';
import { InvRSalesSchema } from '@/schemas/inventory/reports/inv-r-sales';
import { getInvRSalesReport } from '@/server/inventory/reports/inv-r-sales';

import { toast } from 'sonner';

export default function InvRSalesPage() {
    const [currentPage, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
    const [pageSize, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(10));
    const [reportData, setReportData] = useState<IInvRSalesReportData[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPayload, setCurrentPayload] = useState<InvRSalesSchema | null>(null);
    const [showReport, setShowReport] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleReportSubmit = (payload: InvRSalesSchema | null) => {
        // Handle reset or empty
        if (!payload || Object.keys(payload).length === 0) {
            setCurrentPayload(null);
            setReportData([]);
            setTotalRecords(0);
            setShowReport(false);
            return;
        }

        setCurrentPayload(payload);
        if (currentPage !== 1) {
            setPage(1);
        }
        setShowReport(true);
    };

    const fetchPageData = useCallback(async () => {
        if (!currentPayload) return;

        setIsLoading(true);
        try {
            const response = await getInvRSalesReport(currentPayload as any, {
                page: currentPage,
                page_size: pageSize
            });

            if (response.success) {
                setReportData(response.data.get_SalesReport || []);
                setTotalRecords(response.total ?? response.data.get_SalesReport?.length ?? 0);
            } else {
                toast.error(response.message || 'Failed to generate report');
                setReportData([]);
                setTotalRecords(0);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, currentPayload]);

    useEffect(() => {
        if (currentPayload) {
            fetchPageData();
        }
    }, [currentPage, pageSize, fetchPageData]);

    const columns = getColumns(
        currentPayload?.typeflag || 'All',
        currentPayload?.optionflag,
        currentPayload?.showTax || false,
        currentPayload?.showDiscount || false,
        currentPage,
        pageSize
    );

    const totals = reportData.reduce((acc, curr) => {
        const amount = curr.total_Amount ?? curr.invtsL_Amount ?? curr.saleAmount ?? curr.invtsl_Amount ?? 0;
        const tax = curr.tax_Amt ?? curr.invtsL_TaxAmt ?? curr.saleTax ?? curr.invtsl_TaxAmt ?? 0;
        const discount = curr.discount_Amt ?? curr.invtsL_DiscountAmt ?? curr.saleDiscount ?? curr.invtsl_DiscountAmt ?? 0;

        return {
            amount: acc.amount + Number(amount),
            tax: acc.tax + Number(tax),
            discount: acc.discount + Number(discount)
        };
    }, { amount: 0, tax: 0, discount: 0 });

    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef, // Using contentRef as requested by runtime error
        documentTitle: `Sales Report - ${new Date().toISOString().split('T')[0]}`,
        pageStyle: `
            @page { size: auto; margin: 10mm; }
            @media print {
                body { -webkit-print-color-adjust: exact; }
                .overflow-hidden { overflow: visible !important; }
                .overflow-auto { overflow: visible !important; }
                .h-full { height: auto !important; }
            }
        `
    } as any);

    const tableProps = useDataTableProps({
        enablePagination: true,
        enableSorting: false,
        enableSearching: false,
    });

    return (
        <div className="space-y-6">
            <Heading
                title="Sales Report"
                description="Generate Sales Reports"
            />

            <ReportForm onSubmit={handleReportSubmit} isLoading={isLoading} />

            {showReport && (
                <CollapsibleSection title="Report Result" defaultOpen={true}>
                    <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center bg-muted/20 p-2 rounded border">
                            <div className="flex gap-2 items-center">
                                <span className="font-semibold text-sm">Total Records:</span>
                                <Badge variant="secondary">{totalRecords}</Badge>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handlePrint()}>
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </Button>
                        </div>

                        <div ref={componentRef} className="print:p-4">
                            {/* Print Header */}
                            <div className="hidden print:block text-center mb-6">
                                <h1 className="text-2xl font-bold">Sales Report</h1>
                                <p className="text-sm text-gray-500">Generated on: {new Date().toLocaleDateString()}</p>
                            </div>

                            <GenericDataTable
                                {...tableProps}
                                data={reportData}
                                columns={columns}
                                totalItems={totalRecords}
                                isLoading={isLoading}
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
        </div>
    );
}
