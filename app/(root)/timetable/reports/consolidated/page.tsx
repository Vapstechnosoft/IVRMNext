'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getConsolidatedReport, getConsolidatedReportDetails } from '@/server/timetable/reports/consolidated';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import ConsolidatedForm from './_components/consolidated-form';
import ConsolidatedReportGrid from './_components/consolidated-report-grid';

export default function ConsolidatedReportPage() {
    const [initialData, setInitialData] = useState<any>({});
    const [reportData, setReportData] = useState<any[]>([]);
    const [fullReportResponse, setFullReportResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState<string>('');
    const componentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await getConsolidatedReportDetails({});
                if (response?.success && response.data) {
                    console.log("Consolidated Report Details Data Keys:", Object.keys(response.data));
                    setInitialData(response.data);
                }
            } catch (error) {
                console.error("Error fetching consolidated report details:", error);
            }
        };
        fetchDetails();
    }, []);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Consolidated_Report_${reportType}`,
    });

    const handleFormSubmit = async (payload: any) => {
        if (payload.CLEAR) {
            setReportData([]);
            setFullReportResponse(null);
            console.log("payload", payload)
            return;

        }
        console.log("payload", payload)

        setLoading(true);
        setReportType(payload.TYPE);

        try {
            const response: any = await getConsolidatedReport(payload);
            if (response) {
                setFullReportResponse(response);
                // Extract main table data based on response structure
                const data = response.finaltable || response.data || (Array.isArray(response) ? response : []);
                setReportData(data);

                if (data.length === 0 && (!response.finaltable || response.finaltable.length === 0)) {
                    toast.info('No data found for the selected criteria');
                }
            } else {
                toast.error('Failed to fetch report data');
            }
        } catch (error) {
            console.error('Error fetching consolidated report:', error);
            toast.error('An error occurred while generating the report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Consolidated Report' defaultOpen={true}>
                <ConsolidatedForm initialData={initialData} onSubmit={handleFormSubmit} />
            </CollapsibleSection>

            {loading && (
                <div className='flex items-center justify-center p-12'>
                    <RefreshCw className='h-8 w-8 animate-spin text-purple-600' />
                    <span className='ml-3 font-medium text-purple-800 text-lg'>Processing Report Data...</span>
                </div>
            )}

            {reportData.length > 0 && !loading && (
                <CollapsibleSection
                    title={`${reportType.replace('_', ' ')} Consolidated Report`}
                    defaultOpen={true}
                >
                    <div className='p-2' ref={componentRef}>
                        <ConsolidatedReportGrid
                            reportData={reportData}
                            fullResponse={fullReportResponse}
                            onPrint={handlePrint}
                            reportType={reportType}
                        />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
