'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useAcademicYearDropDownMasterDayClasswise, useSubjectDropDownMasterDayClasswise, useSubjectRestrictionPeriodSubjectGridData } from '@/hooks/timetable/constraints/subjectrestriction';
import { getSubjectRestrictionDetailsRestrictions } from '@/server/timetable/constraints/subjectrestriction';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { periodSubjectColumns } from './periodsubjectColumns';
import PeriodSubjectAddForm from './periodsubjectAddForm';
import PeriodSubjectUpdate from './periodsubjectUpdate';
import PeriodSubjectToggle from './periodsubjectToggle';

interface PeriodSubjectTabProps {
    initialData?: any;
}

export default function PeriodSubjectTab({ initialData }: PeriodSubjectTabProps) {
    return (
        <FormProvider>
            <PeriodSubjectTabContent initialData={initialData} />
        </FormProvider>
    );
}

function PeriodSubjectTabContent({ initialData }: PeriodSubjectTabProps) {
    const {
        isAddFormOpen, isEditFormOpen, openAddForm, closeAddForm, closeEditForm, closeAllForms,
        isToggleFormOpen, closeToggleForm, selectedRow
    } = useFormContext();

    const { data: academicYearData } = useAcademicYearDropDownMasterDayClasswise();
    const { data: subjectsData } = useSubjectDropDownMasterDayClasswise();

    const academicList = (academicYearData as any)?.data || [];
    const subjectList = (subjectsData as any)?.data || [];
    const [periodList, setPeriodList] = useState<any[]>([]);

    const { data: gridResponse, isLoading: isGridLoading, refetchAll } = useSubjectRestrictionPeriodSubjectGridData({
        ASMAY_Id: 0, TTMC_Id: 0
    });

    const gridData = (gridResponse as any)?.data || (gridResponse as any)?.periodsubjectlist || (Array.isArray(gridResponse) ? gridResponse : []);
    const totalItems = (gridResponse as any)?.total || gridData.length;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const settings = await getSubjectRestrictionDetailsRestrictions();
                const sData = settings?.data || settings;
                if (sData) setPeriodList(sData.periodlist || []);
            } catch (err) { console.error(err); }
        };
        loadInitialData();
    }, []);

    const onFormSuccess = () => {
        refetchAll();
        closeAllForms();
    };

    return (
        <div className='space-y-4'>
            <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                <Button type='button' onClick={openAddForm} className='bg-orange-500 shadow-md hover:scale-105 hover:bg-orange-600'>
                    <Plus className='mr-2 h-4 w-4' /> Add Period Subject Restriction
                </Button>
            </div>

            <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <GenericDataTable data={gridData} columns={periodSubjectColumns} isLoading={isGridLoading} />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <PeriodSubjectToggle rowData={selectedRow} onClose={closeToggleForm} />}

            {(isAddFormOpen || isEditFormOpen) && (
                <CollapsibleSection
                    title={isEditFormOpen ? 'Edit Period Subject Constraint' : 'Add New Period Subject Constraint'}
                    defaultOpen={true} variant='outline' size='md' className='shadow-lg'>
                    <div className='relative'>
                        <Button
                            type='button'
                            onClick={isEditFormOpen ? closeEditForm : closeAddForm}
                            variant='ghost'
                            size='sm'
                            className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                            <X className='h-4 w-4 text-destructive' /> Close
                        </Button>
                        {isAddFormOpen && <PeriodSubjectAddForm academicList={academicList} periodList={periodList} subjectList={subjectList} onSuccess={onFormSuccess} onCancel={closeAddForm} />}
                        {isEditFormOpen && selectedRow && <PeriodSubjectUpdate academicList={academicList} periodList={periodList} subjectList={subjectList} selectedRow={selectedRow} onSuccess={onFormSuccess} onCancel={closeEditForm} />}
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
