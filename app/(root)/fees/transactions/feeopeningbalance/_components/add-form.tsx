'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useFeeOpeningRefundable,
    useMasterFeeOpeningBalance,
    useopeningCategorydropdowndatafee,
    useopeningClassdropdowndatafee,
    useopeningGroupdropdowndatafee,
    useopeningInstallmentdropdowndatafee,
    useopeningSectiondropdowndatafee,
    useopeningacademicyerdropdowndatafee
} from '@/hooks/fees/useTrasactions';
import { feeOpeningBalanceSchema } from '@/schemas/fees/trasactions';
import { addOrUpdateFeeOpeningBalance, studentListDropdown, studentNameDropdown } from '@/server/fees/trasactions/fee_opening_balance';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CalendarIcon, Eye, Save } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

export default function AddFeeOpeningBalanceForm({
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
    const classId = useWatch({ control, name: 'classId' });
    const sectionId = useWatch({ control, name: 'sectionId' });
    const headId = useWatch({ control, name: 'headId' });
    const groupId = useWatch({ control, name: 'groupId' });
    const installmentId = useWatch({ control, name: 'installmentId' });
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectionType, setSelectionType] = useState<'T' | 'G' | 'C'>('T');
    const [refundableType, setRefundableType] = useState<'Refundable' | 'NonRefundable'>('Refundable');
    const [activeType, setActiveType] = useState<'Active' | 'Left'>('Active');
    const [activefee, setActivefee] = useState<'Fee' | 'PDA'>('Fee');
    const [nameType, setNameType] = useState<'NameRegNo' | 'RegNameNo'>('NameRegNo');
    const [studentWise, setStudentWise] = useState<string>('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [totalStudentCount, setTotalStudentCount] = useState(0);
    const [showTable, setShowTable] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [studentDropdownList, setStudentDropdownList] = useState<{ value: string; label: string }[]>([]);
    const [loadingDropdown, setLoadingDropdown] = useState(false);
    const isPDA = activefee === 'PDA';
    const { data: academicYear, isLoading: loadingAcademicYear } = useopeningacademicyerdropdowndatafee();
    const { data: classdata, isLoading: loadingClasses } = useopeningClassdropdowndatafee();
    const { data: sectiondata, isLoading: loadingSections } = useopeningSectiondropdowndatafee(
        academicYearId ? Number(academicYearId) : 0,
        classId ? Number(classId) : 0
    );

    const { data: refundabledata, isLoading: loadingRefundable } = useFeeOpeningRefundable(
        academicYearId ? Number(academicYearId) : 0,
        refundableType
    );

    const { data: categorydata, isLoading: loadingCategories } = useopeningCategorydropdowndatafee();
    const { data: groupdata, isLoading: loadingGroups } = useopeningGroupdropdowndatafee(headId ? Number(headId) : 0);
    const { data: installmentdata, isLoading: loadingInstallments } = useopeningInstallmentdropdowndatafee(
        academicYearId ? Number(academicYearId) : 0,
        groupId ? Number(groupId) : 0,
        headId ? Number(headId) : 0
    );

    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        setValue('headId', undefined);
        setValue('groupId', undefined);
        setValue('installmentId', undefined);
    }, [refundableType, setValue]);

    const showFeeGroup = useMemo(() => {
        if (!headId || !refundabledata?.data) return false;
        const head = refundabledata.data.find((h: any) => h.fmH_Id === Number(headId));
        return head?.fmH_FeeName !== 'Other Allowances';
    }, [headId, refundabledata]);

    const showFeeInstallment = useMemo(() => {
        if (!headId || !groupId || !refundabledata?.data || !groupdata?.data) return false;
        const head = refundabledata.data.find((h: any) => h.fmH_Id === Number(headId))?.fmH_FeeName;
        const group = groupdata.data.find((g: any) => g.fmG_Id === Number(groupId))?.fmG_GroupName;
        return head === 'TRANSPORT FEE' && group && ['TRANSPORT FEE', 'TRANSPORT OTHER FEE', 'TRANSPORT UKG AND LKG FEE'].includes(group);
    }, [headId, groupId, refundabledata, groupdata]);

    useEffect(() => {
        setStudents([]);
        setTotalStudentCount(0);
        setShowTable(false);
        setStudentWise('');
        setCategoryId('');
        setStudentDropdownList([]);
    }, [selectionType]);

    useEffect(() => {
        resetField('headId');
        resetField('groupId');
        resetField('installmentId');
    }, [academicYearId, resetField]);

    useEffect(() => {
        if (selectionType !== 'G' || !academicYearId || !classId) {
            setStudentDropdownList([]);
            return;
        }

        let isMounted = true;

        setLoadingDropdown(true);

        const fetchStudents = async () => {
            try {
                const payload = {
                    asmay_Id: Number(academicYearId),
                    fillClasFlg: String(classId),
                    fillSecCls: sectionId ? String(sectionId) : '0',
                    filterInitialData: nameType === 'NameRegNo' ? 'NameRegNo' : 'RegNoName',
                    studentType: activeType
                };

                const res = await studentNameDropdown(payload);

                if (!isMounted) return;
                if (res?.data && Array.isArray(res.data)) {
                    const formatted = res.data.map((s: any) => ({
                        value: String(s.amst_Id || s.AMST_Id),
                        label: [s.amsT_FirstName, s.amsT_MiddleName, s.amsT_LastName].filter(Boolean).join(' ').trim()
                    }));

                    setStudentDropdownList(formatted);
                }
            } catch {
                if (isMounted) toast.error('Failed to load students');
            } finally {
                if (isMounted) setLoadingDropdown(false);
            }
        };

        fetchStudents();

        return () => {
            isMounted = false;
        };
    }, [selectionType, academicYearId, classId, sectionId, nameType, nameType, activeType]);

    const loadStudents = useCallback(async () => {
        if (!academicYearId || !headId) return toast.error('Please select Academic Year and Fee Head');
        if (selectionType === 'G' && !studentWise) return toast.error('Please select a student');
        if (selectionType === 'C' && !categoryId) return toast.error('Please select a category');
        if (selectionType !== 'C' && !classId) return toast.error('Please select a class');
        setLoadingStudents(true);

        try {
            const payload: any = {
                typeofrpt: selectionType === 'T' ? 'All' : selectionType === 'G' ? 'Individual' : 'Category',
                asmay_id: Number(academicYearId),
                fillclasflg: selectionType === 'C' ? '0' : String(classId || 0),
                fillseccls: selectionType === 'C' ? '0' : String(sectionId || 0),
                Amst_Id: selectionType === 'G' ? Number(studentWise) : 0,
                fmcC_Id: selectionType === 'C' ? Number(categoryId) : 0,
                studenttype: activeType,
                FMG_Id: groupId ? Number(groupId) : 0,
                FMH_Id: Number(headId),
                userid: 9,
                isPDA: isPDA ? 'Y' : 'N',

                // Always send valid FTI_Id — 0 if not selected

                TempArrayHeadList: [{ FTI_Id: installmentId ? Number(installmentId) : 0 }]
            };

            const res = await studentListDropdown(payload);

            if (res?.success && res.data?.saveheadlst?.length > 0) {
                const formatted: StudentRow[] = res.data.saveheadlst.map((s: any) => ({
                    amst_Id: Number(s.amst_Id || s.AMST_Id || 0),
                    fullName: [s.amsT_FirstName, s.amsT_MiddleName, s.amsT_LastName].filter(Boolean).join(' ').trim() || 'Unknown Student',
                    fmoB_Student_Due: Number(s.fmoB_Student_Due || 0),
                    fmoB_Institution_Due: Number(s.fmoB_Institution_Due || 0),
                    checked: false
                }));

                setStudents(formatted);
                setTotalStudentCount(res.data.saveheadlst.length);
                setShowTable(true);
                toast.success(`${formatted.length} student(s) loaded`);
            } else {
                setStudents([]);
                setTotalStudentCount(0);
                setShowTable(true);
                toast.info('No students found');
            }
        } catch {
            toast.error('Failed to load students');
            setStudents([]);
            setTotalStudentCount(0);
            setShowTable(false);
        } finally {
            setLoadingStudents(false);
        }
    }, [academicYearId, classId, sectionId, headId, groupId, installmentId, selectionType, studentWise, categoryId, activeType, isPDA]);

    const onSubmit = async () => {
        const selected = students.filter((s) => s.checked);
        if (selected.length === 0) return toast.error('Please select at least one student');
        setSaving(true);
        try {
            const payload = {
                Asmay_Id: Number(academicYearId),
                Fmg_Id: groupId ? Number(groupId) : 0,
                Fmh_Id: Number(headId),
                FillBusRouteStudents: activefee === 'Fee' ? 'fees' : '',
                filterrefund: refundableType,
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
        setSelectionType('T');
        setRefundableType('Refundable');
        setActiveType('Active');
        setActivefee('Fee');
        setNameType('NameRegNo');
        setStudentWise('');
        setCategoryId('');
        setStudents([]);
        setTotalStudentCount(0);
        setShowTable(false);
        setStudentDropdownList([]);
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
                {(['T', 'G', 'C'] as const).map((val) => (
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
                            {val === 'T' ? 'All Students' : val === 'G' ? 'Individual' : 'Category Wise'}
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

                    {selectionType === 'C' && (
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

                    {selectionType !== 'C' && (
                        <>
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

                            <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                <Label className='w-44 text-right'>
                                    Section <span className='text-red-500'>*</span>
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
                        </>
                    )}

                    {/* Refundable Type */}

                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                        <Label className='w-44 text-right'>
                            Type <span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex flex-wrap gap-6 rounded-lg border bg-white p-3'>
                            {(['Refundable', 'NonRefundable'] as const).map((val) => (
                                <label key={val} className='flex cursor-pointer items-center gap-3'>
                                    <input
                                        type='radio'
                                        name='refundable'
                                        value={val}
                                        checked={refundableType === val}
                                        onChange={(e) => setRefundableType(e.target.value as any)}
                                        className='h-5 w-5 text-blue-600'
                                    />

                                    <span className='font-medium text-sm'>{val}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Fee Head */}

                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                        <Label className='w-44 text-right'>
                            Fee Head <span className='text-red-500'>*</span>
                        </Label>
                        <div className='w-full sm:w-96'>
                            <Controller
                                name='headId'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(v) => {
                                            field.onChange(v ? Number(v) : undefined);

                                            resetField('groupId');

                                            resetField('installmentId');
                                        }}
                                        value={field.value?.toString()}
                                        disabled={loadingRefundable}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={loadingRefundable ? 'Loading fee heads...' : 'Select Fee Head'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingRefundable ? (
                                                <div className='px-4 py-8 text-center text-muted-foreground'>Loading...</div>
                                            ) : refundabledata?.data && refundabledata.data.length > 0 ? (
                                                refundabledata.data.map((item: any) => (
                                                    <SelectItem key={item.fmH_Id} value={String(item.fmH_Id)}>
                                                        {item.fmH_FeeName}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-4 py-8 text-center text-muted-foreground'>No fee heads found</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    {/* Fee Group */}

                    {showFeeGroup && (
                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                            <Label className='w-44 text-right'>
                                Fee Group <span className='text-red-500'>*</span>
                            </Label>
                            <div className='w-full sm:w-96'>
                                <Controller
                                    name='groupId'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                                            value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={loadingGroups ? 'Loading groups...' : 'Select Group'} />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {loadingGroups ? (
                                                    <div className='px-4 py-8 text-center text-muted-foreground'>Loading...</div>
                                                ) : groupdata?.data && groupdata.data.length > 0 ? (
                                                    groupdata.data.map((item: any) => (
                                                        <SelectItem key={item.fmG_Id} value={String(item.fmG_Id)}>
                                                            {item.fmG_GroupName}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className='px-4 py-8 text-center text-muted-foreground'>No groups found</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {/* Installment */}

                    {showFeeInstallment && (
                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                            <Label className='w-44 text-right'>
                                Installment <span className='text-red-500'>*</span>
                            </Label>
                            <div className='w-full sm:w-96'>
                                <Controller
                                    name='installmentId'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                                            value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={loadingInstallments ? 'Loading installments...' : 'Select Installment'}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingInstallments ? (
                                                    <div className='px-4 py-8 text-center text-muted-foreground'>Loading...</div>
                                                ) : installmentdata?.data && installmentdata.data.length > 0 ? (
                                                    installmentdata.data.map((item: any) => (
                                                        <SelectItem key={item.ftI_Id} value={String(item.ftI_Id)}>
                                                            {item.ftI_Name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className='px-4 py-8 text-center text-muted-foreground'>No installments found</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}

                <div className='space-y-5'>
                    {selectionType === 'G' && (
                        <>
                            <div className='flex flex-wrap justify-center gap-6 rounded-lg border bg-white p-3'>
                                {(['NameRegNo', 'RegNameNo'] as const).map((val) => (
                                    <label key={val} className='flex cursor-pointer items-center gap-3'>
                                        <input
                                            type='radio'
                                            name='nameReg'
                                            value={val}
                                            checked={nameType === val}
                                            onChange={(e) => setNameType(e.target.value as any)}
                                            className='h-5 w-5 text-blue-600'
                                        />
                                        <span className='font-medium text-sm'>{val === 'NameRegNo' ? 'Name:Reg.No' : 'Reg.No:Name'}</span>
                                    </label>
                                ))}
                            </div>

                            <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                <Label className='w-40'>
                                    Student Name <span className='text-red-500'>*</span>
                                </Label>
                                <div className='w-full sm:w-96'>
                                    <Select
                                        value={studentWise}
                                        onValueChange={setStudentWise}
                                        disabled={loadingDropdown || !academicYearId || !classId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={loadingDropdown ? 'Loading students...' : 'Select student'} />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {loadingDropdown ? (
                                                <div className='px-4 py-8 text-center text-muted-foreground'>Loading students...</div>
                                            ) : studentDropdownList.length > 0 ? (
                                                studentDropdownList.map((s) => (
                                                    <SelectItem key={s.value} value={s.value}>
                                                        {s.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-4 py-8 text-center text-muted-foreground'>No students found</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </>
                    )}

                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                        <Label className='w-40'>
                            Date <span className='text-red-500'>*</span>
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant='outline' className='w-full justify-start text-left font-normal sm:w-96'>
                                    <CalendarIcon className='mr-2 h-4 w-4' />

                                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className='w-auto p-0'>
                                <Calendar mode='single' selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className='flex flex-col gap-4 sm:flex-row'>
                        <div className='flex flex-wrap gap-6 rounded-lg border bg-white p-3'>
                            {(['Active', 'Left'] as const).map((val) => (
                                <label key={val} className='flex cursor-pointer items-center gap-3'>
                                    <input
                                        type='radio'
                                        name='active'
                                        value={val}
                                        checked={activeType === val}
                                        onChange={(e) => setActiveType(e.target.value as any)}
                                        className='h-5 w-5 text-blue-600'
                                    />
                                    <span className='font-medium text-sm'>{val}</span>
                                </label>
                            ))}
                        </div>

                        <div className='flex flex-wrap gap-6 rounded-lg border bg-white p-3'>
                            {(['Fee', 'PDA'] as const).map((val) => (
                                <label key={val} className='flex cursor-pointer items-center gap-3'>
                                    <input
                                        type='radio'
                                        name='fee'
                                        value={val}
                                        checked={activefee === val}
                                        onChange={(e) => setActivefee(e.target.value as any)}
                                        className='h-5 w-5 text-blue-600'
                                    />
                                    <span className='font-medium text-sm'>{val}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className='my-8 flex justify-center'>
                <Button
                    size='lg'
                    onClick={loadStudents}
                    disabled={
                        loadingStudents ||
                        !academicYearId ||
                        !headId ||
                        !groupId ||
                        !sectionId ||
                        !classId ||
                        (selectionType === 'G' && !studentWise) ||
                        (selectionType === 'C' && !categoryId) ||
                        (selectionType !== 'C' && !classId)
                    }
                    isLoading={loadingStudents}
                    className='w-full max-w-md transition-all duration-200 hover:scale-105 sm:w-auto'>
                    <Eye className='mr-2 h-5 w-5' />
                    Show
                </Button>
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
                            isLoading={loadingStudents}
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
    );
}
