'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ColumnDef } from '@tanstack/react-table';
import { Save, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { MultiSelect } from '@/components/ui/multi-select';
import {
    useFeeConcessionClassDropdowndata,
    useFeeConcessionHeadList,
    useFeeConcessionStudentList,
    useFeeConcessionTermDropdowndata,
    useconcessionacademicyerdropdowndatafee,
    useopeningCategorydropdowndatafee
} from '@/hooks/fees/useTrasactions';

const MI_ID = 30;

interface StudentRow {
    amst_Id: number;
    studentName: string;
    registrationNo: string;
    admNo: string;
    rollNo: number;
    checked: boolean;
    concessionAmount: number;
}

interface HeadRow {
    slno: number;
    fmH_Id: number;
    fmH_FeeName: string;
    fmI_Name: string;
    fmA_Amount: number;
    type: 'Amount' | 'Percentage' | '';
    concessionValue: number;
    remarks: string;
    checked: boolean;
}

export default function AddFeeConcessionForm({ onSuccess }: { onSuccess?: () => void }) {
    const { control, watch, reset, setValue } = useForm();
    const [selectionType, setSelectionType] = useState<'C' | 'A' | 'L' | 'F' | 'S'>('C');
    const [searchValue, setSearchValue] = useState('');
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [heads, setHeads] = useState<HeadRow[]>([]);
    const [saving, setSaving] = useState(false);

    const academicYearId = watch('academicYearId');
    const classId = watch('classId');
    const categoryId = watch('categoryId');
    const termIds = watch('termIds') || [];
    const admissionNo = watch('admissionNo');

    const { data: academicYears, isLoading: loadingAY } = useconcessionacademicyerdropdowndatafee(MI_ID);
    const { data: terms, isLoading: loadingTerms } = useFeeConcessionTermDropdowndata(MI_ID);
    const { data: classes, isLoading: loadingClasses } = useFeeConcessionClassDropdowndata(MI_ID);
    const { data: categories, isLoading: loadingCategories } = useopeningCategorydropdowndatafee();

    // Determine if we have the required filter (class or category)
    const hasFilterId =
        selectionType === 'C' || selectionType === 'L'
            ? !!classId
            : selectionType === 'A' || selectionType === 'F'
              ? !!categoryId
              : selectionType === 'S'
                ? !!admissionNo
                : false;

    const filterId =
        selectionType === 'C' || selectionType === 'L'
            ? classId
            : selectionType === 'A' || selectionType === 'F'
              ? categoryId
              : selectionType === 'S'
                ? admissionNo
                : undefined;

    const shouldFetchStudents = !!academicYearId && hasFilterId;

    const studentQuery = useFeeConcessionStudentList(
        MI_ID,
        Number(academicYearId || 0),
        selectionType === 'S' ? 0 : Number(filterId || 0),
        selectionType as any
    );

    const headQuery = useFeeConcessionHeadList(MI_ID, Number(academicYearId || 0), Number(classId || 0));

    // Load students
    useEffect(() => {
        if (studentQuery.data?.data && shouldFetchStudents) {
            setStudents(
                studentQuery.data.data.map((s: any) => ({
                    amst_Id: s.amsT_Id,
                    studentName: s.studentName || '—',
                    registrationNo: s.amsT_RegistrationNo || '—',
                    admNo: s.amsT_AdmNo || '—',
                    rollNo: s.amaY_RollNo || 0,
                    checked: false,
                    concessionAmount: 0
                }))
            );
        } else {
            setStudents([]);
        }
    }, [studentQuery.data, shouldFetchStudents]);

    const selectedStudentsCount = students.filter((s) => s.checked).length;
    const shouldShowHeads = selectedStudentsCount > 0;

    useEffect(() => {
        if (shouldShowHeads && headQuery.data?.data) {
            setHeads(
                headQuery.data.data.map((h: any, i: number) => ({
                    slno: i + 1,
                    fmH_Id: h.fmH_Id,
                    fmH_FeeName: h.fmH_FeeName,
                    fmI_Name: h.fmI_Name || 'Yearly',
                    fmA_Amount: h.fmA_Amount || 0,
                    type: '' as 'Amount' | 'Percentage' | '',
                    concessionValue: 0,
                    remarks: '',
                    checked: false
                }))
            );
        } else {
            setHeads([]);
        }
    }, [shouldShowHeads, headQuery.data]);

    useEffect(() => {
        setStudents([]);
        setHeads([]);
        setValue('classId', undefined);
        setValue('categoryId', undefined);
        setValue('admissionNo', undefined);
        setSearchValue('');
    }, [selectionType, setValue]);

    const filteredStudents = students.filter(
        (s) =>
            (s.studentName || '').toLowerCase().includes(searchValue.toLowerCase()) ||
            (s.admNo || '').toLowerCase().includes(searchValue.toLowerCase())
    );

    const allStudentsChecked = students.length > 0 && students.every((s) => s.checked);
    const someStudentsChecked = students.some((s) => s.checked) && !allStudentsChecked;

    const toggleAllStudents = () => {
        setStudents((prev) => prev.map((s) => ({ ...s, checked: !allStudentsChecked })));
    };

    const studentColumns: ColumnDef<StudentRow>[] = useMemo(
        () => [
            {
                id: 'select',
                header: () => (
                    <Checkbox
                        checked={allStudentsChecked}
                        {...(someStudentsChecked ? { 'data-state': 'indeterminate' } : {})}
                        onCheckedChange={toggleAllStudents}
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.original.checked}
                        onCheckedChange={(v) =>
                            setStudents((prev) => prev.map((s) => (s.amst_Id === row.original.amst_Id ? { ...s, checked: !!v } : s)))
                        }
                    />
                ),
                size: 50
            },
            {
                accessorKey: 'studentName',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
                size: 320
            },
            { accessorKey: 'admNo', header: 'Adm No', size: 140 },
            { accessorKey: 'registrationNo', header: 'Reg No', size: 160 },
            {
                accessorKey: 'rollNo',
                header: 'Roll No',
                size: 100,
                cell: ({ row }) => <div className='text-center font-medium'>{row.original.rollNo || '-'}</div>
            },
            {
                id: 'amount',
                header: 'Concession Amount',
                size: 200,
                cell: ({ row }) => (
                    <Input
                        type='number'
                        min='0'
                        placeholder='0'
                        className='text-right font-medium'
                        value={row.original.concessionAmount}
                        onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setStudents((prev) =>
                                prev.map((s) => (s.amst_Id === row.original.amst_Id ? { ...s, concessionAmount: val } : s))
                            );
                        }}
                    />
                )
            }
        ],
        [allStudentsChecked, someStudentsChecked]
    );

    const headColumns: ColumnDef<HeadRow>[] = useMemo(
        () => [
            { accessorKey: 'slno', header: 'S.No', size: 70, cell: ({ row }) => <div className='text-center'>{row.original.slno}</div> },
            {
                id: 'select',
                header: () => <></>,
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.original.checked}
                        onCheckedChange={(v) =>
                            setHeads((prev) => prev.map((h) => (h.fmH_Id === row.original.fmH_Id ? { ...h, checked: !!v } : h)))
                        }
                    />
                ),
                size: 60
            },
            { accessorKey: 'fmH_FeeName', header: 'Fee Head', size: 300 },
            { accessorKey: 'fmI_Name', header: 'Installment', size: 160 },
            {
                id: 'type',
                header: 'Type',
                size: 160,
                cell: ({ row }) => (
                    <Select
                        value={row.original.type}
                        onValueChange={(value) =>
                            setHeads((prev) =>
                                prev.map((h) =>
                                    h.fmH_Id === row.original.fmH_Id
                                        ? { ...h, type: value as 'Amount' | 'Percentage', concessionValue: 0 }
                                        : h
                                )
                            )
                        }>
                        <SelectTrigger className='h-9'>
                            <SelectValue placeholder='Select' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='Amount'>Amount</SelectItem>
                            <SelectItem value='Percentage'>Percentage</SelectItem>
                        </SelectContent>
                    </Select>
                )
            },
            {
                accessorKey: 'fmA_Amount',
                header: 'Amount',
                size: 140,
                cell: ({ row }) => <div className='pr-3 text-right font-medium'>{row.original.fmA_Amount.toLocaleString()}</div>
            },
            {
                id: 'concession',
                header: 'Concession',
                size: 200,
                cell: ({ row }) => (
                    <Input
                        type='number'
                        min='0'
                        max={row.original.type === 'Percentage' ? 100 : undefined}
                        placeholder={row.original.type === 'Percentage' ? '0-100' : 'Amount'}
                        className='text-right font-medium'
                        value={row.original.concessionValue}
                        onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setHeads((prev) => prev.map((h) => (h.fmH_Id === row.original.fmH_Id ? { ...h, concessionValue: val } : h)));
                        }}
                    />
                )
            },
            {
                id: 'remarks',
                header: 'Remarks',
                size: 280,
                cell: ({ row }) => (
                    <Input
                        placeholder='Optional'
                        value={row.original.remarks}
                        onChange={(e) =>
                            setHeads((prev) => prev.map((h) => (h.fmH_Id === row.original.fmH_Id ? { ...h, remarks: e.target.value } : h)))
                        }
                    />
                )
            }
        ],
        []
    );

    const onSubmit = () => {
        if (!academicYearId) return toast.error('Select Academic Year');
        if (!termIds.length) return toast.error('Select Term');
        if (selectedStudentsCount === 0) return toast.error('Select student(s)');
        if (heads.length === 0) return toast.error('No fee heads loaded');

        toast.success('Fee Concession Saved Successfully!');
        reset();
        setStudents([]);
        setHeads([]);
        setSearchValue('');
        onSuccess?.();
    };

    // Show Term only when required fields are filled (except for 'S')
    const showTermField = selectionType === 'S' ? !!academicYearId : !!academicYearId && hasFilterId;

    // Show Student Table only when Term is selected
    const showStudentTable = students.length > 0 && termIds.length > 0;

    return (
        <div className='mx-auto max-w-7xl space-y-8 p-4 md:p-6'>
            <Card className='overflow-hidden border-2 border-blue-100 pb-9 shadow-xl'>
                <CardContent className='p-4'>
                    <div className='flex justify-center'>
                        <RadioGroup
                            value={selectionType}
                            onValueChange={(v) => setSelectionType(v as any)}
                            className='flex flex-wrap justify-center gap-4 rounded-2xl p-4'>
                            {[
                                { value: 'C', label: 'Class Wise' },
                                { value: 'A', label: 'Adm Category Wise' },
                                { value: 'L', label: 'Left Student' },
                                { value: 'F', label: 'Fee Concession Category' },
                                { value: 'S', label: 'Admission No Search' }
                            ].map((item) => (
                                <div key={item.value} className='flex items-center space-x-4'>
                                    <RadioGroupItem value={item.value} id={item.value} className='h-6 w-6 border-2' />
                                    <Label
                                        htmlFor={item.value}
                                        className='cursor-pointer font-semibold text-gray-800 text-sm transition-all'>
                                        {item.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </CardContent>

                <CardContent className='space-y-6 pt-6'>
                    <div className='grid gap-6 md:grid-cols-2'>
                        {/* Academic Year - Always */}
                        <div className='flex flex-col gap-2'>
                            <Label className='font-medium'>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='academicYearId'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                        <SelectTrigger className='h-12'>
                                            <SelectValue placeholder={loadingAY ? 'Loading...' : 'Select Academic Year'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYears?.data?.map((ay: any) => (
                                                <SelectItem key={ay.asmaY_Id} value={String(ay.asmaY_Id)}>
                                                    {ay.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Class - For C & L */}
                        {(selectionType === 'C' || selectionType === 'L') && (
                            <div className='flex flex-col gap-2'>
                                <Label className='font-medium'>
                                    Class <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='classId'
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                            <SelectTrigger className='h-12'>
                                                <SelectValue placeholder={loadingClasses ? 'Loading...' : 'Select Class'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes?.data?.map((cls: any) => (
                                                    <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                        {cls.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        )}

                        {/* Category - For A & F */}
                        {(selectionType === 'A' || selectionType === 'F') && (
                            <div className='flex flex-col gap-2'>
                                <Label className='font-medium'>
                                    {selectionType === 'A' ? 'Category' : 'Fee Concession Category'} <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='categoryId'
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                            <SelectTrigger className='h-12'>
                                                <SelectValue placeholder={loadingCategories ? 'Loading...' : 'Select Category'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories?.data?.map((cat: any) => (
                                                    <SelectItem key={cat.fmcC_Id} value={String(cat.fmcC_Id)}>
                                                        {cat.fmcC_ClassCategoryName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        )}

                        {/* Admission No Search */}
                        {selectionType === 'S' && (
                            <div className='flex flex-col gap-2'>
                                <Label className='font-medium'>
                                    Admission No <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='admissionNo'
                                    render={({ field }) => (
                                        <Input
                                            placeholder='Enter Admission No'
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            className='h-12'
                                        />
                                    )}
                                />
                            </div>
                        )}

                        {/* Term - Conditionally Visible */}
                        {showTermField && (
                            <div className='flex flex-col gap-2'>
                                <Label className='font-medium'>
                                    Term Name <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='termIds'
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={terms?.data?.map((t: any) => ({ label: t.fmT_Name, value: String(t.fmT_Id) })) || []}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value || []}
                                            placeholder={loadingTerms ? 'Loading...' : 'Select Terms'}
                                            className='h-12'
                                        />
                                    )}
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Student Table - Only after Term is selected */}
            {showStudentTable && (
                <Card className='shadow-xl'>
                    <CardHeader className='text-black'>
                        <CardTitle className='text-2xl'>Student List ({selectedStudentsCount} selected)</CardTitle>
                    </CardHeader>
                    <CardContent className='p-6'>
                        <div className='overflow-hidden rounded-lg border bg-white'>
                            <GenericDataTable
                                columns={studentColumns}
                                data={filteredStudents}
                                isLoading={studentQuery.isLoading}
                                totalItems={filteredStudents.length}
                                isPaginationRequired={true}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Fee Heads */}
            {shouldShowHeads && heads.length > 0 && (
                <Card className='shadow-xl'>
                    <CardHeader className='text-black'>
                        <CardTitle className='text-2xl'>Fee Head List</CardTitle>
                    </CardHeader>
                    <CardContent className='p-0'>
                        <div className='overflow-hidden rounded-lg border bg-white'>
                            <GenericDataTable
                                columns={headColumns}
                                data={heads}
                                isLoading={false}
                                totalItems={heads.length}
                                isPaginationRequired={false}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Buttons */}
            <div className='flex flex-col-reverse gap-4 border-t pt-6 sm:flex-row sm:justify-start'>
                <Button
                    size='lg'
                    variant='outline'
                    onClick={() => {
                        reset();
                        setStudents([]);
                        setHeads([]);
                        setSearchValue('');
                    }}
                    className='w-full transition-all duration-200 hover:scale-105 sm:w-auto'>
                    <X className='mr-2 h-5 w-5' /> Cancel
                </Button>
                <Button
                    size='lg'
                    onClick={onSubmit}
                    disabled={saving || selectedStudentsCount === 0}
                    isLoading={saving}
                    className='w-full transition-all duration-200 hover:scale-105 sm:w-auto'>
                    <Save className='mr-2 h-5 w-5' />
                    Save Concession
                </Button>
            </div>
        </div>
    );
}
