
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
import { IInvRStockReportData } from '@/types/inventory/reports/inv-r-stock';
import { Badge } from '@/components/ui/badge';

export default function InvRStockPage() {
    const [reportData, setReportData] = useState<IInvRStockReportData[]>([]);
    const [currentOptionFlag, setCurrentOptionFlag] = useState<string>('All');
    const [currentOverallFlag, setCurrentOverallFlag] = useState<boolean>(false);
    const [showReport, setShowReport] = useState(false);

    const handleReportGenerated = (data: IInvRStockReportData[], optionflag: string, overallflag: boolean) => {
        setReportData(data);
        setCurrentOptionFlag(optionflag);
        setCurrentOverallFlag(overallflag);
        setShowReport(true);
    };

    const columns = getColumns(currentOptionFlag, currentOverallFlag);

    // Calculate Closing Stock Totals (Angular: clstoc)
    const closingStockTotal = reportData.reduce((acc, curr) => acc + (curr.invstO_AvaiableStock || 0), 0);

    const tableProps = useDataTableProps({
        enablePagination: true,
        enableSorting: true,
        enableSearching: true,
    });

    return (
        <div className="space-y-6">
            <Heading
                title="Stock Report"
                description="Generate Inventory Stock Reports"
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

                        <div className="relative">
                            <GenericDataTable
                                {...tableProps}
                                data={reportData}
                                columns={columns}
                                isLoading={false}
                            />
                        </div>

                        {/* Total Closing Stock (Only if OptionFlag is Item, mimicking Angular behavior or generally useful) */}
                        {/* Angular: <tr ng-if="optionflag == 'Item'"> ... Closing Stock ... </tr> */}
                        {/* We can show it always or conditionally. Let's show it if option is Item for strict adherence, or maybe generally. */}
                        {currentOptionFlag === 'Item' && (
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
        </div>
    );
}
