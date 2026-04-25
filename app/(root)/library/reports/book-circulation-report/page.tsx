'use client';

import { useState } from 'react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { ReportForm } from './_components/report-form';
import { getColumns } from './_components/columns';
import { useBookCirculationReportSearch } from '@/hooks/library/reports/useBookCirculationReport';
import { IBookCirculationReportGridData, IBookCirculationReportRequest } from '@/types/library/reports/book-circulation-report';

export default function BookCirculationReportPage() {
    const [view, setView] = useState<'form' | 'grid'>('form');
    const [reportData, setReportData] = useState<IBookCirculationReportGridData[]>([]);
    const [memberType, setMemberType] = useState<string>('Student');

    const searchMutation = useBookCirculationReportSearch();

    const handleSearch = (data: IBookCirculationReportRequest) => {
        setMemberType(data.AGType); // Store member type to select columns
        searchMutation.mutate(data, {
            onSuccess: (response) => {
                const list = response.data?.reportlist || [];
                setReportData(list);
                if (list.length > 0) {
                    setView('grid');
                }
            }
        });
    };

    return (
        <div className='space-y-4'>
            <CollapsibleSection
                title='Book Circulation Report: Form'
                isOpen={view === 'form'}
                onToggle={() => setView(view === 'form' ? 'grid' : 'form')}
                defaultOpen={true}
            >
                <ReportForm onSearch={handleSearch} isLoading={searchMutation.isPending} />
            </CollapsibleSection>

            {reportData.length > 0 && (
                <CollapsibleSection
                    title='Book Circulation Report Grid'
                    isOpen={view === 'grid'}
                    onToggle={() => setView(view === 'grid' ? 'form' : 'grid')}
                >
                    <GenericDataTable
                        columns={getColumns(memberType)}
                        data={reportData}
                        isLoading={false}
                    />
                </CollapsibleSection>
            )}
        </div>
    );
}
