
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
import { IInvRItemConsumptionReportData } from '@/types/inventory/reports/inv-r-item-consumption';
import { Badge } from '@/components/ui/badge';

export default function InvRItemConsumptionPage() {
    const [reportData, setReportData] = useState<IInvRItemConsumptionReportData[]>([]);
    const [currentTypeFlag, setCurrentTypeFlag] = useState<string>('All');
    const [currentOptionFlag, setCurrentOptionFlag] = useState<string | undefined>(undefined);
    const [showReport, setShowReport] = useState(false);

    const handleReportGenerated = (data: IInvRItemConsumptionReportData[], typeflag: string, optionflag?: string) => {
        setReportData(data);
        setCurrentTypeFlag(typeflag);
        setCurrentOptionFlag(optionflag);
        setShowReport(true);
    };

    const columns = getColumns(currentTypeFlag, currentOptionFlag);

    const tableProps = useDataTableProps({
        enablePagination: true,
        enableSorting: true,
        enableSearching: true,
    });

    return (
        <div className="space-y-6">
            <Heading
                title="Item Consumption Report"
                description="Generate Item Consumption Reports"
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
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
