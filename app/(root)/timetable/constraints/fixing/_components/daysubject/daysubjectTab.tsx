'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { useDaySubjectGridData } from '@/hooks/timetable/constraints/fixingData';
import { getdetailsAllFixing, getFixingDaySubjectDetails } from '@/server/timetable/constraints/fixing';
import { Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { daySubjectColumns } from './daysubjectColumns';
import DaySubjectAddForm from './daysubjectAddForm';
import DaySubjectUpdate from './daysubjectUpdate';
import DaySubjectToggle from './daysubjectToggle';
import { FixingViewModal } from '../fixing-view-modal';

interface DaySubjectTabProps {
    initialData: any;
    searchParams?: any;
}

const uniqueById = (list: any[], idKey: string) => {
    const seen = new Set();
    return (list || []).filter((item: any) => {
        if (!item) return false;
        const actualKey = Object.keys(item).find((k) => k.toLowerCase() === idKey.toLowerCase());
        const id = actualKey ? item[actualKey] : undefined;
        if (id === undefined || id === null) return false;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

const filterData = (list: any[], key: string) => {
    return (list || []).filter((item: any) => {
        if (!item) return false;
        const val = item[key] ?? item[Object.keys(item).find((k) => k.toLowerCase() === key.toLowerCase()) || ''];
        if (!val) return true;
        if (typeof val !== 'string') return !!val;
        const name = val.trim();
        return name && name.toLowerCase() !== 'test';
    });
};

export default function DaySubjectTab({ initialData, searchParams }: DaySubjectTabProps) {
    return (
        <FormProvider>
            <DaySubjectTabContent initialData={initialData} searchParams={searchParams} />
        </FormProvider>
    );
}

function DaySubjectTabContent({ initialData, searchParams }: DaySubjectTabProps) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        openAddForm,
        closeAddForm,
        closeEditForm,
        closeAllForms,
        isToggleFormOpen,
        closeToggleForm,
        selectedRow,
        isDetailsViewOpen,
        selectedRow: viewRow,
        closeDetailsView
    } = useFormContext();

    const { data: academicData } = usebifurcationAcademicYear();
    const academicList = (academicData as any)?.data || [];

    const [dayList, setDayList] = useState<any[]>(initialData?.daylist || []);
    const [subjectList, setSubjectList] = useState<any[]>([]);

    const { data: gridResponse, isLoading: isGridLoading, refetchAll } = useDaySubjectGridData(searchParams);

    const getGridData = (res: any, fallback: any) => {
        if (!res) return fallback || [];
        if (Array.isArray(res)) return res;
        if (res.data && Array.isArray(res.data)) return res.data;
        if (res.fix_day_subject_list) return res.fix_day_subject_list;
        const arrayProp = Object.values(res).find((val) => Array.isArray(val));
        if (arrayProp) return arrayProp;
        return fallback || [];
    };

    const gridData = getGridData(gridResponse, initialData?.fix_day_subject_list);
    const totalItems = (gridResponse as any)?.total || (gridResponse as any)?.count || gridData.length;

    const [viewDetails, setViewDetails] = useState<any[]>([]);
    const [isLoadingView, setIsLoadingView] = useState(false);

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                if (dayList.length === 0 || subjectList.length === 0) {
                    const fixingData = await getdetailsAllFixing();
                    if (fixingData?.data) {
                        setDayList(uniqueById(filterData(fixingData.data.daylist || [], 'ttmD_DayName'), 'ttmD_Id'));
                        setSubjectList(uniqueById(filterData(fixingData.data.subjectlist || [], 'ismS_SubjectName'), 'ismS_Id'));
                    }
                }
            } catch (error) {
                console.error('Failed to load initial dropdowns:', error);
                toast.error('Failed to load dropdown options');
            }
        };
        loadDropdowns();
    }, []);

    useEffect(() => {
        const fetchViewDetails = async () => {
            if (isDetailsViewOpen && viewRow) {
                try {
                    setIsLoadingView(true);
                    setViewDetails([]);
                    const id = viewRow.ttfdsU_Id ?? viewRow.TTFDSU_Id;
                    if (!id) return;

                    const res = await getFixingDaySubjectDetails(id);
                    const subDetails = res?.fix_day_subject__classecedit || (res?.data && res.data[0]?.tempararyArrayList);
                    if (subDetails && Array.isArray(subDetails)) {
                        const details = subDetails.map((sub: any) => ({
                            clsDisplay: sub.asmcL_ClassName,
                            sectDisplay: sub.asmC_SectionName,
                            staffDisplay: sub.staffName,
                            nop: sub.ttfdsucC_Periods || sub.ttscC_Periods || sub.nop
                        }));
                        setViewDetails(details);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsLoadingView(false);
                }
            }
        };
        fetchViewDetails();
    }, [isDetailsViewOpen, viewRow]);

    const viewColumns = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'staffDisplay', header: 'Staff' },
            { accessorKey: 'nop', header: 'No Of Periods' }
        ],
        []
    );

    const onFormSuccess = () => {
        refetchAll();
        closeAllForms();
    };

    return (
        <div className='space-y-4'>
            <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                <Button
                    type='button'
                    onClick={openAddForm}
                    className='w-fit bg-orange-500 shadow-md transition-all duration-200 hover:scale-105 hover:bg-orange-600 hover:shadow-lg'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Day Subject Constraint
                </Button>
            </div>

            <CollapsibleSection
                title='Day Subject Constraints List'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable data={gridData} columns={daySubjectColumns} totalItems={totalItems} isLoading={isGridLoading} />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <DaySubjectToggle rowData={selectedRow} onClose={closeToggleForm} />}

            {(isAddFormOpen || isEditFormOpen) && (
                <CollapsibleSection
                    title={isEditFormOpen ? 'Edit Day Subject Constraint' : 'Add New Day Subject Constraint'}
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
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

            <FixingViewModal
                isOpen={!!isDetailsViewOpen}
                onClose={closeDetailsView}
                title='Class-Section Wise Details'
                data={viewDetails}
                columns={viewColumns}
                isLoading={isLoadingView}
            />
        </div>
    );
}
