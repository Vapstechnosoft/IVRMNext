'use client';

import { useState } from 'react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { ReportForm } from './_components/report-form';
import { getColumns } from './_components/columns';
import { Search } from 'lucide-react';
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

    const handlePrint = () => {
        if (reportData.length > 0) {
            window.print();
        }
    };

    const handleExport = () => {
        if (reportData.length > 0) {
            // Placeholder for excel export logic
            console.log('Exporting to Excel...', reportData);
        }
    };

    return (
        <div className='space-y-4 print:p-0'>
            <CollapsibleSection
                title='Book Circulation Report: Form'
                isOpen={view === 'form'}
                onToggle={() => setView(view === 'form' ? 'grid' : 'form')}
                defaultOpen={true}
                className='print:hidden'
            >
                <ReportForm 
                    onSearch={handleSearch} 
                    isLoading={searchMutation.isPending}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    hasData={reportData.length > 0}
                />
            </CollapsibleSection>

            {reportData.length > 0 && (
                <div className="mx-auto max-w-4xl border rounded-sm overflow-hidden shadow-sm bg-white">
                    {/* Header Bar - Exactly like Reference */}
                    <div className="bg-[#3f51b5] px-4 py-2 flex items-center justify-between">
                        <h2 className="text-white font-bold text-sm uppercase tracking-wider">Book Circulation Reports</h2>
                    </div>
                    {/* Orange accent line */}
                    <div className="h-1 bg-[#ff9800]" />
                    
                    <div className="p-4 space-y-4">
                        {/* Records Count & Search Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-700">Total Grid Records :</span>
                                <span className="bg-slate-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    {reportData.length}
                                </span>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="search here..." 
                                    className="w-full pl-8 pr-3 py-1.5 border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-[#3f51b5]"
                                />
                            </div>
                        </div>

                        <GenericDataTable
                            columns={getColumns(memberType)}
                            data={reportData}
                            isLoading={false}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
