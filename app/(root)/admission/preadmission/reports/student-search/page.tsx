'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { studentSearchSchema } from '@/schemas/admission/preadmission/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileSpreadsheet, Plus, Printer, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { type StudentData, studentSearchColumns } from './_components/columns';

type FormFields = z.infer<typeof studentSearchSchema>;

const FIELD_OPTIONS = [
    { value: 'asmcL_ClassName', label: 'Class Name' },
    { value: 'amsT_FirstName', label: 'First Name' },
    { value: 'amsT_FatherName', label: 'Father Name' },
    { value: 'amsT_MotherName', label: 'Mother Name' },
    { value: 'amsT_emailId', label: 'Email' },
    { value: 'amsT_MobileNo', label: 'Mobile Number' },
    { value: 'amsT_AdmNo', label: 'Admission Number' },
    { value: 'asmC_SectionName', label: 'Section' }
];

const OPERATOR_OPTIONS = [
    { value: '=', label: 'Equal to' },
    { value: '!=', label: 'Not equal to' },
    { value: 'LIKE', label: 'Like' },
    { value: '>', label: 'Greater than' },
    { value: '<', label: 'Less than' }
];

const CONDITION_OPTIONS = [
    { value: 'AND', label: 'AND' },
    { value: 'OR', label: 'OR' }
];

const generateMockData = (): StudentData[] => {
    const classes = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2'];
    const sections = ['A', 'B', 'C'];
    const firstNames = [
        'AADHYA V',
        'RAHUL SHARMA',
        'PRIYA SINGH',
        'AMIT KUMAR',
        'SNEHA PATEL',
        'ARJUN REDDY',
        'KAVYA MENON',
        'ROHAN GUPTA',
        'ANANYA RAO',
        'VIKRAM NAIR'
    ];

    return Array.from({ length: 20 }, (_, i) => ({
        amsT_RegistrationNo: `${String(i + 1).padStart(2, '0')}/2025-26`,
        AMST_Id: 24487 + i,
        amsT_FirstName: firstNames[i % firstNames.length],
        amsT_Date: '31/03/2025',
        amsT_DOB: `0${(i % 9) + 1}/01/202${i % 3}`,
        amsT_Sex: i % 2 === 0 ? 'Female' : 'Male',
        amsT_MotherName: `Mother ${i + 1}`,
        amsT_FatherName: `Father ${i + 1}`,
        amsT_emailId: `student${i + 1}@example.com`,
        amsT_MobileNo: 9876543210 + i,
        amsT_StuBankAccNo: null,
        amsT_AadharNo: null,
        amsT_AdmNo: `${String(i + 1).padStart(2, '0')}/2025-26`,
        amsT_BirthCertNO: null,
        amsT_BloodGroup: ['A+', 'B+', 'O+', 'AB+'][i % 4],
        amsT_FatherAadharNo: null,
        amsT_FatherBankAccNo: null,
        asmcL_ClassName: classes[i % classes.length],
        asmC_SectionName: sections[i % sections.length],
        AMST_Photoname: 'https://via.placeholder.com/150',
        addressd1: `Address ${i + 1}, City, State, India`
    }));
};

export default function StudentSearchPage() {
    const [showReport, setShowReport] = useState(false);
    const [tableData, setTableData] = useState<StudentData[]>([]);

    const {
        control,
        watch,
        setValue,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(studentSearchSchema),
        defaultValues: {
            status: 'all',
            criteria: [{ field: '', operator: '', value: '', condition: '' }]
        }
    });

    const criteria = watch('criteria');

    const addCriteria = () => {
        setValue('criteria', [...criteria, { field: '', operator: '', value: '', condition: '' }]);
    };

    const removeCriteria = (index: number) => {
        if (criteria.length > 1) {
            setValue(
                'criteria',
                criteria.filter((_, i) => i !== index)
            );
        }
    };

    const onSubmit = async (data: FormFields) => {
        const mockData = generateMockData();
        setTableData(mockData);
        setShowReport(true);
    };

    const handleReset = () => {
        reset({
            status: 'all',
            criteria: [{ field: '', operator: '', value: '', condition: '' }]
        });
        setShowReport(false);
        setTableData([]);
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='container mx-auto max-w-7xl space-y-4 p-4'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <CollapsibleSection
                        title='Student Status'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='flex flex-row justify-center gap-4 p-4'>
                            <Label className='font-medium text-gray-700'>
                                Student Status <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='status'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup value={field.value} onValueChange={field.onChange} className='flex items-center space-x-8'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='all' id='all' />
                                            <label htmlFor='all' className='cursor-pointer font-medium text-sm'>
                                                All
                                            </label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='studying' id='studying' />
                                            <label htmlFor='studying' className='cursor-pointer font-medium text-sm'>
                                                Studying
                                            </label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='left' id='left' />
                                            <label htmlFor='left' className='cursor-pointer font-medium text-sm'>
                                                Left
                                            </label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                            {errors.status && <FormError>{errors.status.message}</FormError>}
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title='Search Criteria'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-4 p-4'>
                            <div className='overflow-x-auto rounded-lg border border-gray-300'>
                                <table className='w-full'>
                                    <thead className='bg-gray-100'>
                                        <tr>
                                            <th className='border-gray-300 border-b px-4 py-3 text-left font-semibold text-sm'>
                                                Field <span className='text-red-500'>*</span>
                                            </th>
                                            <th className='border-gray-300 border-b px-4 py-3 text-left font-semibold text-sm'>
                                                Like <span className='text-red-500'>*</span>
                                            </th>
                                            <th className='border-gray-300 border-b px-4 py-3 text-left font-semibold text-sm'>
                                                Value <span className='text-red-500'>*</span>
                                            </th>
                                            <th className='border-gray-300 border-b px-4 py-3 text-left font-semibold text-sm'>
                                                Condition
                                            </th>
                                            <th className='border-gray-300 border-b px-4 py-3 text-center font-semibold text-sm'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {criteria.map((row, index) => (
                                            <tr key={index} className='hover:bg-gray-50'>
                                                <td className='border-gray-200 border-b px-4 py-3'>
                                                    <Controller
                                                        name={`criteria.${index}.field`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                <SelectTrigger className='w-full'>
                                                                    <SelectValue placeholder='Select Field' />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {FIELD_OPTIONS.map((opt) => (
                                                                        <SelectItem key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                    {errors.criteria?.[index]?.field && (
                                                        <FormError>{errors.criteria[index]?.field?.message}</FormError>
                                                    )}
                                                </td>
                                                <td className='border-gray-200 border-b px-4 py-3'>
                                                    <Controller
                                                        name={`criteria.${index}.operator`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                <SelectTrigger className='w-full'>
                                                                    <SelectValue placeholder='Select' />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {OPERATOR_OPTIONS.map((opt) => (
                                                                        <SelectItem key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                    {errors.criteria?.[index]?.operator && (
                                                        <FormError>{errors.criteria[index]?.operator?.message}</FormError>
                                                    )}
                                                </td>
                                                <td className='border-gray-200 border-b px-4 py-3'>
                                                    <Controller
                                                        name={`criteria.${index}.value`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type='text'
                                                                placeholder='Enter value'
                                                                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                                                            />
                                                        )}
                                                    />
                                                    {errors.criteria?.[index]?.value && (
                                                        <FormError>{errors.criteria[index]?.value?.message}</FormError>
                                                    )}
                                                </td>
                                                <td className='border-gray-200 border-b px-4 py-3'>
                                                    <Controller
                                                        name={`criteria.${index}.condition`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                <SelectTrigger className='w-full'>
                                                                    <SelectValue placeholder='Select' />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {CONDITION_OPTIONS.map((opt) => (
                                                                        <SelectItem key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                </td>
                                                <td className='border-gray-200 border-b px-4 py-3 text-center'>
                                                    <Button
                                                        type='button'
                                                        onClick={() => removeCriteria(index)}
                                                        disabled={criteria.length === 1}
                                                        variant='ghost'
                                                        size='sm'
                                                        className='text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50'>
                                                        <Trash2 className='h-4 w-4' />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Button type='button' onClick={addCriteria} variant='outline' className='w-fit'>
                                <Plus className='mr-2 h-4 w-4' />
                                Add More Criteria
                            </Button>
                            {errors.criteria && <FormError>{errors.criteria.message}</FormError>}
                        </div>
                        <div className='flex flex-col gap-3 p-4 sm:flex-row sm:justify-start'>
                            <Button
                                type='submit'
                                disabled={isSubmitting}
                                className='order-1 w-full transition-all duration-200 hover:scale-105 sm:order-1 sm:w-fit'>
                                <Search className='mr-2 h-4 w-4' />
                                {isSubmitting ? 'Searching...' : 'Search'}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleReset}
                                disabled={isSubmitting}
                                className='order-2 w-full transition-all duration-200 hover:scale-105 sm:order-2 sm:w-fit'>
                                <RotateCcw className='mr-2 h-4 w-4' />
                                Reset
                            </Button>
                            <Button type='button' variant='outline' disabled={!showReport} className='w-full sm:w-fit'>
                                <FileSpreadsheet className='mr-2 h-4 w-4' />
                                Export to Excel
                            </Button>
                            <Button type='button' variant='outline' disabled={!showReport} className='w-full sm:w-fit'>
                                <Printer className='mr-2 h-4 w-4' />
                                Print
                            </Button>
                        </div>
                    </CollapsibleSection>
                </form>

                {showReport && (
                    <CollapsibleSection
                        title='Search Results'
                        description={`${tableData.length} students found`}
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='p-4'>
                            <GenericDataTable data={tableData} isLoading={!showReport} columns={studentSearchColumns} />
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
