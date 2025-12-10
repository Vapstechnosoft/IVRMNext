'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useFeeConcessionCategoryFeeConcessionDropdowndata,
    useFeeConcessionClassDropdowndata,
    useFeeConcessionConfigSet,
    useFeeConcessionHeadDetailsList,
    useFeeConcessionStudentList,
    useFeeConcessionTermDropdowndata,
    useconcessionacademicyerdropdowndatafee,
    useopeningCategorydropdowndatafee
} from '@/hooks/fees/useTrasactions';
import { saveFeeHead } from '@/server/fees/trasactions/FeeConcession';
import type { ColumnDef } from '@tanstack/react-table';
import { Save, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

const MI_ID = 30;

interface StudentRow {
    amst_Id: number;
    amsT_FirstName: string;
    amsT_MiddleName: string;
    amsT_LastName: string;
    registrationNo: string;
    admNo: string;
    rollNo: number;
    checked: boolean;
}

interface HeadRow {
    slno: number;
    fmH_Id: number;
    fmG_Id?: number;
    ftI_Id?: number;
    fmH_FeeName: string;
    ftI_Name: string;
    fmA_Amount: number;
    type: 'Amount' | 'Percentage' | '';
    concessionValue: number;
    remarks: string;
    checked: boolean;
}

export default function AddFeeConcessionForm({ onSuccess }: { onSuccess?: () => void }) {
    const { control, watch, reset, setValue } = useForm();
    const [selectionType, setSelectionType] = useState<
        'classwise' | 'categorywise' | 'leftstudent' | 'feecategorywise' | 'Admissionnosearch' | 'Staff' | 'Others'
    >('classwise');
    const [studentSearch, setStudentSearch] = useState('');
    const [headSearch, setHeadSearch] = useState('');
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [heads, setHeads] = useState<HeadRow[]>([]);
    const [saving, setSaving] = useState(false);

    const searchParams = useSearchParams();
    const academicYearId = watch('academicYearId');
    const classId = watch('classId');
    const categoryId = watch('categoryId');
    const feeCategoryId = watch('feeCategoryId');
    const termIds: string[] = watch('termIds') || [];
    const admissionNo = watch('admissionNo');

    const { data: configSetData } = useFeeConcessionConfigSet(Number(academicYearId || 0));
    const configSettings = configSetData?.data?.[0];
    const groupOrTermFlg = configSettings?.fmC_GroupOrTermFlg || 'G';
    const enableStaffTrans = configSettings?.fmC_EableStaffTrans === 1;
    const enableOtherStudentTrans = configSettings?.fmC_EableOtherStudentTrans === 1;

    const { data: academicYears, isLoading: loadingAY } = useconcessionacademicyerdropdowndatafee(MI_ID);
    const { data: terms, isLoading: loadingTerms } = useFeeConcessionTermDropdowndata(groupOrTermFlg, Number(academicYearId || 0));
    const { data: classes, isLoading: loadingClasses } = useFeeConcessionClassDropdowndata(MI_ID);
    const { data: categories, isLoading: loadingCategories } = useopeningCategorydropdowndatafee();
    const { data: feeConcessionCategories, isLoading: loadingfeeConcessionCategories } =
        useFeeConcessionCategoryFeeConcessionDropdowndata();

    const apiSearchParams = searchParams ? Object.fromEntries(searchParams.entries()) : {};

    const hasFilterId =
        selectionType === 'classwise' || selectionType === 'leftstudent'
            ? !!classId
            : selectionType === 'categorywise'
              ? !!categoryId
              : selectionType === 'feecategorywise'
                ? !!feeCategoryId
                : selectionType === 'Admissionnosearch'
                  ? !!admissionNo
                  : false;

    const shouldFetchStudents = !!academicYearId && hasFilterId;

    const studentQuery = useFeeConcessionStudentList(
        String(selectionType || ''),
        Number(academicYearId || 0),
        Number(classId || 0),
        Number(categoryId || 0),
        Number(feeCategoryId || 0),
        apiSearchParams as any
    );

    useEffect(() => {
        if (studentQuery.data?.data && shouldFetchStudents) {
            const mapped = studentQuery.data.data.map((s: any) => ({
                amst_Id: s.amsT_Id,
                amsT_FirstName: s.amsT_FirstName,
                amsT_MiddleName: s.amsT_MiddleName,
                amsT_LastName: s.amsT_LastName,
                registrationNo: s.amsT_RegistrationNo || '—',
                admNo: s.amsT_AdmNo || '—',
                rollNo: s.amaY_RollNo || 0,
                checked: false
            }));
            setStudents(mapped);
            setStudentSearch('');
            if (mapped.length > 0) {
                setTimeout(() => {
                    setStudents((prev) => prev.map((s, i) => ({ ...s, checked: i === 0 })));
                }, 0);
            }
        } else {
            setStudents([]);
        }
    }, [studentQuery.data, shouldFetchStudents]);

    const selectedStudent = students.find((s) => s.checked);
    const selectedAmsT_Id = selectedStudent?.amst_Id || 0;

    const shouldShowHeads = students.length > 0 && termIds.length > 0 && selectedAmsT_Id > 0;

    // FIXED: Stable key to prevent infinite re-renders
    const termIdsKey = termIds.join(',');

    // Convert to proper format for API (axios will repeat fmgIds automatically)
    const termIdsForApi: number | number[] =
        termIds.length === 0 ? 0 : termIds.length === 1 ? Number(termIds[0]) : termIds.map((id) => Number(id));

    const headQuery = useFeeConcessionHeadDetailsList(
        Number(academicYearId || 0),
        selectedAmsT_Id,
        termIdsForApi as any, // axios handles number[] correctly → fmgIds=142&fmgIds=140
        groupOrTermFlg,
        apiSearchParams
    );

    // FIXED: Use stable primitive `termIdsKey` in deps → no infinite loop
    useEffect(() => {
        if (shouldShowHeads && headQuery.data?.data) {
            setHeads(
                headQuery.data.data.map((h: any, i: number) => ({
                    slno: i + 1,
                    fmH_Id: h.fmH_Id,
                    fmG_Id: h.fmG_Id || 0,
                    ftI_Id: h.ftI_Id || 0,
                    fmH_FeeName: h.fmH_FeeName,
                    ftI_Name: h.ftI_Name || 'Yearly',
                    fmA_Amount: h.fmA_Amount || 0,
                    type: '' as 'Amount' | 'Percentage' | '',
                    concessionValue: 0,
                    remarks: '',
                    checked: true
                }))
            );
            setHeadSearch('');
        } else {
            setHeads([]);
        }
    }, [headQuery.data, shouldShowHeads, termIdsKey, groupOrTermFlg]);

    useEffect(() => {
        setStudents([]);
        setHeads([]);
        setStudentSearch('');
        setHeadSearch('');
        setValue('classId', undefined);
        setValue('categoryId', undefined);
        setValue('admissionNo', undefined);
    }, [selectionType, setValue]);

    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            const fullName = `${s.amsT_FirstName} ${s.amsT_MiddleName} ${s.amsT_LastName}`.trim().toLowerCase();
            const search = studentSearch.toLowerCase();
            return fullName.includes(search) || s.admNo.toLowerCase().includes(search);
        });
    }, [students, studentSearch]);

    const filteredHeads = useMemo(() => {
        return heads.filter((h) => {
            const search = headSearch.toLowerCase();
            return h.fmH_FeeName.toLowerCase().includes(search) || (h.ftI_Name || '').toLowerCase().includes(search);
        });
    }, [heads, headSearch]);

    const toggleStudent = (amst_Id: number) => {
        setStudents((prev) => prev.map((s) => ({ ...s, checked: s.amst_Id === amst_Id })));
    };

    const studentColumns: ColumnDef<StudentRow>[] = [
        {
            id: 'select',
            header: () => <div className='w-10' />,
            cell: ({ row }) => <Checkbox checked={row.original.checked} onCheckedChange={() => toggleStudent(row.original.amst_Id)} />,
            size: 50
        },
        {
            accessorKey: 'slno',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
            cell: ({ row, table }) => {
                const index = table.getSortedRowModel().rows.findIndex((r) => r.id === row.id);
                return <div className='pl-6'>{index + 1}</div>;
            }
        },
        { accessorKey: 'admNo', header: 'Adm No', size: 140 },
        { accessorKey: 'registrationNo', header: 'Reg No', size: 140 },
        {
            accessorFn: (row) => `${row.amsT_FirstName} ${row.amsT_MiddleName} ${row.amsT_LastName}`.trim(),
            id: 'fullName',
            header: 'Student Name'
        },
        {
            accessorKey: 'rollNo',
            header: 'Roll No',
            size: 80,
            cell: ({ row }) => <div className='text-center'>{row.original.rollNo || '-'}</div>
        }
    ];

    const headColumns: ColumnDef<HeadRow>[] = [
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
        { accessorKey: 'ftI_Name', header: 'Installment', size: 160 },
        {
            id: 'type',
            header: 'Type',
            size: 160,
            cell: ({ row }) => (
                <Select
                    value={row.original.type}
                    onValueChange={(value) =>
                        setHeads((prev) =>
                            prev.map((h) => (h.fmH_Id === row.original.fmH_Id ? { ...h, type: value as any, concessionValue: 0 } : h))
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
                    className='text-right'
                    value={row.original.concessionValue || ''}
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
    ];

    const onSubmit = async () => {
        if (!selectedStudent) return toast.error('Please select a student');
        if (!termIds.length) return toast.error('Select Term');
        if (heads.length === 0) return toast.error('No fee heads loaded');
        const selectedHeads = heads.filter((h) => h.checked && h.type && h.concessionValue > 0);
        if (selectedHeads.length === 0) return toast.error('Please apply concession on at least one head');

        try {
            setSaving(true);
            const payload = {
                ASMAY_Id: Number(academicYearId),
                RadioBtnValue: selectionType,
                SaveTempData: [{ AMST_Id: selectedStudent.amst_Id }],
                SaveTempData1: selectedHeads.map((h) => ({
                    FMG_Id: h.fmG_Id || 0,
                    FMH_Id: h.fmH_Id,
                    FTI_Id: h.ftI_Id || 0,
                    FSC_ConcessionReason: h.remarks || '',
                    FSC_ConcessionType: h.type === 'Percentage' ? 'Percentage' : 'Amount',
                    FSCI_ConcessionAmount: h.concessionValue
                }))
            };
            await saveFeeHead(payload);
            toast.success('Fee Concession Saved Successfully!');
            reset();
            setStudents([]);
            setHeads([]);
            setStudentSearch('');
            setHeadSearch('');
            onSuccess?.();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const showTermField = selectionType === 'Admissionnosearch' ? !!academicYearId : !!academicYearId && hasFilterId;
    const showStudentTable = students.length > 0 && termIds.length > 0;

    const radioOptions = [
        { value: 'classwise', label: 'Class Wise' },
        { value: 'categorywise', label: 'Adm Category Wise' },
        { value: 'leftstudent', label: 'Left Student' },
        { value: 'feecategorywise', label: 'Fee Concession Category' },
        { value: 'Admissionnosearch', label: 'Admission No Search' },
        ...(enableStaffTrans ? [{ value: 'Staff', label: 'Staff' }] : []),
        ...(enableOtherStudentTrans ? [{ value: 'Others', label: 'Others' }] : [])
    ];

    return (
        <div className='mx-auto max-w-7xl space-y-8 p-4 md:p-6'>
            <Card className='overflow-hidden border-2 border-blue-100 pb-9 shadow-xl'>
                <CardContent className='p-4'>
                    <div className='flex justify-center'>
                        <RadioGroup
                            value={selectionType}
                            onValueChange={(v) => setSelectionType(v as any)}
                            className='flex flex-wrap justify-center gap-4 rounded-2xl p-4'>
                            {radioOptions.map((item) => (
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

                        {(selectionType === 'classwise' || selectionType === 'leftstudent') && (
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
                                                <SelectValue placeholder='Select Class' />
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

                        {selectionType === 'categorywise' && (
                            <div className='flex flex-col gap-2'>
                                <Label className='font-medium'>
                                    Category <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='categoryId'
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                            <SelectTrigger className='h-12'>
                                                <SelectValue placeholder='Select Category' />
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

                        {selectionType === 'feecategorywise' && (
                            <div className='flex flex-col gap-2'>
                                <Label className='font-medium'>
                                    Fee Concession Category <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='feeCategoryId'
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                            <SelectTrigger className='h-12'>
                                                <SelectValue placeholder='Select Category' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {feeConcessionCategories?.data?.map((cat: any) => (
                                                    <SelectItem key={cat.fmcC_Id} value={String(cat.fmcC_Id)}>
                                                        {cat.fmcC_ConcessionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        )}

                        {selectionType === 'Admissionnosearch' && (
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
                                            options={
                                                terms?.data?.map((t: any) => ({ label: t.fmG_GroupName, value: String(t.fmG_Id) })) || []
                                            }
                                            onValueChange={field.onChange}
                                            defaultValue={field.value || []}
                                            placeholder='Select Terms'
                                            className='h-12'
                                        />
                                    )}
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {showStudentTable && (
                <Card className='shadow-xl'>
                    <CardHeader className='text-black'>
                        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                            <CardTitle className='text-2xl'>Student List ({selectedStudent ? 1 : 0} selected)</CardTitle>
                            <Input
                                placeholder='Search by name or admission no...'
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                className='h-10 w-full sm:max-w-sm'
                            />
                        </div>
                    </CardHeader>
                    <CardContent className='p-6'>
                        <div className='overflow-hidden rounded-lg border bg-white'>
                            <GenericDataTable
                                columns={studentColumns}
                                data={filteredStudents}
                                isLoading={studentQuery.isLoading}
                                totalItems={filteredStudents.length}
                                isPaginationRequired={false}
                                isSearchRequired={false}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {shouldShowHeads && (
                <Card className='shadow-xl'>
                    <CardHeader className='text-black'>
                        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                            <CardTitle className='text-2xl'>Fee Head List</CardTitle>
                            <Input
                                placeholder='Search fee head or installment...'
                                value={headSearch}
                                onChange={(e) => setHeadSearch(e.target.value)}
                                className='h-10 w-full sm:max-w-sm'
                            />
                        </div>
                    </CardHeader>
                    <CardContent className='p-6'>
                        <div className='overflow-hidden rounded-lg border bg-white'>
                            <GenericDataTable
                                columns={headColumns}
                                data={filteredHeads}
                                isLoading={headQuery.isLoading}
                                totalItems={filteredHeads.length}
                                isPaginationRequired={false}
                                isSearchRequired={false}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className='flex flex-col-reverse gap-4 border-t pt-6 sm:flex-row sm:justify-start'>
                <Button
                    size='lg'
                    variant='outline'
                    onClick={() => {
                        reset();
                        setStudents([]);
                        setHeads([]);
                        setStudentSearch('');
                        setHeadSearch('');
                    }}
                    className='w-full transition-all duration-200 hover:scale-105 sm:w-auto'>
                    <X className='mr-2 h-5 w-5' /> Cancel
                </Button>
                <Button
                    size='lg'
                    onClick={onSubmit}
                    disabled={saving || !selectedStudent}
                    isLoading={saving}
                    className='w-full transition-all duration-200 hover:scale-105 sm:w-auto'>
                    <Save className='mr-2 h-5 w-5' />
                    Save Concession
                </Button>
            </div>
        </div>
    );
}
