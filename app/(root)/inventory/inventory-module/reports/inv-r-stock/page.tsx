

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heading } from '@/components/layout/heading';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import ReportForm from './_components/report-form';
import { getColumns } from './_components/columns';
import { IInvRStockReportData, IInvRStockPayload } from '@/types/inventory/reports/inv-r-stock';
import { Badge } from '@/components/ui/badge';
import { parseAsInteger, useQueryState } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';
import { getInvRStockReport } from '@/server/inventory/reports/inv-r-stock';
import { toast } from 'sonner';

export default function InvRStockPage() {
    const [reportData, setReportData] = useState<IInvRStockReportData[]>([]);
    const [currentPayload, setCurrentPayload] = useState<IInvRStockPayload | null>(null);
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

    const handleReportGenerated = (data: IInvRStockReportData[], payload: any, total: number) => {
        setReportData(data);
        setCurrentPayload(payload);
        setTotalRecords(total);
        setCurrentPage(1);
    };

    // Handle pagination changes (Next/Prev/PageSize)
    const fetchPageData = useCallback(async (pageIndex: number, pgSize: number) => {
        if (!currentPayload) return;

        setIsLoading(true);
        const searchParams = {
            page: pageIndex,
            page_size: pgSize
        };

        const result = await getInvRStockReport(currentPayload, searchParams);

        if (result.success) {
            setReportData(result.data.get_StockReport);
            setTotalRecords(result.total);
        } else {
            toast.error(result.message);
        }
        setIsLoading(false);
    }, [currentPayload]);


    useEffect(() => {
        if (currentPayload) {
            fetchPageData(currentPage, pageSize);
        }
    }, [currentPage, pageSize, currentPayload, fetchPageData]);


    const columns = getColumns(currentPayload?.optionflag || 'All', currentPayload?.overallflag || false);

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

            {reportData.length > 0 && (
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

                        <div className="relative">
                            <GenericDataTable
                                {...tableProps}
                                data={reportData}
                                columns={columns}
                                isLoading={isLoading}
                                totalItems={totalRecords}
                            />
                        </div>

                        {/* Total Closing Stock (Only if OptionFlag is Item, mimicking Angular behavior or generally useful) */}
                        {currentPayload?.optionflag === 'Item' && (
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
