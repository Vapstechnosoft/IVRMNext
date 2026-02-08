'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import ReportForm from './_components/report-form';
import { getColumns } from './_components/columns';
import { IInvRGRNPayload, IInvRGRNReportData } from '@/types/inventory/reports/inv-r-grn';
import { Badge } from '@/components/ui/badge';
import { getInvRGRNReport } from '@/server/inventory/reports/inv-r-grn';
import { toast } from 'sonner';
import { parseAsInteger, useQueryState } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';

export default function InvRGRNPage() {
    const [reportData, setReportData] = useState<IInvRGRNReportData[]>([]);
    const [currentPayload, setCurrentPayload] = useState<IInvRGRNPayload | null>(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Pagination State synced with URL (same as DataTable)
    const [currentPage, setCurrentPage] = useQueryState(
        tableSearchVariables.page,
        parseAsInteger.withOptions({ shallow: false }).withDefault(1)
    );
    const [pageSize] = useQueryState(
        tableSearchVariables.page_size,
        parseAsInteger.withOptions({ shallow: false }).withDefault(10)
    );

    // Handle initial report generation (Page 1)
    const handleReportGenerated = (data: IInvRGRNReportData[], payload: IInvRGRNPayload, total: number) => {
        setReportData(data);
        setCurrentPayload(payload);
        setTotalRecords(total);
        // Reset to page 1
        setCurrentPage(1);
    };

    // Handle pagination changes (Next/Prev/PageSize)
    const fetchPageData = useCallback(async (pageIndex: number, pgSize: number) => {
        if (!currentPayload) return;

        setIsLoading(true);
        const searchParams = {
            page: pageIndex, // API expects 1-based index
            page_size: pgSize
        };

        const result = await getInvRGRNReport(currentPayload, searchParams);

        if (result.success) {
            setReportData(result.data.get_grnreport);
            setTotalRecords(result.total);
        } else {
            toast.error(result.message);
        }
        setIsLoading(false);
    }, [currentPayload]);


    useEffect(() => {
        // Trigger fetch when pagination changes, but only if payload exists.
        // We verify if we are NOT on the initial load where handleReportGenerated set everything.
        // If we want to avoid double fetch: handleReportGenerated puts data for Page 1 directly.
        // And we assume if page is 1 and data is present, we skip fetch?
        // But if user changes filter and re-generates on Page 1, we want the form's data.
        // If user paginates back to Page 1, we want to fetch.

        // Let's assume simpler approach: Always fetch if payload exists, BUT the Form handles the *initial* fetch.
        // If handleReportGenerated just ran, we might double fetch if we are not careful.
        // But given the simplicity request, double fetch on "Generate Report" is acceptable if it ensures consistent state.

        if (currentPayload) {
            fetchPageData(currentPage, pageSize);
        }
    }, [currentPage, pageSize, currentPayload, fetchPageData]);


    const columns = getColumns(currentPayload?.typeflag || 'All', (currentPayload as any)?.optionflag, currentPage, pageSize);

    // Calculate Totals (Client side sum of CURRENT PAGE)
    const totals = reportData.reduce((acc, curr) => {
        // Handle casing and report type variations
        const qty = curr.invtgrn_qty ?? curr.invtgrN_Qty ?? curr.grnQuantity ?? curr.grnquantity ?? 0;
        const rate = curr.invtgrn_purchaserate ?? curr.invtgrN_PurchaseRate ?? curr.grnRate ?? curr.grnrate ?? 0;
        const tax = curr.invtgrn_taxamt ?? curr.invtgrN_TaxAmt ?? curr.grnTax ?? curr.grntax ?? 0;
        const discount = curr.invtgrn_discountamt ?? curr.invtgrN_DiscountAmt ?? curr.grnDiscount ?? curr.grndiscount ?? 0;
        const amount = curr.invtgrn_amount ?? curr.invtgrN_Amount ?? curr.grnAmount ?? curr.grnamount ?? 0;

        const basic = Number(qty) * Number(rate);

        return {
            basic: acc.basic + basic,
            tax: acc.tax + Number(tax),
            discount: acc.discount + Number(discount),
            final: acc.final + Number(amount)
        };
    }, { basic: 0, tax: 0, discount: 0, final: 0 });

    // Validate if Final approx Basic + Tax - Discount. Use API 'amount' as truth, or calculated if 0.
    const displayFinal = totals.final > 0 ? totals.final : (totals.basic + totals.tax - totals.discount);

    return (
        <div className="space-y-6">
            <Heading
                title="GRN Report"
                description="Generate Goods Receipt Note Reports"
            />

            <ReportForm
                onReportGenerated={(data, payload, total) => {
                    setReportData(data);
                    setCurrentPayload(payload);
                    setTotalRecords(total);
                    setCurrentPage(1);
                }}
            />

            {totalRecords > 0 && (
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
                            data={reportData}
                            columns={columns}
                            isLoading={isLoading}
                        
                            totalItems={totalRecords}
                            isSearchRequired={true}
                        // enableSorting={true} - Handled by columns definitions usually
                        />

                        {/* Summary Card */}
                        {reportData.length > 0 && (
                            <div className="flex justify-end">
                                <Card className="w-full md:w-[400px] bg-muted/10">
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Summary (Current Page)</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm pt-0">
                                        <div className="flex justify-between">
                                            <span>Total Amount (Basic):</span>
                                            <span className="font-mono">{totals.basic.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-green-600">
                                            <span>Total Tax (+):</span>
                                            <span className="font-mono">{totals.tax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-destructive">
                                            <span>Total Discount (-):</span>
                                            <span className="font-mono">{totals.discount.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                            <span>Final Amount:</span>
                                            <span className="font-mono">{displayFinal.toFixed(2)}</span>
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
