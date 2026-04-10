'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { GenericDataTable, useDataTableProps } from '@/components/ui/view-data-table/view-generic-data-table';
import { UsePcRequisitionReport } from '@/hooks/pettycash/PcRequisitionReport';
import type { ApiSearchparams } from '@/types';
import type { RequisitionReport } from '@/types/pettycash/PcRequisitionReport';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { use, useState } from 'react';
import SimpleRequisitionReport from './components/report-form';

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
    const tableProps = useDataTableProps(response);
    const [isAddFormOpen, setIsAddFormOpen] = useState(true);
    const closeAddForm = () => setIsAddFormOpen(false);

    return (
        <div className="min-h-screen">
            <div className="container space-y-6 p-4">
                {/* Report Form */}
                {isAddFormOpen && (
                    <CollapsibleSection title="Report Parameters" defaultOpen>
                        <div className="relative">
                            <SimpleRequisitionReport onSearch={(params) => setApiParams({ ...apiParams, ...params })} />
                        </div>
                    </CollapsibleSection>
                )}

                {/* Report Grid */}
                
            </div>
        </div>
    );
}
