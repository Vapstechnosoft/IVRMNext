
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
import { IInvRGRNReportData } from '@/types/inventory/reports/inv-r-grn';
import { Badge } from '@/components/ui/badge';

export default function InvRGRNPage() {
    const [reportData, setReportData] = useState<IInvRGRNReportData[]>([]);
    const [currentTypeFlag, setCurrentTypeFlag] = useState<string>('All');
    const [currentOptionFlag, setCurrentOptionFlag] = useState<string | undefined>(undefined);
    const [showReport, setShowReport] = useState(false);

    const handleReportGenerated = (data: IInvRGRNReportData[], typeflag: string, optionflag?: string) => {
        setReportData(data);
        setCurrentTypeFlag(typeflag);
        setCurrentOptionFlag(optionflag);
        setShowReport(true);
    };

    const columns = getColumns(currentTypeFlag, currentOptionFlag);

    // Calculate Totals
    const totals = reportData.reduce((acc, curr) => {
        // Handle field differences based on type
        const amount = curr.invtgrN_Amount || curr.grnAmount || 0;
        const tax = curr.invtgrN_TaxAmt || curr.grnTax || 0;
        const discount = curr.invtgrN_DiscountAmt || curr.grnDiscount || 0;

        return {
            amount: acc.amount + Number(amount),
            tax: acc.tax + Number(tax),
            discount: acc.discount + Number(discount)
        };
    }, { amount: 0, tax: 0, discount: 0 });

    const finalAmount = totals.amount; // In the mock data/types, Amount is usually total. In angular code: amount + tax - discount logic might be applied OR amount is already net.
    // Angular: finalamt = totalamt + totaltax - totaldiscount;
    // But columns usually show "Total Amount" which might be Basic + Tax - Disc??
    // Angular logic: totalamt += grn.INVTGRN_Amount. 
    // And final = totalamt + totaltax - totaldiscount.
    // Wait, usually INVTGRN_Amount is the line total. If it excludes tax, then we add.
    // In Angular: INVTGRN_Amount aggregates to totalamt.
    // Let's assume the math: Final = Amount + Tax - Discount.
    // This looks odd if Amount is "Total Amount". Assuming "Amount" is "Basic Amount" here based on that formula.

    const calculatedFinal = totals.amount + totals.tax - totals.discount;

    const tableProps = useDataTableProps({
        enablePagination: true,
        enableSorting: true,
        enableSearching: true,
    });

    return (
        <div className="space-y-6">
            <Heading
                title="GRN Report"
                description="Generate Goods Receipt Note Reports"
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
                                        <div className="flex justify-between">
                                            <span>Total Amount (Basic):</span>
                                            <span className="font-mono">{totals.amount.toFixed(2)}</span>
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
                                            <span className="font-mono">{calculatedFinal.toFixed(2)}</span>
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
