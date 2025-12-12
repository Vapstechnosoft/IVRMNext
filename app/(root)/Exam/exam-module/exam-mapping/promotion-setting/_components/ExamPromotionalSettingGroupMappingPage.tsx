'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { GenericDataTable, useDataTableProps } from '@/components/ui/view-data-table/view-generic-data-table';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PromotionalGroupMappingColumns } from './PromotionalGroupMappingColumns';

/* ==========================================================
   INTERFACE
========================================================== */
export interface IPromotionalGroupDetails {
    id: number;
    groupName: string;
    students: number;
}

/* ==========================================================
   MAIN PAGE WRAPPER
========================================================== */
export default function ExamSubjectWizardGroupMappingPage({
    rowData,
    onClose
}: {
    rowData: any;
    onClose: () => void;
}) {
    return (
        <FormProvider<IPromotionalGroupDetails>>
            <GroupMappingContent rowData={rowData} onClose={onClose} />
        </FormProvider>
    );
}

/* ==========================================================
   PAGE CONTENT
========================================================== */
function GroupMappingContent({ rowData, onClose }: { rowData: any; onClose: () => void }) {
    const [data, setData] = useState<IPromotionalGroupDetails[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!rowData) return;
        setLoading(true);

        try {
            // ← Replace with API hook if needed
            setData(rowData?.groups || []);
        } catch (err: any) {
            toast.error(err?.message ?? 'Failed to load group mapping');
        } finally {
            setLoading(false);
        }
    }, [rowData]);

    const tableProps = useDataTableProps({
        data,
        total: data.length,
        pageIndex: 0,
        pageSize: 10
    });

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/30">
            <div className="w-[80%] bg-white shadow-xl rounded-2xl p-6">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <Heading
                        title={`Group Mappings - ${rowData?.subjectName}`}
                        description="List of groups mapped under this subject"
                    />

                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>

                {/* TABLE */}
                <GenericDataTable
                    {...tableProps}
                    isLoading={loading}
                    columns={PromotionalGroupMappingColumns}
                    noDataTitle="No Groups Found"
                    showViewOptions={false}
                    columnPinning={{ right: ['mapping', 'actions'] }}
                />

                <GroupMappingSections />
            </div>
        </div>
    );
}

/* ==========================================================
   HANDLES POPUP VIEW + EDIT
========================================================== */
function GroupMappingSections() {
    const {
        isToggleFormOpen,
        isMappedviewOpen,
        selectedRow,
        closeMappedview,
        closeToggleForm
    } = useFormContext<IPromotionalGroupDetails>();

    return (
        <>
            {/* {isToggleFormOpen && selectedRow && (
                <ToggleGroupMappingForm rowData={selectedRow} onClose={closeToggleForm} />
            )}

            {isMappedviewOpen && selectedRow && (
                <GroupMappedExamPopup rowData={selectedRow} onClose={closeMappedview} />
            )} */}
        </>
    );
}
