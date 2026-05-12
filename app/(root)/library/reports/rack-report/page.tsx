'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useRackReportSearch } from '@/hooks/library/reports/useRackReport';
import type { IRackReportGridData, IRackReportRequest } from '@/types/library/reports/rack-report';
import { useState } from 'react';
import { RackReportColumns } from './_components/columns';
import { ReportForm } from './_components/report-form';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RackReportPage() {
    const [view, setView] = useState<'form' | 'grid'>('form');
    const [reportData, setReportData] = useState<IRackReportGridData[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const searchMutation = useRackReportSearch();

    const handleSearch = (data: IRackReportRequest) => {
        searchMutation.mutate(data, {
            onSuccess: (response) => {
                const list = response.reportlist || [];
                setReportData(list);
                setHasSearched(true);
                
                if (list.length > 0) {
                    setView('grid');
                    toast.success(`Found ${list.length} records`);
                } else {
                    setView('form'); // Keep form open if no data
                    toast.info('No records found for the selected criteria');
                }
            },
            onError: (error) => {
                toast.error('Failed to fetch report data');
                console.error(error);
            }
        });
    };

    return (
        <div className='space-y-4'>
            <CollapsibleSection
                title='Rack Report: Form'
                isOpen={view === 'form'}
                onToggle={() => setView(view === 'form' ? 'grid' : 'form')}
                defaultOpen={true}>
                <ReportForm onSearch={handleSearch} isLoading={searchMutation.isPending} />
            </CollapsibleSection>

            {hasSearched && (
                <Card className='border border-muted shadow-sm'>
                    <CardHeader className='pb-3 border-b'>
                        <CardTitle className='text-sm font-semibold text-primary'>
                            Rack Report Grid {reportData.length > 0 && `(${reportData.length} Records)`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='p-0'>
                        <GenericDataTable
                            columns={RackReportColumns}
                            data={reportData}
                            isLoading={searchMutation.isPending}
                            defaultVisibility={{
                                slNo: true,
                                lmbano_AccessionNo: true,
                                lmb_BookTitle: true,
                                rack_Name: true,
                                lmra_FloorName: true,
                                lmb_BookType: true,
                                rack_Location: true,
                                lmbano_AvialableStatus: true
                            }}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
