'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { InputText } from '@/components/ui/extension/input-text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
import { cn } from '@/lib/utils';
import { feeOpeningBalanceSchema } from '@/schemas/fees/trasactions';
import { addOrUpdateFeeOpeningBalance, studentListDropdown, studentNameDropdown } from '@/server/fees/trasactions/fee_opening_balance';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, CheckSquare, Save, Square } from 'lucide-react';
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
    Selected?: boolean;
    Selected1?: boolean;
    fmH_FeeName?: string;
    ftI_Name?: string;
    Amountall?: number;
    FR_RefundAmount?: number;
    balamt?: number;
}

interface FeeDetail {
    slno: number;
    date: string;
    receiptNo: string;
    totalPaidAmount: number;
}
export default function AddFeeRefundableForm({
    onSuccess,
    className = ''
}: {
    onSuccess?: () => void;
    className?: string;
}) {
    const { refetchAll } = useMasterFeeOpeningBalance();

    const { control, reset, setValue, watch, register } = useForm<FormFields>({
        resolver: zodResolver(feeOpeningBalanceSchema.addOrUpdate),
        defaultValues: {
            academicYearId: undefined,
            classId: undefined,
            sectionId: undefined,
            headId: undefined,
            groupId: undefined,
            installmentId: undefined
        }
    });
    const [selectedGroupItems, setSelectedGroupItems] = useState<{ fmG_Id: string }[]>([]);
    const [groupSearch, setgroupSearch] = useState('');
    const academicYearId = useWatch({ control, name: 'academicYearId' });
    const classId = useWatch({ control, name: 'classId' });
    const sectionId = useWatch({ control, name: 'sectionId' });
    const headId = useWatch({ control, name: 'headId' });
    const groupId = useWatch({ control, name: 'groupId' });
    const installmentId = useWatch({ control, name: 'installmentId' });

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectionType, setSelectionType] = useState<'T' | 'G' | 'C'>('T');
    const [refundableType, setRefundableType] = useState<'Refunable' | 'NonRefunable'>('Refunable');
    const [activeType, setActiveType] = useState<'Active' | 'Left'>('Active');
    const [activefee, setActivefee] = useState<'Fee' | 'PDA'>('Fee');
    const [nameType, setNameType] = useState<'NameRegNo' | 'RegNameNo'>('NameRegNo');
    const [studentWise, setStudentWise] = useState<string>('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [showTable, setShowTable] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [studentDropdownList, setStudentDropdownList] = useState<{ value: string; label: string }[]>([]);
    const [loadingDropdown, setLoadingDropdown] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [formKey, setFormKey] = useState(0);

    const [selectedAll, setSelectedAll] = useState(false);
    const [paymentMode, setPaymentMode] = useState<'C' | 'B' | 'O' | ''>('');
    const [narration, setNarration] = useState('');
    const [search, setSearch] = useState('');

    const isPDA = activefee === 'PDA';

    // Data Hooks
    const { data: academicYearData, isLoading: loadingAcademicYear } = useopeningacademicyerdropdowndatafee();
    const { data: classData, isLoading: loadingClasses } = useopeningClassdropdowndatafee();
    const { data: sectionData, isLoading: loadingSections } = useopeningSectiondropdowndatafee(
        academicYearId ? Number(academicYearId) : 0,
        classId ? Number(classId) : 0
    );
    const { data: refundableData, isLoading: loadingRefundable } = useFeeOpeningRefundable(
        academicYearId ? Number(academicYearId) : 0,
        refundableType
    );
    const { data: categoryData, isLoading: loadingCategories } = useopeningCategorydropdowndatafee();
    const { data: groupData, isLoading: loadingGroups } = useopeningGroupdropdowndatafee(headId ? Number(headId) : 0);
    const { data: installmentData, isLoading: loadingInstallments } = useopeningInstallmentdropdowndatafee(
        academicYearId ? Number(academicYearId) : 0,
        groupId ? Number(groupId) : 0,
        headId ? Number(headId) : 0
    );

    const toggleAll = () => {
        const newVal = !selectedAll;
        setSelectedAll(newVal);
        setStudents(
            students.map((s) => ({
                ...s,
                Selected: newVal
            }))
        );
    };

    const updateRefund = (row: any, val: number) => {
        let refund = Number(val ?? 0);
        if (refund > row.Amountall) refund = row.Amountall;
        const updated = students.map((s) =>
            s === row
                ? {
                      ...s,
                      FR_RefundAmount: refund,
                      balamt: row.Amountall - refund
                  }
                : s
        );
        setStudents(updated);
    };

    // Add modal control and data states
    const [feeDetails, setFeeDetails] = useState<FeeDetail[] | null>(null);
    const [showFeeDetailsModal, setShowFeeDetailsModal] = useState(false);

    // Simulate fetching fee details (replace with your real data fetch)
    const fetchFeeDetails = async () => {
        // Here call your API or get data from the state based on selected student etc.
        // For example:
        const data: FeeDetail[] = [{ slno: 1, date: '22-05-2025', receiptNo: 'SF/952/25-26', totalPaidAmount: 82690 }];
        setFeeDetails(data);
        setShowFeeDetailsModal(true);
    };

    const [showChargesModal, setShowChargesModal] = useState(false);
    const [instantRefundChecked, setInstantRefundChecked] = useState(false);

    // CRITICAL FIX: Clear dependent fields when refundableType or headId changes
    useEffect(() => {
        setValue('headId', undefined);
        setValue('groupId', undefined);
        setValue('installmentId', undefined);
    }, [refundableType, academicYearId, setValue]);

    useEffect(() => {
        setValue('groupId', undefined);
        setValue('installmentId', undefined);
    }, [headId, setValue]);

    // Convert Heads API to { label, id }
    const groupOptions =
        groupData?.data?.map((h) => ({
            id: h.fmG_Id.toString(),
            label: h.fmG_GroupName
        })) ?? [];

    // Define form value for fmH_Ids
    //const fmG_Ids = watch('groups') || [];

    const fmG_Ids = (watch('groups') as string[] | undefined) || [];

    const selectAllGroup = () => {
        const all = groupOptions.map((h) => h.id);

        if (fmG_Ids.length === all.length) {
            // Option: clear selection → field becomes undefined
            setValue('groups', undefined as any);
            setSelectedGroupItems([]);
        } else {
            setValue('groups', all as [string, ...string[]], {
                shouldValidate: true
            });
            setSelectedGroupItems(all.map((x) => ({ fmG_Id: x })));
        }
    };

    const toggleGroup = (id: string) => {
        let updated = [];

        if (fmG_Ids.includes(id)) {
            updated = fmG_Ids.filter((v: string) => v !== id);
        } else {
            updated = [...fmG_Ids, id];
        }

        // MUST be tuple: at least 1 element
        if (updated.length === 0) {
            setValue('groups', undefined as any);
        } else {
            setValue('groups', updated as [string, ...string[]], {
                shouldValidate: true
            });
        }

        setSelectedGroupItems(updated.map((x) => ({ fmG_Id: x })));
    };

    const filteredGroups = groupData?.data?.filter((h) => h.fmG_GroupName.toLowerCase().includes(searchValue.toLowerCase())) ?? [];

    // FULL RESET FUNCTION
    const resetAllFormState = useCallback(() => {
        reset({
            academicYearId: undefined,
            classId: undefined,
            sectionId: undefined,
            headId: undefined,
            groupId: undefined,
            installmentId: undefined
        });
        setSelectedDate(new Date());
        setRefundableType('Refunable');
        setActiveType('Active');
        setActivefee('Fee');
        setNameType('NameRegNo');
        setStudentWise('');
        setCategoryId('');
        setStudents([]);
        setShowTable(false);
        setStudentDropdownList([]);
        setSearchValue('');
        setFormKey((prev) => prev + 1);
    }, [reset]);

    useEffect(() => {
        resetAllFormState();
    }, [selectionType, resetAllFormState]);

    // Load individual student dropdown
    useEffect(() => {
        if (selectionType !== 'G' || !academicYearId || !classId) {
            setStudentDropdownList([]);
            setStudentWise('');
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
                toast.error('Failed to load students');
            } finally {
                if (isMounted) setLoadingDropdown(false);
            }
        };

        fetchStudents();
        return () => {
            isMounted = false;
        };
    }, [selectionType, academicYearId, classId, sectionId, nameType, activeType]);

    const showFeeGroup = useMemo(() => {
        if (!headId || !refundableData?.data) return false;
        const head = refundableData.data.find((h: any) => h.fmH_Id === Number(headId));
        return head?.fmH_FeeName !== 'Other Allowances';
    }, [headId, refundableData]);

    const showFeeInstallment = useMemo(() => {
        if (!headId || !groupId || !refundableData?.data || !groupData?.data) return false;
        const head = refundableData.data.find((h: any) => h.fmH_Id === Number(headId))?.fmH_FeeName;
        const group = groupData.data.find((g: any) => g.fmG_Id === Number(groupId))?.fmG_GroupName;
        return head === 'TRANSPORT FEE' && group && ['TRANSPORT FEE', 'TRANSPORT OTHER FEE', 'TRANSPORT UKG AND LKG FEE'].includes(group);
    }, [headId, groupId, refundableData, groupData]);

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
                setShowTable(true);
                toast.success(`${formatted.length} student(s) loaded`);
            } else {
                setStudents([]);
                setShowTable(true);
                toast.info('No students found');
            }
        } catch {
            toast.error('Failed to load students');
            setStudents([]);
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
                resetAllFormState();
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

    return (
        <div className={`space-y-6 ${className}`} key={formKey}>
            {/* Main Form Grid */}
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
                                            <SelectValue placeholder={loadingAcademicYear ? 'Loading...' : 'Select Academic Year'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYearData?.data?.map((item: any) => (
                                                <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    {/* Category (only in Category mode) */}
                    {selectionType === 'C' && (
                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                            <Label className='w-44 text-right'>
                                Category <span className='text-red-500'>*</span>
                            </Label>
                            <div className='w-full sm:w-96'>
                                <Select value={categoryId} onValueChange={setCategoryId} disabled={loadingCategories}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingCategories ? 'Loading...' : 'Select Category'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryData?.data?.map((item: any) => (
                                            <SelectItem key={item.fmcC_Id} value={String(item.fmcC_Id)}>
                                                {item.fmcC_ClassCategoryName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Class & Section (non-category mode) */}
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
                                                    <SelectValue placeholder={loadingClasses ? 'Loading...' : 'Select Class'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classData?.data?.map((item: any) => (
                                                        <SelectItem key={item.asmcL_Id} value={String(item.asmcL_Id)}>
                                                            {item.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
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
                                                    <SelectValue placeholder={loadingSections ? 'Loading ...' : 'Select Section'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sectionData?.data?.map((item: any) => (
                                                        <SelectItem key={item.asmS_Id} value={String(item.asmS_Id)}>
                                                            {item.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Refundable / Non-Refundable - FIXED */}

                    {/* Fee Head - FIXED with key */}
                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                        <Label className='w-44 text-right'>
                            Student Name <span className='text-red-500'>*</span>
                        </Label>
                        <div className='w-full sm:w-96'>
                            <Controller
                                name='headId'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        key={`feehead-${refundableType}-${academicYearId}`} // Forces fresh load
                                        onValueChange={(v) => {
                                            field.onChange(v ? Number(v) : undefined);
                                            setValue('groupId', undefined);
                                            setValue('installmentId', undefined);
                                        }}
                                        value={field.value?.toString()}
                                        disabled={loadingRefundable || !academicYearId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={loadingRefundable ? 'Loading...' : 'Select Fee Head'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {refundableData?.data?.map((item: any) => (
                                                <SelectItem key={item.fmH_Id} value={String(item.fmH_Id)}>
                                                    {item.fmH_FeeName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>
                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                        <Button onClick={fetchFeeDetails} className='w-96'>
                            View Fee Details
                        </Button>
                    </div>

                    {showFeeDetailsModal && feeDetails && (
                        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
                            <div className='w-[40rem] rounded-lg bg-white p-6 shadow-lg'>
                                <h2 className='mb-4 font-semibold text-lg'>Fee Details</h2>
                                <table className='w-full border-collapse border border-gray-300 text-sm'>
                                    <thead>
                                        <tr>
                                            <th className='border border-gray-300 px-2 py-1'>SLNO</th>
                                            <th className='border border-gray-300 px-2 py-1'>Date</th>
                                            <th className='border border-gray-300 px-2 py-1'>Receipt No</th>
                                            <th className='border border-gray-300 px-2 py-1'>Total Paid Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feeDetails.map((item) => (
                                            <tr key={item.slno}>
                                                <td className='border border-gray-300 px-2 py-1 text-center'>{item.slno}</td>
                                                <td className='border border-gray-300 px-2 py-1 text-center'>{item.date}</td>
                                                <td className='border border-gray-300 px-2 py-1 text-center'>{item.receiptNo}</td>
                                                <td className='border border-gray-300 px-2 py-1 text-right'>{item.totalPaidAmount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className='mt-4 text-right'>
                                    <Button variant='outline' onClick={() => setShowFeeDetailsModal(false)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className='flex flex-wrap items-center gap-4 rounded border p-3'>
                        {/* Checkbox + Label */}
                        <label className='flex items-center space-x-2'>
                            <input
                                type='checkbox'
                                checked={instantRefundChecked}
                                onChange={() => setInstantRefundChecked(!instantRefundChecked)}
                                className='h-5 w-5'
                            />
                            <span className='font-medium text-gray-700'>Instant Refund</span>
                        </label>

                        {/* Info Text */}
                        <span className='whitespace-nowrap text-gray-600'>For Instant refund Extra charges are applicable</span>

                        {/* View Charges Button */}
                        <Button onClick={() => setShowChargesModal(true)}>View Charges</Button>
                    </div>

                    {/* Modal */}
                    {showChargesModal && (
                        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
                            <div className='max-h-[80vh] w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-lg'>
                                <div className='flex items-center justify-between rounded-t-lg bg-blue-600 px-6 py-3'>
                                    <h4 className='font-semibold text-lg text-white'>PAYMENT GATE WAY REFUND CHARGES</h4>
                                    <Button variant='outline' onClick={() => setShowChargesModal(false)}>
                                        Close
                                    </Button>
                                </div>

                                <div className='p-6 text-gray-800'>
                                    <h4 className='mb-4 ml-14 font-semibold text-xl'>Online Payment Refund Charges as Follows</h4>

                                    <h3 className='mb-3 font-semibold'>1) RazorPay</h3>

                                    <p className='mb-4 pl-4 font-bold'>For less than 1000 Rs Refund charges is Rs 3.</p>
                                    <p className='mb-4 pl-4 font-bold'>For less than 1000 - 25000 Rs Refund charges is Rs 5.</p>
                                    <p className='mb-4 pl-4 font-bold'>For greater than 25000 Rs Refund charges is Rs 8.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - UNCHANGED */}
                <div className='space-y-5'>
                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                        <Label className='w-40'>
                            Type <span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex flex-wrap gap-6 rounded-lg border bg-white p-3'>
                            {(['Refunable', 'NonRefunable'] as const).map((val) => {
                                const displayLabel = val === 'Refunable' ? 'Refundable' : 'Non-Refundable';
                                return (
                                    <label key={val} className='flex cursor-pointer items-center gap-3'>
                                        <input
                                            type='radio'
                                            name='refundableType'
                                            value={val}
                                            checked={refundableType === val}
                                            onChange={(e) => {
                                                const newType = e.target.value as 'Refunable' | 'NonRefunable';
                                                setRefundableType(newType);

                                                // Clear fee-related fields
                                                setValue('headId', undefined);
                                                setValue('groupId', undefined);
                                                setValue('installmentId', undefined);
                                            }}
                                            className='h-5 w-5 text-blue-600'
                                        />
                                        <span className='font-medium text-sm'>{displayLabel}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className='group flex items-start gap-3'>
                        {/* Label */}
                        <Label aria-label='groups' htmlFor='fmH_Id' className='mt-2 whitespace-nowrap font-medium'>
                            Fee Group <span className='ml-1 text-red-500'>*</span>
                        </Label>

                        {/* Selection & Search */}
                        <div className='flex-1 rounded-md border border-gray-300 bg-white p-3'>
                            <InputText
                                placeholder='Search Fee Group...'
                                value={groupSearch}
                                onChange={(e) => setgroupSearch(e.target.value)}
                                className='mb-3'
                            />

                            {/* Select All Users */}
                            {groupData?.data && (
                                <div
                                    onClick={selectAllGroup}
                                    className={cn(
                                        'mb-2 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 font-medium text-sm transition-all',
                                        fmG_Ids.length === groupOptions.length && groupOptions.length
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-gray-300 hover:border-primary/40'
                                    )}>
                                    {fmG_Ids.length === groupOptions.length && groupOptions.length ? (
                                        <CheckSquare className='h-4 w-4 text-primary' />
                                    ) : (
                                        <Square className='h-4 w-4 text-gray-400' />
                                    )}
                                    <span>Select All</span>
                                </div>
                            )}

                            <div className='max-h-40 overflow-y-auto rounded-md border border-gray-300 p-1'>
                                {loadingGroups ? (
                                    <div className='py-4 text-center text-gray-500 text-sm'>Loading Groups...</div>
                                ) : groupData?.data?.length === 0 ? (
                                    <div className='py-4 text-center text-gray-500 text-sm'>No groups found</div>
                                ) : (
                                    filteredGroups.map((u) => {
                                        const id = u.fmG_Id.toString();
                                        const selected = fmG_Ids.includes(id);

                                        return (
                                            <div
                                                key={u.fmG_Id}
                                                onClick={() => toggleGroup(id)}
                                                className={cn(
                                                    'mb-1 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-all',
                                                    selected
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-gray-300 hover:border-primary/40'
                                                )}>
                                                {selected ? (
                                                    <CheckSquare className='h-4 w-4 text-primary' />
                                                ) : (
                                                    <Square className='h-4 w-4 text-gray-400' />
                                                )}
                                                <span>{u.fmG_GroupName}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                        <Label className='w-40'>
                            Voucher No <span className='text-red-500'>*</span>
                        </Label>
                        <InputText
                            {...register('chequeNo')}
                            // error={errors.chequeNo?.message}
                        />
                        {/* <InputText
                                                        {...register('chequeNo', {
                                                            onChange: (e) => {
                                                                const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
                                                                e.target.value = onlyNumbers; // force update input
                                                            }
                                                        })}
                                                        placeholder='Enter Card Number'
                                                        error={errors.chequeNo?.message}
                                                    /> */}
                    </div>

                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                        <Label className='w-40'>
                            Refund Date <span className='text-red-500'>*</span>
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
                </div>
            </div>
            <div className='mt-6 space-y-5 rounded border bg-white p-5 shadow'>
                {/* HEADER */}
                <div className='flex items-center justify-between border-b pb-3'>
                    <h3 className='font-semibold text-xl'>Fee Head List</h3>

                    {/* Search */}
                    <div className='w-64'>
                        <Input placeholder='Search here...' value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>

                {/* TABLE */}
                <div className='overflow-auto'>
                    <table className='w-full border text-sm'>
                        <thead>
                            <tr className='bg-gray-100 text-center'>
                                <th className='border p-2'>SLNO</th>

                                <th className='border p-2'>
                                    <input type='checkbox' className='h-4 w-4' checked={selectedAll} onChange={toggleAll} />
                                </th>

                                <th className='border p-2'>Fee Head</th>
                                <th className='border p-2'>Installment</th>
                                <th className='border p-2'>Excess Amount</th>
                                <th className='border p-2'>Refund Amount</th>
                                <th className='border p-2'>Balance Amount</th>
                                <th className='border p-2'>Refund Over</th>
                            </tr>
                        </thead>

                        <tbody>
                            {students
                                .filter((x) => JSON.stringify(x).toLowerCase().includes(search.toLowerCase()))
                                .map((row, i) => (
                                    <tr key={i} className='text-center odd:bg-gray-50'>
                                        <td className='border p-2'>{i + 1}</td>

                                        <td className='border p-2'>
                                            <input
                                                type='checkbox'
                                                className='h-4 w-4'
                                                checked={row.Selected}
                                                onChange={(e) => {
                                                    row.Selected = e.target.checked;
                                                    setStudents([...students]);
                                                }}
                                            />
                                        </td>

                                        <td className='border p-2'>{row.fmH_FeeName}</td>

                                        <td className='border p-2'>{row.ftI_Name}</td>

                                        <td className='border p-2'>{row.Amountall}</td>

                                        <td className='w-40 border p-2'>
                                            <Input
                                                type='number'
                                                min={0}
                                                max={row.Amountall}
                                                value={row.FR_RefundAmount || ''}
                                                onChange={(e) => updateRefund(row, Number(e.target.value))}
                                            />
                                            {(row.FR_RefundAmount ?? 0) > (row.Amountall ?? 0) && (
                                                <p className='text-red-600 text-xs'>Refund cannot exceed Excess</p>
                                            )}
                                        </td>

                                        <td className='border p-2'>{row.balamt ?? 0}</td>

                                        <td className='border p-2'>
                                            <input
                                                type='checkbox'
                                                className='h-4 w-4'
                                                checked={row.Selected1}
                                                onChange={(e) => {
                                                    row.Selected1 = e.target.checked;
                                                    setStudents([...students]);
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* NARRATION */}
                <div className='mt-6 flex justify-center'>
                    <div className='flex w-full max-w-xl items-start gap-4'>
                        {/* Label on the left */}
                        <Label className='mt-1 whitespace-nowrap font-medium'>Narration:</Label>

                        {/* Expandable Textarea */}
                        <Textarea
                            className='min-h-[50px] w-full resize rounded border p-3'
                            value={narration}
                            onChange={(e) => setNarration(e.target.value)}
                            placeholder='Enter your narration here...'
                        />
                    </div>
                </div>

                {/* PAYMENT MODE */}
                <div className='mt-6 flex justify-center'>
                    <div className='w-full max-w-xl rounded border bg-gray-50 p-6 text-center'>
                        {/* Radio Buttons */}
                        <div className='mb-4 flex justify-center gap-10'>
                            <Label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    value='C'
                                    checked={paymentMode === 'C'}
                                    onChange={() => setPaymentMode('C')}
                                    className='h-4 w-4'
                                />
                                Cash
                            </Label>

                            <Label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    value='B'
                                    checked={paymentMode === 'B'}
                                    onChange={() => setPaymentMode('B')}
                                    className='h-4 w-4'
                                />
                                Bank
                            </Label>

                            <Label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    value='O'
                                    checked={paymentMode === 'O'}
                                    onChange={() => setPaymentMode('O')}
                                    className='h-4 w-4'
                                />
                                Online
                            </Label>
                        </div>

                        {/* BANK FIELDS */}
                        {paymentMode === 'B' && (
                            <div className='mt-5 space-y-4'>
                                {/* Bank Name Row */}
                                <div className='flex items-center gap-4'>
                                    <Label className='w-40 text-right font-medium'>Bank Name:</Label>
                                    <Input className='flex-1' placeholder='Enter bank name' />
                                </div>

                                {/* Cheque Number Row */}
                                <div className='flex items-center gap-4'>
                                    <Label className='w-40 text-right font-medium'>Cheque/DD No:</Label>
                                    <Input className='flex-1' placeholder='Enter cheque number' />
                                </div>

                                {/* Cheque Date Row */}
                                <div className='flex items-center gap-4'>
                                    <Label className='w-40 text-right font-medium'>Cheque/DD Date:</Label>
                                    <Input className='flex-1' type='date' />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className='flex flex-col-reverse gap-4 border-t pt-6 sm:flex-row sm:justify-start'>
                <Button
                    type='button'
                    variant='outline'
                    size='lg'
                    onClick={resetAllFormState}
                    className='w-full transition-all duration-200 hover:scale-105 sm:w-auto'>
                    Reset
                </Button>
                <Button
                    type='button'
                    size='lg'
                    onClick={onSubmit}
                    isLoading={saving}
                    className='w-full transition-all duration-200 hover:scale-105 sm:w-auto'>
                    <Save className='mr-2 h-5 w-5' />
                    Save
                </Button>
            </div>
        </div>
    );
}
