
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Heading } from '@/components/layout/heading';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import ReportForm from './_components/report-form';
import { getColumns } from './_components/columns';
import { IInvRItemConsumptionPayload } from '@/types/inventory/reports/inv-r-item-consumption';
import { parseAsInteger, useQueryState } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';
import { getInvRItemConsumptionReport } from '@/server/inventory/reports/inv-r-item-consumption';
import { toast } from 'sonner';

export default function InvRItemConsumptionPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [currentPayload, setCurrentPayload] = useState<IInvRItemConsumptionPayload | null>(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [showReport, setShowReport] = useState(false);
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

    const handleReportGenerated = (payload: any) => { // Updated Signature
        if (payload) {
            setCurrentPayload(payload);
            setCurrentPage(1);
            setShowReport(true);
            // Report data will be fetched by useEffect
        } else {
            // Reset
            setReportData([]);
            setCurrentPayload(null);
            setTotalRecords(0);
            setShowReport(false);
            setIsLoading(false);
        }
    };

    // Handle pagination changes (Next/Prev/PageSize)
    const fetchPageData = useCallback(async (pageIndex: number, pgSize: number) => {
        if (!currentPayload) return;

        setIsLoading(true);
        const searchParams = {
            page: pageIndex,
            page_size: pgSize
        };

        const result = await getInvRItemConsumptionReport(currentPayload, searchParams);

        if (result.success) {
            if (!result.data.get_ICReport || result.data.get_ICReport.length === 0) {
                toast.warning("No records found.");
                setReportData([]);
                setTotalRecords(0);
                setShowReport(false);
            } else {
                setReportData(result.data.get_ICReport);
                setTotalRecords(result.total || 0);
            }
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

    const columns = getColumns(currentPayload?.typeflag || 'All', currentPayload?.optionflag);

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

            <ReportForm onReportGenerated={handleReportGenerated} isLoading={isLoading} />

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
                            isLoading={isLoading}
                            totalItems={totalRecords}
                        />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
