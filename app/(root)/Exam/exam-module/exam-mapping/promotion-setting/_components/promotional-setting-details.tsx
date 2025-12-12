'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { GenericDataTable, useDataTableProps } from '@/components/ui/view-data-table/view-generic-data-table';
import { useExamSubjectWizardDetails } from '@/hooks/exam/exammodule/exam-mapping';
import type { IExamSubjectWizard, IExamPromotionalSettingDetails, IPromotionSetting } from '@/types/exam/exam-module/exam-mapping';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ToggleExamSubjectWizardDetailsForm from './details-toggle-form';
import SubSubjectSubExamModelView from './subSubject-subExam-view';
import { PromotionalSettingDetailsColumns } from './promotional-setting-details-columns';

/*------------------------------------
    MAIN ENTRY PAGE WRAPPER
-------------------------------------*/
export default function ExamSubjectWizardDetailsPage({
    rowData,
    onClose
}: {
    rowData: IPromotionSetting;
    onClose: () => void;
}) {
    return (
        <FormProvider<IExamPromotionalSettingDetails>>
            <ExamSubjectWizardDetailsPageContent rowData={rowData} onClose={onClose} />
        </FormProvider>
    );
}

/*------------------------------------
        PAGE CONTENT
-------------------------------------*/
function ExamSubjectWizardDetailsPageContent({
    rowData,
    onClose
}: {
    rowData: IPromotionSetting;
    onClose: () => void;
}) {
    const [details, setDetails] = useState<IExamPromotionalSettingDetails[]>([]);
    const { data: response, isLoading, refetchAll } = useExamSubjectWizardDetails(30, rowData?.asmaY_Id);

    useEffect(() => {
        refetchAll();     // refresh API when modal re-opens
    }, [rowData]);

    useEffect(() => {
        if (!response) return;
        try {
            const api = response as unknown as { success: boolean; data: IExamPromotionalSettingDetails[] };
            setDetails(api?.data ?? []);
        } catch {
            toast.error('Failed to load subject mapping details');
        }
    }, [response]);

    const tableProps = useDataTableProps({
        data: details,
        total: details.length,
        pageIndex: 0,
        pageSize: 10
    });

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[10vh]">
            <div className="w-[80%] bg-white rounded-2xl shadow-xl p-6">

                {/* ——————— HEADER ——————— */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                    <Heading
                        title={`Exam Subject Wizard ${rowData.emgR_GradeName ? ' - ' + rowData.emcA_CategoryName : ''}`}
                        description={`Subjects mapped to ${rowData?.emcA_CategoryName}`}
                    />
                    <Button className="w-fit flex items-center gap-2" variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>

                {/* ——————— TABLE ——————— */}
                <GenericDataTable
                    isLoading={isLoading}
                    {...tableProps}
                    columns={PromotionalSettingDetailsColumns}
                    noDataTitle="No Subjects Found"
                    noDataDescription="No subject mapping exists for this exam."
                    showViewOptions={false}
                    columnPinning={{ right: ['mapping', 'actions'] }} />

                <FormSections />
            </div>
        </div>
    );
}

/*------------------------------------
      POPUP FORM HANDLERS
-------------------------------------*/
function FormSections() {
    const { isToggleFormOpen, isMappedviewOpen, selectedRow, closeToggleForm, closeMappedview } =
        useFormContext<IExamPromotionalSettingDetails>();

    return (
        <>
            {/* {isToggleFormOpen && selectedRow && (
                <ToggleExamSubjectWizardDetailsForm rowData={selectedRow} onClose={closeToggleForm} />
            )} */}

            {/* {isMappedviewOpen && selectedRow && (
                <SubSubjectSubExamModelView rowData={selectedRow} onClose={closeMappedview} />
            )} */}
        </>
    );
}
