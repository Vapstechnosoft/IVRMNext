
'use client';

import { useState } from 'react';
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

export default function InvRSalesPage() {
    const [reportData, setReportData] = useState<IInvRSalesReportData[]>([]);
    const [currentTypeFlag, setCurrentTypeFlag] = useState<string>('All');
    const [currentOptionFlag, setCurrentOptionFlag] = useState<string | undefined>(undefined);
    const [showTax, setShowTax] = useState(false);
    const [showDiscount, setShowDiscount] = useState(false);
    const [showReport, setShowReport] = useState(false);

    const handleReportGenerated = (
        data: IInvRSalesReportData[],
        typeflag: string,
        optionflag?: string,
        tax?: boolean,
        disc?: boolean
    ) => {
        setReportData(data);
        setCurrentTypeFlag(typeflag);
        setCurrentOptionFlag(optionflag);
        setShowTax(!!tax);
        setShowDiscount(!!disc);
        setShowReport(true);
    };

    const columns = getColumns(currentTypeFlag, currentOptionFlag, showTax, showDiscount);

    // Calculate Totals based on available fields (Angular logic sums fields dynamically)
    const totals = reportData.reduce((acc, curr) => {
        const amount = curr.invtsL_Amount || curr.saleAmount || 0;
        const tax = curr.invtsL_TaxAmt || curr.saleTax || 0;
        const discount = curr.invtsL_DiscountAmt || curr.saleDiscount || 0;

        return {
            amount: acc.amount + Number(amount),
            tax: acc.tax + Number(tax),
            discount: acc.discount + Number(discount)
        };
    }, { amount: 0, tax: 0, discount: 0 });

    const tableProps = useDataTableProps({
        enablePagination: true,
        enableSorting: true,
        enableSearching: true,
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
                                <Badge variant="secondary">{reportData.length}</Badge>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </Button>
                        </div>

                        <GenericDataTable
                            {...tableProps}
                            data={reportData}
                            columns={columns}
                            isLoading={false}
                        />

                        {/* Summary Card */}
                        {reportData.length > 0 && (
                            <div className="flex justify-end">
                                <Card className="w-full md:w-[400px] bg-muted/10">
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm pt-0">
                                        {showDiscount && (
                                            <div className="flex justify-between text-destructive">
                                                <span>Total Discount (-):</span>
                                                <span className="font-mono">{totals.discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {showTax && (
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
