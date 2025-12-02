'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import { useStudentCountReport } from '@/hooks/admission/preadmission/useReports';
import { cn } from '@/lib/utils';
import { admissionReportSchema } from '@/schemas/admission/preadmission/reports';
import type { IMasterStudentCountReportList } from '@/types/admission/preadmission/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckSquare, FileText, RotateCcw, Search, Square } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';

type FormFields = z.infer<typeof admissionReportSchema>;

const CLASS_OPTIONS = [
    'Nursery',
    'LKG',
    'UKG',
    'I Std',
    'II Std',
    'III Std',
    'IV Std',
    'V Std',
    'VI Std',
    'VII Std',
    'VIII Std',
    'IX Std',
    'X Std',
    'LKG STATE',
    'I ICSE',
    'UKG STATE',
    'II ICSE',
    'III ICSE',
    'IV ICSE',
    'V ICSE',
    'VI ICSE',
    'VII ICSE',
    'VIII ICSE',
    'IX ICSE',
    'X ICSE'
];

const FIELD_OPTIONS = [
    { id: 'admNo', label: 'Adm No', accessor: 'admNo' },
    { id: 'firstName', label: 'First Name', accessor: 'user_name' },
    { id: 'middleName', label: 'Middle Name', accessor: 'middleName' },
    { id: 'lastName', label: 'Last Name', accessor: 'lastName' },
    { id: 'admDate', label: 'Adm Date', accessor: 'admDate' },
    {
        id: 'registrationNo',
        label: 'Registration No',
        accessor: 'registrationNo'
    },
    { id: 'gender', label: 'Gender', accessor: 'gender' },
    { id: 'dob', label: 'Date of Birth', accessor: 'dob' },
    { id: 'dobWords', label: 'Date of birth(in words)', accessor: 'dobWords' },
    { id: 'fatherName', label: "Father's Name", accessor: 'fatherName' },
    { id: 'motherName', label: "Mother's Name", accessor: 'motherName' },
    {
        id: 'fatherOccupation',
        label: "Father's Occupation",
        accessor: 'fatherOccupation'
    },
    {
        id: 'motherOccupation',
        label: "Mother's Occupation",
        accessor: 'motherOccupation'
    },
    {
        id: 'annualIncome',
        label: "Parent's annual income",
        accessor: 'annualIncome'
    },
    { id: 'nationality', label: 'Nationality', accessor: 'nationality' },
    { id: 'bloodGroup', label: 'Blood Group', accessor: 'bloodGroup' },
    { id: 'language', label: 'Language', accessor: 'language' },
    { id: 'phoneNumber', label: 'Phone number', accessor: 'phone_number' },
    { id: 'email', label: 'Email id', accessor: 'email' },
    { id: 'placeOfBirth', label: 'Place of Birth', accessor: 'placeOfBirth' },
    { id: 'aadhar', label: 'Aadhar Card Number', accessor: 'aadhar' },
    { id: 'religion', label: 'Religion', accessor: 'religion' }
];

export default function AdmissionReportPage() {
    const { data: academicYear, isLoading: ayLoading } = useAcademicYearDropdown();
    const [classSearch, setClassSearch] = useState('');
    const [fieldSearch, setFieldSearch] = useState('');
    const [showReport, setShowReport] = useState(false);
    const [searchParams, setSearchParams] = useState<any>(null);

    const { data: response, isLoading, error } = useStudentCountReport(searchParams);

    const {
        control,
        watch,
        setValue,
        reset,
        trigger,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(admissionReportSchema),
        defaultValues: {
            academicYear: 0,
            status: 'All',
            selectedClasses: [],
            selectedFields: []
        }
    });

    const selectedClasses = watch('selectedClasses');
    const selectedFields = watch('selectedFields');

    const filteredClasses = useMemo(() => {
        return CLASS_OPTIONS.filter((cls) => cls.toLowerCase().includes(classSearch.toLowerCase()));
    }, [classSearch]);

    const filteredFields = useMemo(() => {
        return FIELD_OPTIONS.filter((field) => field.label.toLowerCase().includes(fieldSearch.toLowerCase()));
    }, [fieldSearch]);

    const handleClassToggle = (className: string) => {
        const current = selectedClasses || [];
        const updated = current.includes(className) ? current.filter((c) => c !== className) : [...current, className];
        setValue('selectedClasses', updated, { shouldValidate: true });
    };

    const handleFieldToggle = (fieldId: string) => {
        const current = selectedFields || [];
        const updated = current.includes(fieldId) ? current.filter((f) => f !== fieldId) : [...current, fieldId];
        setValue('selectedFields', updated, { shouldValidate: true });
    };

    const handleSelectAllClasses = () => {
        if (selectedClasses.length === filteredClasses.length) {
            setValue('selectedClasses', [], { shouldValidate: true });
        } else {
            setValue('selectedClasses', [...filteredClasses], {
                shouldValidate: true
            });
        }
    };

    const handleSelectAllFields = () => {
        if (selectedFields.length === filteredFields.length) {
            setValue('selectedFields', [], { shouldValidate: true });
        } else {
            setValue(
                'selectedFields',
                filteredFields.map((f) => f.id),
                { shouldValidate: true }
            );
        }
    };

    const handleReport = async () => {
        const isValid = await trigger();
        if (isValid) {
            const formData = watch();
            setSearchParams({
                asmaY_Id: formData.academicYear,
                status: formData.status
            });
            setShowReport(true);
        }
    };

    const handleReset = () => {
        reset({
            academicYear: 0,
            status: 'All',
            selectedClasses: [],
            selectedFields: []
        });
        setClassSearch('');
        setFieldSearch('');
        setShowReport(false);
        setSearchParams(null);
    };

    const dynamicColumns = useMemo<ColumnDef<IMasterStudentCountReportList>[]>(() => {
        const columns: ColumnDef<IMasterStudentCountReportList>[] = [
            {
                accessorKey: 'user_id',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6' />,
                cell: ({ row, table }) => {
                    const pageIndex = table.getState().pagination.pageIndex;
                    const pageSize = table.getState().pagination.pageSize;
                    const continuousIndex = pageIndex * pageSize + row.index + 1;
                    return <div className='w-full pl-6'>{continuousIndex}</div>;
                },
                enableSorting: true,
                enableHiding: false
            }
        ];

        selectedFields.forEach((fieldId) => {
            const field = FIELD_OPTIONS.find((f) => f.id === fieldId);
            if (field) {
                columns.push({
                    accessorKey: field.accessor,
                    header: ({ column }) => <DataTableColumnHeader column={column} title={field.label} />,
                    cell: ({ row }: { row: any }) => {
                        const value = row.getValue(field.accessor);
                        return <div>{value || 'N/A'}</div>;
                    },
                    enableSorting: true,
                    enableHiding: true
                });
            }
        });

        return columns;
    }, [selectedFields]);

    const filteredData = useMemo(() => {
        if (!response?.data) return { data: [] };

        if (selectedClasses.length === 0) {
            return response;
        }

        const filtered = response.data.filter((item: any) => selectedClasses.includes(item.className));

        return { ...response, data: filtered };
    }, [response, selectedClasses]);

    const tableProps = useDataTableProps(filteredData);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='space-y-4'>
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        title='Admission Register'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-6 p-4'>
                            <div className='space-y-4'>
                                <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
                                    <Label htmlFor='academicYear' className='whitespace-nowrap font-medium'>
                                        Academic Year <span className='ml-1 text-red-500'>*</span>
                                    </Label>
                                    <div className='flex w-full flex-col gap-1.5 sm:w-auto'>
                                        <Controller
                                            name='academicYear'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value > 0 ? field.value.toString() : ''}
                                                    onValueChange={(value) => field.onChange(Number(value))}>
                                                    <SelectTrigger className='w-full sm:w-52'>
                                                        <SelectValue placeholder='Select Academic Year' />
                                                    </SelectTrigger>
                                                    <SelectContent className='max-h-60'>
                                                        {ayLoading ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : (
                                                            academicYear?.data?.map((y) => (
                                                                <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                                    {y.asmaY_Year}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.academicYear && <FormError>{errors.academicYear.message}</FormError>}
                                    </div>
                                </div>

                                <div className='flex flex-col items-center justify-center gap-3'>
                                    <Controller
                                        name='status'
                                        control={control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                className='flex flex-col items-center space-y-2 sm:flex-row sm:space-x-6 sm:space-y-0'>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='All' id='all' />
                                                    <label htmlFor='all' className='cursor-pointer text-sm'>
                                                        All
                                                    </label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='Present' id='present' />
                                                    <label htmlFor='present' className='cursor-pointer text-sm'>
                                                        Present
                                                    </label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='Left' id='left' />
                                                    <label htmlFor='left' className='cursor-pointer text-sm'>
                                                        Left
                                                    </label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='Deactive' id='deactive' />
                                                    <label htmlFor='deactive' className='cursor-pointer text-sm'>
                                                        Deactive
                                                    </label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                    {errors.status && <FormError>{errors.status.message}</FormError>}
                                </div>
                            </div>

                            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                                <div className='space-y-3'>
                                    <div className='relative'>
                                        <Search className='absolute top-2.5 left-3 h-4 w-4 text-gray-400' />
                                        <input
                                            type='text'
                                            placeholder='Search classes...'
                                            value={classSearch}
                                            onChange={(e) => setClassSearch(e.target.value)}
                                            className='w-full rounded-md border border-gray-300 py-2 pr-3 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                                        />
                                    </div>

                                    <div
                                        onClick={handleSelectAllClasses}
                                        className={cn(
                                            'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 font-medium text-sm transition-all',
                                            selectedClasses.length === filteredClasses.length && filteredClasses.length > 0
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-300 hover:border-primary/40'
                                        )}>
                                        {selectedClasses.length === filteredClasses.length && filteredClasses.length > 0 ? (
                                            <CheckSquare className='h-4 w-4 text-primary' />
                                        ) : (
                                            <Square className='h-4 w-4 text-gray-400' />
                                        )}
                                        <span>Select All</span>
                                    </div>

                                    <div className='max-h-60 space-y-1 overflow-y-auto rounded-md border border-gray-300 p-2'>
                                        {filteredClasses.map((className) => {
                                            const selected = selectedClasses.includes(className);
                                            return (
                                                <div
                                                    key={className}
                                                    onClick={() => handleClassToggle(className)}
                                                    className={cn(
                                                        'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-all',
                                                        selected
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'
                                                    )}>
                                                    {selected ? (
                                                        <CheckSquare className='h-4 w-4 text-primary' />
                                                    ) : (
                                                        <Square className='h-4 w-4 text-gray-400' />
                                                    )}
                                                    <span>{className}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {errors.selectedClasses && <FormError>{errors.selectedClasses.message}</FormError>}
                                </div>

                                <div className='space-y-3'>
                                    <div className='relative'>
                                        <Search className='absolute top-2.5 left-3 h-4 w-4 text-gray-400' />
                                        <input
                                            type='text'
                                            placeholder='Search fields...'
                                            value={fieldSearch}
                                            onChange={(e) => setFieldSearch(e.target.value)}
                                            className='w-full rounded-md border border-gray-300 py-2 pr-3 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                                        />
                                    </div>

                                    <div
                                        onClick={handleSelectAllFields}
                                        className={cn(
                                            'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 font-medium text-sm transition-all',
                                            selectedFields.length === filteredFields.length && filteredFields.length > 0
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-300 hover:border-primary/40'
                                        )}>
                                        {selectedFields.length === filteredFields.length && filteredFields.length > 0 ? (
                                            <CheckSquare className='h-4 w-4 text-primary' />
                                        ) : (
                                            <Square className='h-4 w-4 text-gray-400' />
                                        )}
                                        <span>Select All</span>
                                    </div>

                                    <div className='max-h-60 space-y-1 overflow-y-auto rounded-md border border-gray-300 p-2'>
                                        {filteredFields.map((field) => {
                                            const selected = selectedFields.includes(field.id);
                                            return (
                                                <div
                                                    key={field.id}
                                                    onClick={() => handleFieldToggle(field.id)}
                                                    className={cn(
                                                        'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-all',
                                                        selected
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'
                                                    )}>
                                                    {selected ? (
                                                        <CheckSquare className='h-4 w-4 text-primary' />
                                                    ) : (
                                                        <Square className='h-4 w-4 text-gray-400' />
                                                    )}
                                                    <span>{field.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {errors.selectedFields && <FormError>{errors.selectedFields.message}</FormError>}
                                </div>
                            </div>

                            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={handleReset}
                                    className='order-2 w-full transition-all duration-200 hover:scale-105 sm:order-1 sm:w-fit'>
                                    <RotateCcw className='mr-2 h-4 w-4' />
                                    Reset
                                </Button>
                                <Button
                                    type='button'
                                    onClick={handleReport}
                                    className='order-1 w-full transition-all duration-200 hover:scale-105 sm:order-2 sm:w-fit'>
                                    <FileText className='mr-2 h-4 w-4' />
                                    Report
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {showReport && (
                        <CollapsibleSection
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            title='Student Count Report'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            {selectedFields.length === 0 ? (
                                <div className='flex flex-col items-center justify-center space-y-2 py-12'>
                                    <p className='font-medium text-gray-600 text-lg'>No Fields Selected</p>
                                    <p className='text-gray-500 text-sm'>Please select at least one field to display data</p>
                                </div>
                            ) : (
                                <GenericDataTable<IMasterStudentCountReportList>
                                    {...tableProps}
                                    columns={dynamicColumns}
                                    isLoading={isLoading}
                                    error={error}
                                    showViewOptions={true}
                                    columnPinning={{ left: ['user_id'] }}
                                    isPaginationRequired={true}
                                    loadingMessage='Loading Student Count Reports...'
                                    noDataTitle='No Student Count Reports Found'
                                    noDataDescription='Get started by selecting an academic year above'
                                    errorTitle='Error Loading Student Count Reports'
                                />
                            )}
                        </CollapsibleSection>
                    )}
                </div>
            </div>
        </div>
    );
}
