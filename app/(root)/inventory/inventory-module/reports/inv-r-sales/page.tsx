'use client';

import { useCallback, useEffect, useState } from 'react';
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

export default function InvRSalesPage() {
    const [currentPage, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
    const [pageSize, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(10));
    const [reportData, setReportData] = useState<IInvRSalesReportData[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPayload, setCurrentPayload] = useState<InvRSalesSchema | null>(null);
    const [showReport, setShowReport] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleReportGenerated = (
        data: IInvRSalesReportData[],
        payload: InvRSalesSchema,
        total: number
    ) => {
        setReportData(data);
        setCurrentPayload(payload);
        setTotalRecords(total);
        // Reset page to 1 if not already there, but useQueryState might trigger effect.
        // If we are at page 1, effect runs?
        // We set data here.
        if (currentPage !== 1) {
            setPage(1);
        }
        // Note: if page == 1, effect might still run if we don't guard it.
        // But double fetch is acceptable for now.

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
            }
        } catch (error) {
            console.error(error);
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
        const amount = curr.total_Amount ?? curr.invtsL_Amount ?? curr.saleAmount ?? 0;
        const tax = curr.tax_Amt ?? curr.invtsL_TaxAmt ?? curr.saleTax ?? 0;
        const discount = curr.discount_Amt ?? curr.invtsL_DiscountAmt ?? curr.saleDiscount ?? 0;

        return {
            amount: acc.amount + Number(amount),
            tax: acc.tax + Number(tax),
            discount: acc.discount + Number(discount)
        };
    }, { amount: 0, tax: 0, discount: 0 });

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

            <ReportForm onReportGenerated={handleReportGenerated} />

            {showReport && (
                <CollapsibleSection title="Report Result" defaultOpen={true}>
                    <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center bg-muted/20 p-2 rounded border">
                            <div className="flex gap-2 items-center">
                                <span className="font-semibold text-sm">Total Records:</span>
                                <Badge variant="secondary">{totalRecords}</Badge>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </Button>
                        </div>

                        <GenericDataTable
                            {...tableProps}
                            data={reportData}
                            columns={columns}
                           
                            totalItems={totalRecords}
                            isLoading={isLoading}
                        />

                        {reportData.length > 0 && (
                            <div className="flex justify-end">
                                <Card className="w-full md:w-[400px] bg-muted/10">
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm pt-0">
                                        {(currentPayload?.showDiscount) && (
                                            <div className="flex justify-between text-destructive">
                                                <span>Total Discount (-):</span>
                                                <span className="font-mono">{totals.discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {(currentPayload?.showTax) && (
                                            <div className="flex justify-between text-green-600">
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
                </CollapsibleSection>
            )}
        </div>
    );
}
