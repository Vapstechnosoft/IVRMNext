'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import {
    useAcademicYearDropDownMasterDayClasswise,
    useSubjectRestrictionDaySubjectGridData
} from '@/hooks/timetable/constraints/subjectrestriction';
import { getdetailsAllFixing } from '@/server/timetable/constraints/fixing';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import DaySubjectAddForm from './daysubjectAddForm';
import { daySubjectColumns } from './daysubjectColumns';
import DaySubjectToggle from './daysubjectToggle';
import DaySubjectUpdate from './daysubjectUpdate';

interface DaySubjectTabProps {
    initialData?: any;
}

export default function DaySubjectTab({ initialData }: DaySubjectTabProps) {
    return (
        <FormProvider>
            <DaySubjectTabContent initialData={initialData} />
        </FormProvider>
    );
}

function DaySubjectTabContent({ initialData }: DaySubjectTabProps) {
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

    const [dayList, setDayList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);

    const { data: academicData } = useAcademicYearDropDownMasterDayClasswise();
    const academicList = (academicData as any)?.data || (Array.isArray(academicData) ? academicData : []);

    const {
        data: gridData,
        isLoading: gridLoading,
        refetchAll
    } = useSubjectRestrictionDaySubjectGridData({
        ASMAY_Id: 0,
        TTMC_Id: 0
    });

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const res = await getdetailsAllFixing();
                if (res?.data) {
                    setDayList(res.data.daylist || []);
                    setSubjectList(res.data.subjectlist || res.data.sublist || []);
                }
            } catch (error) {
                console.error(error);
            }
        };
        loadDropdowns();
    }, []);

    const onFormSuccess = () => {
        refetchAll();
        closeAllForms();
    };

    const dataArray = (gridData as any)?.data || (gridData as any)?.daysubjectlist || (Array.isArray(gridData) ? gridData : []);
    const totalItems = (gridData as any)?.total || dataArray.length;

    return (
        <div className='space-y-4'>
            <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                <Button type='button' onClick={openAddForm} className='bg-orange-500 shadow-md hover:scale-105 hover:bg-orange-600'>
                    <Plus className='mr-2 h-4 w-4' /> Add Day Subject Constraint
                </Button>
            </div>

            <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <GenericDataTable data={dataArray} columns={daySubjectColumns} isLoading={gridLoading} />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <DaySubjectToggle rowData={selectedRow} onClose={closeToggleForm} />}

            {(isAddFormOpen || isEditFormOpen) && (
                <CollapsibleSection
                    title={isEditFormOpen ? 'Edit Day Subject Constraint' : 'Add New Day Subject Constraint'}
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
                            <DaySubjectAddForm
                                academicList={academicList}
                                dayList={dayList}
                                subjectList={subjectList}
                                onSuccess={onFormSuccess}
                                onCancel={closeAddForm}
                            />
                        )}
                        {isEditFormOpen && selectedRow && (
                            <DaySubjectUpdate
                                academicList={academicList}
                                dayList={dayList}
                                subjectList={subjectList}
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
