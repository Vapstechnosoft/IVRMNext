'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError, Label } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown, useMasterClassDropdown, useMasterSectionDropdown } from '@/hooks/admission/preadmission/useMasters';
import { ClasswiseStudentDetails } from '@/hooks/admission/preadmission/useReports';
import { RotateCcw } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { use, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ClasswiseStudentDetailsColumns } from './_components/columns';
import { ColumnValue } from './_components/columnvalue';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/* -------------------------------------------------------------
   Main Component
------------------------------------------------------------- */

export default function ClassWiseStudentDetails(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const tableRef = useRef<DataTableRef>(null);
    const router = useRouter();
    const pathname = usePathname();

    type FormValues = {
        asmaY_Id: number;
        classes: string[];
        class_section: string[];
        selected_columns: string[];
    };
    const buildPayload = () => ({
        AcademicYearId: watch('asmaY_Id'),
        ClassList: selectedClassItems,
        SectionList: selectedSectionItems,
        ColumnList: selectedColumnItems,
        StudentScope: studentScope
    });

    const {
        control,
        watch,
        reset,
        formState: { errors }
    } = useForm<FormValues>({
        defaultValues: {
            asmaY_Id: 0,
            classes: [],
            class_section: [],
            selected_columns: []
        }
    });
    const [selectedClassItems, setSelectedClassItems] = useState<{ asmcL_Id: string; asmcL_ClassName: string }[]>([]);
    const [selectedSectionItems, setSelectedSectionItems] = useState<{ asmS_Id: string; asmcL_SectionName: string }[]>([]);
    const [selectedColumnItems, setSelectedColumnItems] = useState<{ columnID: string; columnName: string }[]>([]);
    const [studentStatus, setStudentStatus] = useState<'Tformate' | 'Kformate'>();
    const [studentScope, setStudentScope] = useState<'newad' | 'totstd' | 'prom' | 'yrloss' | 'deact'>();

    const { data: classwiseStudentDetails, isFetching, refetch } = ClasswiseStudentDetails(buildPayload(), searchParams);
    console.log('classwiseStudentDetails', buildPayload());
    const handleClassSelection = (selectedValues: string[]) => {
        const selectedClasses = selectedValues.map((value) => {
            return { asmcL_Id: value.toString(), asmcL_ClassName: '' };
        });

        setSelectedClassItems(selectedClasses);
    };
    const handleSectionSelection = (selectedValues: string[]) => {
        const selectedSections = selectedValues.map((value) => {
            return { asmS_Id: value.toString(), asmcL_SectionName: '' };
        });

        setSelectedSectionItems(selectedSections);
    };
    const handleColumnSelection = (selectedValues: string[]) => {
        const selectedColumns = selectedValues.map((value) => {
            return { columnID: value.toString(), columnName: '' };
        });

        setSelectedColumnItems(selectedColumns);
    };
    const { data: academicYear, isLoading: academicYearLoading } = useAcademicYearDropdown();

    const { data: masterSection, isLoading: masterSectionLoading } = useMasterSectionDropdown();
    const watchedAsmaY_Id = watch('asmaY_Id');
    const { data: masterClass, isLoading: masterClassLoading } = useMasterClassDropdown();

    const handleReset = () => {
        reset();
        setSelectedClassItems([]);
        setSelectedSectionItems([]);
        setSelectedColumnItems([]);
        setStudentScope(undefined);
        setStudentStatus('Tformate');
        tableRef.current?.resetSelection();
        router.replace(pathname);
        toast.success('All filters reset');
    };

    return (
        <div className='min-h-screen space-y-6 p-4'>
            <div className='space-y-6 rounded-xl border bg-card p-6 shadow-xl'>
                {/* Academic Year */}
                <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='asmaY_Id'
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value ? String(field.value) : ''} onValueChange={(v) => field.onChange(Number(v))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYearLoading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : (
                                            academicYear?.data?.map((yr) => (
                                                <SelectItem key={yr.asmaY_Id} value={String(yr.asmaY_Id)}>
                                                    {yr.asmaY_Year}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                    </div>

                    {/* Class */}
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Class <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='classes'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={
                                        masterClass?.data?.map((data) => ({
                                            label: data.asmcL_ClassName,
                                            value: data.asmcL_Id.toString()
                                        })) || []
                                    }
                                    onValueChange={(selectedValues) => {
                                        field.onChange(selectedValues);
                                        handleClassSelection(selectedValues);
                                    }}
                                    defaultValue={selectedClassItems.map((data) => data.asmcL_Id)}
                                    value={selectedClassItems.map((data) => data.asmcL_Id)}
                                    placeholder='Select Classes'
                                    variant='inverted'
                                    disabled={!watchedAsmaY_Id || masterClassLoading}
                                />
                            )}
                        />
                        {errors.classes && <FormError>{errors.classes.message}</FormError>}
                    </div>

                    {/* Section */}
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Section <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='class_section'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={
                                        masterSection?.data?.map((data) => ({
                                            label: data.asmC_SectionName,
                                            value: data.asmS_Id.toString()
                                        })) || []
                                    }
                                    onValueChange={(selectedValues) => {
                                        field.onChange(selectedValues);
                                        handleSectionSelection(selectedValues);
                                    }}
                                    defaultValue={selectedSectionItems.map((data) => data.asmS_Id)}
                                    value={selectedSectionItems.map((data) => data.asmS_Id)}
                                    placeholder='Select Classes'
                                    variant='inverted'
                                    disabled={masterSectionLoading}
                                />
                            )}
                        />
                        {errors.class_section && <FormError>{errors.class_section.message}</FormError>}
                    </div>
                    {/* Columns */}
                    <div className='space-y-2'>
                        <Label>
                            Columns <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='selected_columns' // Optional: add this to your form if you want to submit it
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={
                                        ColumnValue.map((col) => ({
                                            label: col.columnName,
                                            value: col.columnID
                                        })) || []
                                    }
                                    onValueChange={(selectedValues) => {
                                        field.onChange(selectedValues);
                                        handleColumnSelection(selectedValues);
                                    }}
                                    defaultValue={selectedColumnItems.map((data) => data.columnID)}
                                    value={selectedColumnItems.map((data) => data.columnID)}
                                    placeholder='Select Columns'
                                    variant='inverted'
                                />
                            )}
                        />
                    </div>
                </div>

                {/* Radios */}
                <div className='space-y-4 border-t pt-6'>
                    <RadioGroup
                        value={studentScope}
                        onValueChange={(v) => setStudentScope(v as any)}
                        className='flex flex-wrap justify-center gap-6'>
                        <RadioGroupItem value='newad' /> <Label>New Admission</Label>
                        <RadioGroupItem value='totstd' /> <Label>Total Students</Label>
                        <RadioGroupItem value='prom' /> <Label>Promoted</Label>
                        <RadioGroupItem value='yrloss' /> <Label>Year Loss</Label>
                        <RadioGroupItem value='deact' /> <Label>Deactivated</Label>
                    </RadioGroup>

                    <RadioGroup
                        value={studentStatus}
                        onValueChange={(v) => setStudentStatus(v as any)}
                        className='flex justify-center gap-6'>
                        <RadioGroupItem value='Tformate' /> <Label>Table Format</Label>
                        <RadioGroupItem value='Kformate' /> <Label>Kendo Format</Label>
                    </RadioGroup>
                </div>

                {/* Buttons */}
                <div className='flex gap-4'>
                    <Button size='lg'>Generate Report</Button>
                    <Button variant='outline' size='lg' onClick={handleReset}>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Reset All
                    </Button>
                </div>
            </div>
            <GenericDataTable
                ref={tableRef}
                columns={ClasswiseStudentDetailsColumns}
                data={classwiseStudentDetails?.data ?? []}
                loading={isFetching}
            />
        </div>
    );
}
