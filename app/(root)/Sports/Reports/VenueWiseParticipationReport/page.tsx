'use client';

import { useState } from "react";
import { ReportForm } from "./_components/report-form";
import { ReportGrid } from "./_components/report-grid";
import { useVenueWiseParticipationReport } from "@/hooks/sports/useVenueWiseParticipationReport";
import { IVenueWiseReportData } from "@/types/sports/reports/venue-wise-participation-report";
import { Loader2 } from "lucide-react";

export default function VenueWiseParticipationReportPage() {
    const { dropdowns } = useVenueWiseParticipationReport();
    const [reportData, setReportData] = useState<IVenueWiseReportData[]>([]);

    if (dropdowns.isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

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
                    dropdowns={dropdowns.data!}
                    onReportGenerated={setReportData}
                />
            </div>

            {reportData.length > 0 && (
                <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Venue Wise Participation Report</h2>
                    </div>
                    <ReportGrid data={reportData} />
                </div>
            )}
        </div>
    );
}
