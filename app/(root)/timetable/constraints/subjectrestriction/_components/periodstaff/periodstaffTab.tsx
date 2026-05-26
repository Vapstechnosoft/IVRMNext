'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { useSubjectRestrictionPeriodStaffGridData } from '@/hooks/timetable/constraints/subjectrestriction';
import { getSubjectRestrictionDetailsRestrictions } from '@/server/timetable/constraints/subjectrestriction';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import PeriodStaffAddForm from './periodstaffAddForm';
import { periodStaffColumns } from './periodstaffColumns';
import PeriodStaffToggle from './periodstaffToggle';
import PeriodStaffUpdate from './periodstaffUpdate';

interface PeriodStaffTabProps {
    initialData?: any;
}

export default function PeriodStaffTab({ initialData }: PeriodStaffTabProps) {
    return (
        <FormProvider>
            <PeriodStaffTabContent initialData={initialData} />
        </FormProvider>
    );
}

function PeriodStaffTabContent({ initialData }: PeriodStaffTabProps) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        openAddForm,
        closeAddForm,
        closeEditForm,
        closeAllForms,
        isToggleFormOpen,
        closeToggleForm,
        selectedRow
    } = useFormContext();

    const [periodList, setPeriodList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);

    const { data: academicData } = usebifurcationAcademicYear();
    const academicList = (academicData as any)?.data || [];

    const {
        data: gridResponse,
        isLoading: isGridLoading,
        refetchAll
    } = useSubjectRestrictionPeriodStaffGridData({
        ASMAY_Id: 0,
        TTMC_Id: 0
    });

    const gridData =
        (gridResponse as any)?.data || (gridResponse as any)?.periodstafflist || (Array.isArray(gridResponse) ? gridResponse : []);
    const _totalItems = (gridResponse as any)?.total || gridData.length;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const settings = await getSubjectRestrictionDetailsRestrictions();
                const sData = settings?.data || settings;
                if (sData) {
                    setPeriodList(sData.periodlist || []);
                    setStaffList(sData.stafflist || []);
                }
            } catch (err) {
                console.error(err);
            }
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
                    <Plus className='mr-2 h-4 w-4' /> Add Period Staff Constraint
                </Button>
            </div>

            <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <GenericDataTable data={gridData} columns={periodStaffColumns} isLoading={isGridLoading} />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <PeriodStaffToggle rowData={selectedRow} onClose={closeToggleForm} />}

            {(isAddFormOpen || isEditFormOpen) && (
                <CollapsibleSection
                    title={isEditFormOpen ? 'Edit Period Staff Constraint' : 'Add New Period Staff Constraint'}
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='shadow-lg'>
                    <div className='relative'>
                        <Button
                            type='button'
                            onClick={isEditFormOpen ? closeEditForm : closeAddForm}
                            variant='ghost'
                            size='sm'
                            className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                            <X className='h-4 w-4 text-destructive' /> Close
                        </Button>
                        {isAddFormOpen && (
                            <PeriodStaffAddForm
                                academicList={academicList}
                                periodList={periodList}
                                staffList={staffList}
                                onSuccess={onFormSuccess}
                                onCancel={closeAddForm}
                            />
                        )}
                        {isEditFormOpen && selectedRow && (
                            <PeriodStaffUpdate
                                academicList={academicList}
                                periodList={periodList}
                                staffList={staffList}
                                selectedRow={selectedRow}
                                onSuccess={onFormSuccess}
                                onCancel={closeEditForm}
                            />
                        )}
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
