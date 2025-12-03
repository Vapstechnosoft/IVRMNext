'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useMasterFeeOpeningBalance,
    useconcessionacademicyerdropdowndatafee,
    useopeningCategorydropdowndatafee,
    useopeningClassdropdowndatafee,
    useopeningSectiondropdowndatafee
} from '@/hooks/fees/useTrasactions';
import { feeOpeningBalanceSchema } from '@/schemas/fees/trasactions';
import { addOrUpdateFeeOpeningBalance } from '@/server/fees/trasactions/fee_opening_balance';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
type FormFields = z.infer<typeof feeOpeningBalanceSchema.addOrUpdate>;
interface StudentRow {
    amst_Id: number;
    fullName: string;
    fmoB_Student_Due: number;
    fmoB_Institution_Due: number;
    checked: boolean;
}

export default function AddFeeConcessionForm({
    onSuccess,
    className = ''
}: {
    onSuccess?: () => void;
    className?: string;
}) {
    const { refetchAll } = useMasterFeeOpeningBalance();
    const { control, reset, resetField, setValue } = useForm<FormFields>({
        resolver: zodResolver(feeOpeningBalanceSchema.addOrUpdate),
        defaultValues: {
            academicYearId: undefined,
            classId: undefined,
            sectionId: undefined,
            headId: undefined,
            groupId: undefined,
            installmentId: undefined,
            date: format(new Date(), 'yyyy-MM-dd')
        }
    });

    const academicYearId = useWatch({ control, name: 'academicYearId' });
    const mi_Id = useWatch({ control, name: 'mi_Id' });
    const classId = useWatch({ control, name: 'classId' });
    const sectionId = useWatch({ control, name: 'sectionId' });
    const headId = useWatch({ control, name: 'headId' });
    const groupId = useWatch({ control, name: 'groupId' });
    const installmentId = useWatch({ control, name: 'installmentId' });
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectionType, setSelectionType] = useState<'C' | 'A' | 'L' | 'F' | 'S'>('C');

    const [categoryId, setCategoryId] = useState<string>('');
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [showTable, setShowTable] = useState(false);
    const [saving, setSaving] = useState(false);

    const { data: academicYear, isLoading: loadingAcademicYear } = useconcessionacademicyerdropdowndatafee(mi_Id ? Number(mi_Id) : 0);
    const { data: classdata, isLoading: loadingClasses } = useopeningClassdropdowndatafee();
    const { data: sectiondata, isLoading: loadingSections } = useopeningSectiondropdowndatafee(
        academicYearId ? Number(academicYearId) : 0,
        classId ? Number(classId) : 0
    );

    // const { data: refundabledata, isLoading: loadingRefundable } = useFeeOpeningRefundable(
    //     academicYearId ? Number(academicYearId) : 0,
    //     refundableType
    // );

    const { data: categorydata, isLoading: loadingCategories } = useopeningCategorydropdowndatafee();
    // const { data: groupdata, isLoading: loadingGroups } = useopeningGroupdropdowndatafee(headId ? Number(headId) : 0);
    // const { data: installmentdata, isLoading: loadingInstallments } = useopeningInstallmentdropdowndatafee(
    //     academicYearId ? Number(academicYearId) : 0,
    //     groupId ? Number(groupId) : 0,
    //     headId ? Number(headId) : 0
    // );

    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        setStudents([]);
        setShowTable(false);
        setCategoryId('');
    }, [selectionType]);

    useEffect(() => {
        resetField('headId');
        resetField('groupId');
        resetField('installmentId');
    }, [academicYearId, resetField]);

    const onSubmit = async () => {
        const selected = students.filter((s) => s.checked);
        if (selected.length === 0) return toast.error('Please select at least one student');
        setSaving(true);
        try {
            const payload = {
                Asmay_Id: Number(academicYearId),
                Fmg_Id: groupId ? Number(groupId) : 0,

                FMOB_Entry_Date: format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss"),
                SaveTmpData: selected.map((s) => ({
                    Amst_Id: s.amst_Id,
                    FMOB_Student_Due: s.fmoB_Student_Due,
                    FMOB_Institution_Due: s.fmoB_Institution_Due,
                    checkedvalue: true
                })),
                TempHeadList: [{ FTI_Id: installmentId ? Number(installmentId) : 0 }]
            };

            const res = await addOrUpdateFeeOpeningBalance(payload);
            if (res.success || res.returnval) {
                toast.success('Opening balance saved successfully!');
                handleFullReset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(res.message || 'Failed to save');
            }
        } catch {
            toast.error('Error saving data');
        } finally {
            setSaving(false);
        }
    };

    const handleFullReset = () => {
        reset();
        setSelectedDate(new Date());
        setSelectionType('C');
        setCategoryId('');
        setStudents([]);
        setShowTable(false);
    };

    const columns: ColumnDef<StudentRow>[] = useMemo(
        () => [
            {
                id: 'select',

                header: () => {
                    const checkedCount = students.filter((s) => s.checked).length;
                    const allChecked = checkedCount === students.length && students.length > 0;
                    const someChecked = checkedCount > 0 && !allChecked;
                    return (
                        <Checkbox
                            checked={allChecked}
                            {...(someChecked ? { 'data-state': 'indeterminate' } : {})}
                            onCheckedChange={(checked) => {
                                //const newCheckedState = checked ? true : false;
                                const newCheckedState = !!checked;
                                setStudents((prev) => prev.map((s) => ({ ...s, checked: newCheckedState })));
                            }}
                        />
                    );
                },

                cell: ({ row }) => (
                    <Checkbox
                        checked={row.original.checked}
                        onCheckedChange={(checked) => {
                            setStudents((prev) => prev.map((s) => (s.amst_Id === row.original.amst_Id ? { ...s, checked: !!checked } : s)));
                        }}
                    />
                ),

                size: 50
            },

            {
                accessorKey: 'fullName',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
                size: 300
            },

            {
                accessorKey: 'fmoB_Student_Due',
                header: 'Student Due',
                cell: ({ row }) => (
                    <Input
                        type='number'
                        min='0'
                        step='1'
                        className='w-32 text-right font-medium sm:w-40'
                        value={row.original.fmoB_Student_Due}
                        onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setStudents((prev) =>
                                prev.map((s) => (s.amst_Id === row.original.amst_Id ? { ...s, fmoB_Student_Due: val } : s))
                            );
                        }}
                    />
                )
            },

            {
                accessorKey: 'fmoB_Institution_Due',
                header: 'Institution Due',
                cell: ({ row }) => (
                    <Input
                        type='number'
                        min='0'
                        step='1'
                        className='w-32 text-right font-medium sm:w-40'
                        value={row.original.fmoB_Institution_Due}
                        onChange={(e) => {
                            const val = Number(e.target.value) || 0;

                            setStudents((prev) =>
                                prev.map((s) => (s.amst_Id === row.original.amst_Id ? { ...s, fmoB_Institution_Due: val } : s))
                            );
                        }}
                    />
                )
            }
        ],

        [students, setStudents]
    );

    return (
        <div className={`space-y-6 ${className}`}>
            <div className='flex flex-wrap justify-center gap-6 rounded-lg border bg-white p-4 shadow-sm sm:gap-12 sm:p-6'>
                {(['C', 'A', 'L', 'F', 'S'] as const).map((val) => (
                    <label key={val} className='flex cursor-pointer items-center gap-3'>
                        <input
                            type='radio'
                            name='selectionType'
                            value={val}
                            checked={selectionType === val}
                            onChange={(e) => setSelectionType(e.target.value as any)}
                            className='h-5 w-5 text-blue-600'
                        />

                        <span className='font-medium text-sm sm:text-base'>
                            {val === 'C'
                                ? 'Class Wise'
                                : val === 'A'
                                  ? 'Adm Category Wise'
                                  : val === 'L'
                                    ? 'Left Student'
                                    : val === 'F'
                                      ? 'Fee Concession Category'
                                      : 'Admission No Search'}
                        </span>
                    </label>
                ))}
            </div>

            {/* Main Form */}

            <div className='grid gap-8 lg:grid-cols-2'>
                <div className='space-y-5'>
                    {/* Academic Year */}
                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                        <Label className='w-44 text-right sm:w-44'>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>

                        <div className='w-full sm:w-96'>
                            <Controller
                                name='academicYearId'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                                        value={field.value?.toString()}
                                        disabled={loadingAcademicYear}>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={loadingAcademicYear ? 'Loading academic years...' : 'Select Academic Year'}
                                            />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {loadingAcademicYear ? (
                                                <div className='px-4 py-8 text-center text-muted-foreground'>Loading...</div>
                                            ) : academicYear?.data && academicYear.data.length > 0 ? (
                                                academicYear.data.map((item: any) => (
                                                    <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-4 py-8 text-center text-muted-foreground'>No academic years found</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    {/* Category (Category mode) */}

                    {selectionType === 'A' && (
                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                            <Label className='w-44 text-right'>
                                Category <span className='text-red-500'>*</span>
                            </Label>

                            <div className='w-full sm:w-96'>
                                <Select value={categoryId} onValueChange={setCategoryId} disabled={loadingCategories}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingCategories ? 'Loading categories...' : 'Select Category'} />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {loadingCategories ? (
                                            <div className='px-4 py-8 text-center text-muted-foreground'>Loading...</div>
                                        ) : categorydata?.data && categorydata.data.length > 0 ? (
                                            categorydata.data.map((item: any) => (
                                                <SelectItem key={item.fmcC_Id} value={String(item.fmcC_Id)}>
                                                    {item.fmcC_ClassCategoryName}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className='px-4 py-8 text-center text-muted-foreground'>No categories found</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Class & Section */}

                    {(selectionType === 'C' || selectionType === 'L') && (
                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                            <Label className='w-44 text-right'>
                                Class <span className='text-red-500'>*</span>
                            </Label>

                            <div className='w-full sm:w-96'>
                                <Controller
                                    name='classId'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                                            value={field.value?.toString()}
                                            disabled={loadingClasses}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={loadingClasses ? 'Loading classes...' : 'Select Class'} />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {loadingClasses ? (
                                                    <div className='px-4 py-8 text-center text-muted-foreground'>Loading...</div>
                                                ) : classdata?.data && classdata.data.length > 0 ? (
                                                    classdata.data.map((item: any) => (
                                                        <SelectItem key={item.asmcL_Id} value={String(item.asmcL_Id)}>
                                                            {item.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className='px-4 py-8 text-center text-muted-foreground'>No classes found</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                    {selectionType === 'F' && (
                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                            <Label className='w-44 text-right'>
                                Fee Concession Category <span className='text-red-500'>*</span>
                            </Label>

                            <div className='w-full sm:w-96'>
                                <Controller
                                    name='sectionId'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            disabled={!classId || loadingSections}
                                            onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                                            value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={
                                                        loadingSections
                                                            ? 'Loading sections...'
                                                            : classId
                                                              ? 'Select Section'
                                                              : 'Select Class first'
                                                    }
                                                />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {loadingSections ? (
                                                    <div className='px-4 py-8 text-center text-muted-foreground'>Loading...</div>
                                                ) : sectiondata?.data && sectiondata.data.length > 0 ? (
                                                    sectiondata.data.map((item: any) => (
                                                        <SelectItem key={item.asmS_Id} value={String(item.asmS_Id)}>
                                                            {item.asmC_SectionName}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className='px-4 py-8 text-center text-muted-foreground'>No sections found</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {selectionType === 'S' && (
                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                            <Label className='w-44 text-right'>
                                Admission No: <span className='text-red-500'>*</span>
                            </Label>

                            <div className='w-full sm:w-96'>
                                <Controller
                                    name='sectionId'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            disabled={!classId || loadingSections}
                                            onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                                            value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={
                                                        loadingSections
                                                            ? 'Loading sections...'
                                                            : classId
                                                              ? 'Select Section'
                                                              : 'Select Class first'
                                                    }
                                                />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {loadingSections ? (
                                                    <div className='px-4 py-8 text-center text-muted-foreground'>Loading...</div>
                                                ) : sectiondata?.data && sectiondata.data.length > 0 ? (
                                                    sectiondata.data.map((item: any) => (
                                                        <SelectItem key={item.asmS_Id} value={String(item.asmS_Id)}>
                                                            {item.asmC_SectionName}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className='px-4 py-8 text-center text-muted-foreground'>No sections found</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    <div className='group flex flex-col gap-1.5'>
                        <Label aria-label='Heads' htmlFor='fmH_Id'>
                            Term Name <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        {/* <Controller
                                name='heads'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            masterHeads?.data?.map((data) => ({
                                                label: data.fmH_FeeName || '',
                                                value: data.fmH_Id.toString()
                                            })) ?? []
                                        }
                                        onValueChange={(selectedValues) => {
                                            field.onChange(selectedValues);
                                            handleHeadSelection(selectedValues);
                                        }}
                                        defaultValue={selectedHeadsItems.map((data) =>
                                            data.fmH_Id !== undefined ? data.fmH_Id.toString() : ''
                                        )}
                                        value={selectedHeadsItems.map((data) => (data.fmH_Id !== undefined ? data.fmH_Id.toString() : ''))}
                                        placeholder='Select Heads'
                                        variant='inverted'
                                        disabled={masterHeadsLoading}
                                    />
                                )}
                            /> */}

                        {/* {errors.heads && <FormError>{errors.heads.message}</FormError>} */}
                    </div>

                    {showTable && (
                        <Card className='shadow-lg'>
                            <CardHeader>
                                <CardTitle className='text-lg sm:text-xl'>Student Opening Balance</CardTitle>
                            </CardHeader>

                            <CardContent className='overflow-x-auto'>
                                <div className='mb-4'>
                                    <Input
                                        placeholder='Search by student name...'
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className='max-w-sm'
                                    />
                                </div>

                                <GenericDataTable<StudentRow>
                                    columns={columns}
                                    data={students.filter((s) => s.fullName.toLowerCase().includes(searchValue.toLowerCase()))}
                                    totalItems={students.filter((s) => s.fullName.toLowerCase().includes(searchValue.toLowerCase())).length}
                                    isLoading={true}
                                    isPaginationRequired={false}
                                    showViewOptions={false}
                                    isSearchRequired={false}
                                />
                            </CardContent>
                        </Card>
                    )}

                    <div className='flex flex-col-reverse gap-4 border-t pt-6 sm:flex-row sm:justify-start'>
                        <Button
                            type='button'
                            variant='outline'
                            size='lg'
                            onClick={handleFullReset}
                            className='w-full transition-all duration-200 hover:scale-105 sm:w-auto'>
                            Reset
                        </Button>

                        <Button
                            type='button'
                            size='lg'
                            onClick={onSubmit}
                            disabled={students.filter((s) => s.checked).length === 0 || saving}
                            isLoading={saving}
                            className='w-full transition-all duration-200 hover:scale-105 sm:w-auto'>
                            <Save className='mr-2 h-5 w-5' />
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
