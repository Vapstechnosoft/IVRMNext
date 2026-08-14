'use client';

import { useState } from "react";
import { ReportForm } from "./_components/report-form";
import { ReportGrid } from "./_components/report-grid";
import { ISportVenueWiseParticipationReportPayload } from "@/types/sports/reports/venue-wise-participation-report";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';
import { useQuery } from '@tanstack/react-query';
import { useVenueWiseParticipationReport } from "@/hooks/sports/useVenueWiseParticipationReport";

export default function VenueWiseParticipationReportPage() {
    const [reportPayload, setReportPayload] = useState<ISportVenueWiseParticipationReportPayload | null>(null);
    const { generateReport } = useVenueWiseParticipationReport();

    // Table state from URL using nuqs
    const [page] = useQueryState(tableSearchVariables.page, parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withOptions({ shallow: false }).withDefault(10));
    const [sortBy] = useQueryState(tableSearchVariables.sort_column, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [order] = useQueryState(tableSearchVariables.sort_direction, parseAsStringLiteral(['asc', 'desc'] as const).withOptions({ shallow: false }).withDefault('asc'));
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [searchColumns] = useQueryState(tableSearchVariables.search_columns, parseAsString.withOptions({ shallow: false }).withDefault('all'));

    // Prepare combined payload
    const activePayload = reportPayload ? {
        ...reportPayload,
        page,
        page_size: pageSize,
        sort_column: sortBy,
        sort_direction: order,
        search_query: searchQuery,
        search_column: searchColumns || 'all',
    } : null;

    // React Query to fetch the paginated report data automatically when payload or table state changes
    const loadData = useQuery({
        queryKey: ['venue-wise-report', activePayload],
        queryFn: () => generateReport(activePayload!),
        enabled: !!activePayload,
        staleTime: 0
    });

    const handleReportGenerated = (payload: any) => {
        setReportPayload(payload);
    };

    const handleReset = () => {
        setReportPayload(null);
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Venue Wise Participation Report</h1>
                <p className="text-muted-foreground">
                    Generate reports based on House or Class/Section participation per venue.
                </p>
            </div>

            <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Report Selection</h2>
                </div>

                <ReportForm
                    onReportGenerated={handleReportGenerated}
                    onReset={handleReset}
                />
            </div>

            {reportPayload && (
                <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Venue Wise Participation Report</h2>
                    </div>
                    <ReportGrid 
                        response={loadData.data} 
                        isLoading={loadData.isLoading || loadData.isFetching} 
                        error={loadData.error} 
                    />
                </div>
            )}
        </div>
    );
}
