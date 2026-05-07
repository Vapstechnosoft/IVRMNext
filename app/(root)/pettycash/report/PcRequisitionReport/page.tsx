'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { GenericDataTable, useDataTableProps } from '@/components/ui/view-data-table/view-generic-data-table';
import { UsePcRequisitionReport } from '@/hooks/pettycash/report/PcRequisitionReport';
import type { ApiSearchparams } from '@/types';
import type { RequisitionReport } from '@/types/pettycash/report/PcRequisitionReport';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { use, useState } from 'react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import SimpleRequisitionReport from './components/report-form';
import RequisitionReportGrid from './components/Report';
import { getParticularDetail } from '@/server/pettycash/report/PcRequisitionReport';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function PcRequisitionPage(props: { searchParams: SearchParams }) {
    const initialSearchParams = use(props.searchParams);

    return (
        <FormProvider<RequisitionReport>>
            <PcRequisitionPageContent initialSearchParams={initialSearchParams as ApiSearchparams} />
        </FormProvider>
    );
}

function PcRequisitionPageContent({
    initialSearchParams
}: {
    initialSearchParams: ApiSearchparams;
}) {
    const [apiParams, setApiParams] = useState<ApiSearchparams>(() => {
        const p: any = initialSearchParams ?? {};
        return {
            ...p,
            page: p.page ? Number(p.page) : undefined,
            page_size: p.page_size ? Number(p.page_size) : undefined
        };
    });

    const { data: response, isLoading } = UsePcRequisitionReport(apiParams);
    const [isAddFormOpen, setIsAddFormOpen] = useState(true);

    const reportRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: reportRef
    });

    // Extract report data and institution info based on the provided backend structure
    const data = response?.data;
    const reportData = data?.getoverallreport || data?.getparticularreport || data?.getparticularsreport || [];
    const institutionInfo = data?.institutiondetails?.[0] || data?.institutiondetails?.$values?.[0];

    const handleParticularClick = async (id: number) => {
        const payload = {
            PCMPART_Id: id,
            Fromdate: apiParams.fromDate,
            Todate: apiParams.toDate
        };
        const res = await getParticularDetail(payload);
        return res?.data?.getparticulardetails || res?.data || [];
    };

    return (
        <div className="min-h-screen bg-gray-50/30">
            <div className="container space-y-6 p-6">
                {/* Report Form */}
                {isAddFormOpen && (
                    <CollapsibleSection title="Report Generation Parameters" defaultOpen>
                        <div className="relative">
                            <SimpleRequisitionReport onSearch={(params) => setApiParams({ ...apiParams, ...params })} />
                        </div>
                    </CollapsibleSection>
                )}

                {/* Report Grid */}
                {reportData.length > 0 && (
                    <div ref={reportRef}>
                        <RequisitionReportGrid
                            reportData={reportData}
                            institutionInfo={institutionInfo}
                            reportParams={apiParams as any}
                            onPrint={() => handlePrint()}
                            onParticularClick={handleParticularClick}
                        />
                    </div>
                )}

                {!isLoading && reportData.length === 0 && apiParams.fromDate && (
                    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <X className="h-12 w-12 text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium">No records found for the selected period.</p>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or date range.</p>
                    </div>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] animate-pulse">Generating Report Analytics...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

