'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError, Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

import { Calendar } from '@/components/ui/calendar';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, RotateCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { InputText } from '@/components/ui/extension/input-text';
import { useStudentClassDropDown, useStudentSectionDropDown } from '@/hooks/fees/useMasters';
import { useopeningacademicyerdropdowndatafee } from '@/hooks/fees/useTrasactions';
import { feesStudentTransactionSchema } from '@/schemas/fees/trasactions';
import { getFeeHead, getStudentDetails, searchStudentName } from '@/server/fees/trasactions/fee_student_transaction';
import type { IFeeTDetails, IStudentSearchList, IStudentTDetails, IStudentTermList } from '@/types/fees/transactions/transactions';
import type { z } from 'zod';
import FeeDetails from './fee-head-column';

type FormFields = z.infer<typeof feesStudentTransactionSchema.addOrUpdate>;

interface FeestudentTrasactionsFormProps {
    onSuccess?: () => void;
}

const payDetails = [
    {
        fmB_Id: 1,
        bank: 'Cash'
    },
    {
        fmB_Id: 2,
        bank: 'Bank'
    },
    {
        fmB_Id: 3,
        bank: 'RTGS/NEFT'
    },
    {
        fmB_Id: 4,
        bank: 'Swipe/Card'
    },
    {
        fmB_Id: 5,
        bank: 'UPI'
    }
];

export default function StudentFeeTransaction({ onSuccess }: FeestudentTrasactionsFormProps) {
    const {
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feesStudentTransactionSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            asmaY_Id: undefined
        }
    });

    const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(null);
    const [selectedclassId, setSelectedClassId] = useState<number | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
    const [studentSearch, setStudentSearch] = useState('');
    const [students, setStudents] = useState<IStudentSearchList[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<IStudentSearchList | null>(null);
    const [selectedTerm, setselectedTerm] = useState<string[]>([]);
    const [terms, setTerms] = useState<IStudentTermList[]>([]);
    const [loadingTerm, setLoadingTerm] = useState(false);
    const [studentDetails, SetStudentDetails] = useState<IStudentTDetails[]>([]);
    const [feeDetails, SetFeeDetails] = useState<IFeeTDetails[]>([]);
    const [feeHeads, setFeeHeads] = useState<IFeeTDetails[]>([]);
    const [loadingFeeHead, setLoadingFeeHead] = useState(false);
    const [selectedHeads, setSelectedHeads] = useState<Record<number, boolean>>({});
    const [currentCharges, setCurrentCharges] = useState<{
        [key: number]: string;
    }>({});
    const [toatlAdjusted, setToatlAdjusted] = useState<{
        [key: number]: string;
    }>({});
    const [totalCharges, setTotalCharges] = useState<{
        [key: number]: string;
    }>({});
    const [concession, setConcession] = useState<{
        [key: number]: string;
    }>({});
    const [openingBalance, setOpeningBalance] = useState<{
        [key: number]: string;
    }>({});
    const [payableAmount, setPayableAmount] = useState<{
        [key: number]: string;
    }>({});
    const [netAmount, setNetAmount] = useState<{
        [key: number]: string;
    }>({});
    const [rebateAmount, setRebateAmount] = useState<{
        [key: number]: string;
    }>({});
    const [bankDetails, setBankDetails] = useState<any[]>([]);
    const [chequeNo, setChequeNo] = useState<{
        [key: number]: string;
    }>({});
    const [chequedates, setchepueDates] = useState<Record<number, Date | null>>({});
    const [amount, setAmount] = useState<{
        [key: number]: string;
    }>({});
    const [filterType, setFilterType] = useState('regular');
    const [payType, setPayType] = useState<string>('Bank');
    const [modeType, setModeType] = useState<string>('Single');
    const [checkPayType, setCheckPayType] = useState<string[]>(['Bank']);
    const [selectedBanks, setSelectedBanks] = useState<Record<number, string>>({});

    const [left, setLeft] = useState(false);
    const [deactive, setDeative] = useState(false);
    const [classs, setClass] = useState(false);
    const [section, setSection] = useState(false);
    const [amountCheck, setAmountCheck] = useState(false);

    const [selectAll, setSelectAll] = useState(false);
    const [sms, setSms] = useState(false);
    const [email, setEmail] = useState(false);
    const [openFeeDetails, setOpenFeeDetails] = useState(false);
    const [challenSearch, setChallenSearch] = useState('');
    const [todaysDate, setTodaysDate] = useState<Date | undefined>(new Date());

    const filterOptions = [
        { value: 'regular', label: 'Regular' },
        { value: 'Chal_no', label: 'Challan No.' },
        { value: 'regno', label: 'Reg No' },
        { value: 'admno', label: 'Adm No' },
        { value: 'nameadmno', label: 'Name:Adm.No.' },
        { value: 'nameregno', label: 'Name:Reg.No.' },
        { value: 'father', label: 'Father Name' },
        { value: 'mother', label: 'Mother Name' },
        { value: 'mobile', label: 'Mobile No' }
    ];

    const selectedLabel = filterOptions.find((opt) => opt.value === filterType)?.label || '';

    const { data: academicYearData, isLoading: loadingYears } = useopeningacademicyerdropdowndatafee();

    useEffect(() => {
        setStudentSearch('');
        setTerms([]);
        SetStudentDetails([]);
        SetFeeDetails([]);
        // setFeeHeads([]);
        setBankDetails(payDetails);
    }, [selectedAsmayId, selectedclassId, selectedSectionId]);

    useEffect(() => {
        if (!amountCheck) setselectedTerm([]);
    }, [amountCheck]);

    const { data: feeclassData, isLoading: feeclassDataLoading } = useStudentClassDropDown(classs);

    const { data: feeSectionData, isLoading: feeSectionDataLoading } = useStudentSectionDropDown(section);

    useEffect(() => {
        if (!studentSearch.trim()) {
            setStudents([]);
            return;
        }

        const fetchStudents = async () => {
            setLoadingStudents(true);
            try {
                const payload = {
                    asmaY_Id: selectedAsmayId,
                    filterinitialdata: filterType,
                    searchfilter: studentSearch,
                    asmcL_ID: selectedclassId ?? 0,
                    asmS_Id: selectedSectionId ?? 0,
                    amsT_SOL: 'string'
                };
                const studentsArray = await searchStudentName(payload);
                const studentsData = JSON.parse(JSON.stringify(studentsArray.feeStudentSearch || []));
                setStudents(studentsData || []);
            } catch (error) {
                console.error('Failed to fetch students:', error);
                setStudents([]);
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchStudents();
    }, [studentSearch]);

    useEffect(() => {
        if (!selectedStudent) {
            setTerms([]);
            SetStudentDetails([]);
            SetFeeDetails([]);
            return;
        }
        const fetchStudentsDetails = async () => {
            setLoadingTerm(true);
            try {
                const payload = {
                    amst_Id: selectedStudent.amst_Id,
                    filterinitialdata: filterType,
                    configset: 'T',
                    autoReceiptFlag: true,
                    asmaY_Id: selectedAsmayId
                };
                const termArray = await getStudentDetails(payload);
                const termList = JSON.parse(JSON.stringify(termArray.masterGroupDetails || []));
                const studentDetails = JSON.parse(JSON.stringify(termArray.fillstudents || []));
                const feeDetails = JSON.parse(JSON.stringify(termArray.showstaticticsdetails || []));
                setTerms(termList || []);
                SetStudentDetails(studentDetails || []);
                SetFeeDetails(feeDetails || []);
            } catch (error) {
                console.error('Failed to fetch students:', error);
                setTerms([]);
            } finally {
                setLoadingTerm(false);
            }
        };
        fetchStudentsDetails();
    }, [selectedStudent]);

    useEffect(() => {
        if (!selectedTerm || selectedTerm.length === 0) {
            setFeeHeads([]);
            return;
        }

        const fetchFeeHeadDetails = async () => {
            setLoadingFeeHead(true);

            try {
                const payload = {
                    amst_Id: selectedStudent?.amst_Id,
                    filterinitialdata: filterType,
                    configset: 'T',
                    autoReceiptFlag: true,
                    asmaY_Id: selectedAsmayId
                };

                const termArray = await getFeeHead(payload);

                const feeDetails = JSON.parse(JSON.stringify(termArray.showstaticticsdetails || []));

                setFeeHeads(feeDetails || []);
            } catch (error) {
                console.error('Failed to fetch students:', error);
                setFeeHeads([]);
            } finally {
                setLoadingFeeHead(false);
            }
        };

        fetchFeeHeadDetails();
    }, [selectedTerm]);

    const toggleRow = (id: number, checked: boolean) => {
        setSelectedHeads((prev) => {
            const updated = { ...prev, [id]: checked };
            if (!checked) {
                setSelectAll(false);
            } else {
                const allChecked = feeHeads.every((item) => updated[item.fmG_Id]);
                setSelectAll(allChecked);
            }

            return updated;
        });
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        const newState: Record<number, boolean> = {};
        feeHeads.forEach((f) => {
            newState[f.fmG_Id] = checked;
        });

        setSelectedHeads(newState);
    };

    const handleTermChange = (newSelectedValues: string[]) => {
        const isSelectAll = newSelectedValues.length === terms.length || newSelectedValues.length === 0;

        if (isSelectAll) {
            applySelection(newSelectedValues);
            return;
        }

        const newlySelected = newSelectedValues.map(Number);
        const previouslySelected = selectedTerm.map(Number);

        const orderedTerms = terms;

        const clickedId =
            newlySelected.find((id) => !previouslySelected.includes(id)) ?? previouslySelected.find((id) => !newlySelected.includes(id));

        if (clickedId == null) {
            applySelection(newSelectedValues);
            return;
        }

        const clickedIndex = orderedTerms.findIndex((t) => t.fmT_Id === clickedId);

        const isChecking = newlySelected.includes(clickedId);
        const isUnchecking = !isChecking;

        if (isChecking) {
            for (let i = 0; i < clickedIndex; i++) {
                const above = orderedTerms[i];

                const isEnabled = above.disablepaisterms === false || above.disablepaisterms === undefined;

                if (!isEnabled) continue;

                const isAboveSelected = newlySelected.includes(above.fmT_Id);

                if (!isAboveSelected) {
                    toast.warning('You have to select Terms in Order');
                    return;
                }
            }
        }

        if (isUnchecking) {
            for (let i = clickedIndex + 1; i < orderedTerms.length; i++) {
                const below = orderedTerms[i];

                const isBelowSelected = previouslySelected.includes(below.fmT_Id);

                if (isBelowSelected) {
                    toast.warning('You cannot unselect,because you have selected next Term');
                    return;
                }
            }
        }

        applySelection(newSelectedValues);
    };

    const applySelection = (selectedValues: string[]) => {
        setselectedTerm(selectedValues);

        const updated = terms.map((ex) => ({
            ...ex,
            checked: selectedValues.includes(ex.fmT_Id.toString())
        }));
        setTerms(updated);
    };

    const handleCheckboxChange = (checked: boolean, type: 'left' | 'deactive' | 'class' | 'section') => {
        if (type === 'left') {
            setLeft(checked);
        } else if (type === 'deactive') {
            setDeative(checked);
        } else if (type === 'class') {
            setClass(checked);
            if (!checked) {
                setSection(false);
            }
        } else if (type === 'section') {
            setSection(checked);
            if (checked) {
                setClass(true);
            } else {
                setClass(false);
            }
        }
    };

    const onSubmit = async () => {
        toast.success('Fee Transaction Saved Successfully!');
        onSuccess?.();
    };

    const handleReset = () => {
        reset();
        setSelectedAsmayId(0);
        setStudentSearch('');
        setStudents([]);
        setTerms([]);
        setselectedTerm([]);
        setLeft(false);
        setClass(false);
        setSection(false);
        setDeative(false);
        setFilterType('regular');
    };

    return (
        <div className='mx-auto max-w-7xl p-2'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 '>
                <div className='flex gap-8'>
                    <div className='max-h-[400px] overflow-auto rounded border bg-gray-50 p-3 shadow-inner' style={{ width: '30%' }}>
                        <RadioGroup value={filterType} onValueChange={setFilterType}>
                            <div className='grid grid-cols-2 gap-3'>
                                {filterOptions.map((item) => (
                                    <div key={item.value} className='flex items-center space-x-2'>
                                        <RadioGroupItem value={item.value} id={item.value} />
                                        <Label htmlFor={item.value} className='cursor-pointer text-sm'>
                                            {item.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </RadioGroup>
                        <div className='grid grid-cols-2 gap-3 pt-4 '>
                            <div className='flex items-center space-x-2'>
                                <Checkbox id='left' checked={left} onCheckedChange={(c) => handleCheckboxChange(c as boolean, 'left')} />
                                <Label htmlFor='left' className='cursor-pointer text-sm'>
                                    Left
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='deactive'
                                    checked={deactive}
                                    onCheckedChange={(c) => handleCheckboxChange(c as boolean, 'deactive')}
                                />
                                <Label htmlFor='deactive' className='cursor-pointer text-sm'>
                                    Deactive
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='class'
                                    checked={classs}
                                    onCheckedChange={(c) => handleCheckboxChange(c as boolean, 'class')}
                                />
                                <Label htmlFor='class' className='cursor-pointer text-sm'>
                                    Class
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='section'
                                    checked={section}
                                    onCheckedChange={(c) => handleCheckboxChange(c as boolean, 'section')}
                                />
                                <Label htmlFor='section' className='cursor-pointer text-sm'>
                                    Section
                                </Label>
                            </div>
                        </div>
                        <div className=' flex w-full items-center space-x-4 pt-4 '>
                            <Label className='font-semibold'>Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant='outline' className='w-full justify-start text-left font-normal'>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {todaysDate ? format(todaysDate, 'PPP') : 'Select Date'}
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className='w-auto p-0' align='start'>
                                    <Calendar
                                        mode='single'
                                        selected={todaysDate ?? undefined}
                                        onSelect={(date) => {
                                            if (date) setTodaysDate(date);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        {filterType === 'Chal_no' && (
                            <div className='flex w-full items-center space-x-4 pt-4'>
                                <Label className='font-semibold'>
                                    Challan No. :<span className='ml-1 text-red-500'>*</span>
                                </Label>

                                <InputText
                                    id='Chal_no'
                                    value={challenSearch}
                                    onChange={(e) => setChallenSearch(e.target.value)}
                                    placeholder='Enter Challan No'
                                    className='flex transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            </div>
                        )}
                        {challenSearch !== '' && (
                            <div className='flex justify-end gap-3 pt-4'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    className='flex items-center gap-2'
                                    onClick={() => setChallenSearch('')}>
                                    <RotateCcw className='h-4 w-4' /> Clear
                                </Button>

                                <Button>
                                    <Save className='mr-2 h-4 w-4' /> Search
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className='max-h-[600px] w-[40%] overflow-auto rounded border bg-gray-50 p-4 shadow-inner'>
                        {/* Academic Year */}
                        <div className='mb-4 space-y-2'>
                            <div className='flex w-full items-center justify-between gap-4'>
                                <Label htmlFor='asmaY_Id' className='whitespace-nowrap font-semibold'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='asmaY_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            key={field.value || 'empty'}
                                            onValueChange={(val) => {
                                                const id = Number(val);
                                                field.onChange(id);
                                                setSelectedAsmayId(id);
                                            }}
                                            value={
                                                typeof field.value === 'number' || typeof field.value === 'string'
                                                    ? String(field.value)
                                                    : ''
                                            }
                                            disabled={loadingYears}>
                                            <SelectTrigger className='w-64'>
                                                <SelectValue placeholder='--Select Academic Year--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYearData?.data?.map((item: any) => (
                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            {errors.asmaY_Id && (
                                <div className='flex w-full items-center justify-between gap-4'>
                                    <Label />
                                    <FormError>{errors.asmaY_Id.message}</FormError>
                                </div>
                            )}
                            {/* Class */}
                            {classs && (
                                <div className='flex w-full items-center justify-between gap-4'>
                                    <Label htmlFor='asmcl_Id' className='whitespace-nowrap font-semibold'>
                                        Class <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmcl_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                key={field.value || 'empty'}
                                                onValueChange={(val) => {
                                                    const id = Number(val);
                                                    field.onChange(id);
                                                    setSelectedClassId(id);
                                                }}
                                                value={
                                                    typeof field.value === 'number' || typeof field.value === 'string'
                                                        ? String(field.value)
                                                        : ''
                                                }
                                                disabled={feeclassDataLoading}>
                                                <SelectTrigger className='w-64'>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {feeclassData?.data?.map((item) => (
                                                        <SelectItem key={item.asmcL_Id} value={String(item.asmcL_Id)}>
                                                            {item.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            )}
                            {errors.asmcl_Id && classs && (
                                <div className='flex w-full items-center justify-between gap-4'>
                                    <Label />
                                    <FormError>{errors.asmcl_Id.message}</FormError>
                                </div>
                            )}

                            {/* Section */}
                            {section && (
                                <div className='flex w-full items-center justify-between gap-4'>
                                    <Label htmlFor='asms_Id' className='whitespace-nowrap font-semibold'>
                                        Section <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asms_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                key={field.value || 'empty'}
                                                onValueChange={(val) => {
                                                    const id = Number(val);
                                                    field.onChange(id);
                                                    setSelectedSectionId(id);
                                                }}
                                                value={
                                                    typeof field.value === 'number' || typeof field.value === 'string'
                                                        ? String(field.value)
                                                        : ''
                                                }
                                                disabled={feeSectionDataLoading}>
                                                <SelectTrigger className='w-64'>
                                                    <SelectValue placeholder='Select Section' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {feeSectionData?.data?.map((item) => (
                                                        <SelectItem key={item.asmS_Id} value={String(item.asmS_Id)}>
                                                            {item.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            )}

                            {errors.asms_Id && section && (
                                <div className='flex w-full items-center justify-between gap-4'>
                                    <Label />
                                    <FormError>{errors.asms_Id.message}</FormError>
                                </div>
                            )}

                            {/* Student Name */}
                            <div className='flex w-full items-center justify-between gap-4'>
                                <Label className='whitespace-nowrap font-semibold'>
                                    {filterType === 'regular' || filterType === 'Chal_no' ? 'Student Name' : selectedLabel}

                                    <span className='ml-1 text-red-500'>*</span>
                                </Label>

                                <div className='relative w-64'>
                                    <input
                                        id='studentSearchInput'
                                        type='text'
                                        placeholder='Search student...'
                                        disabled={!selectedAsmayId || filterType === 'Chal_no'}
                                        value={studentSearch}
                                        onChange={(e) => {
                                            setStudentSearch(e.target.value);
                                            setSelectedStudent(null);
                                        }}
                                        className='w-full rounded border px-3 py-2'
                                        autoComplete='off'
                                    />

                                    {studentSearch.trim() !== '' && !selectedStudent && (
                                        <ul className='absolute top-full left-0 z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border bg-white shadow-md'>
                                            {loadingStudents ? (
                                                <li className='px-3 py-2 text-gray-500'>Loading...</li>
                                            ) : students.length === 0 ? (
                                                <li className='px-3 py-2 text-gray-500'>No students found</li>
                                            ) : (
                                                students.map((student) => (
                                                    <li
                                                        key={student.amst_Id}
                                                        onClick={() => {
                                                            setSelectedStudent(student);
                                                            setStudentSearch(student.amsT_StudentName);
                                                        }}
                                                        className='cursor-pointer px-3 py-2 hover:bg-blue-100'>
                                                        {student.amsT_StudentName}
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Term + Options */}
                        <div className='mt-3 flex gap-6'>
                            <div className='flex w-40 flex-col space-y-6'>
                                <div className='flex items-center space-x-2'>
                                    <Label className='font-semibold'>Term Name :</Label>
                                </div>

                                <div className='flex items-center space-x-6'>
                                    <Label>SMS</Label>
                                    <Checkbox checked={sms} onCheckedChange={(v) => setSms(v === true)} />
                                </div>

                                <div className='flex items-center space-x-3'>
                                    <Label>EMAIL</Label>
                                    <Checkbox checked={email} onCheckedChange={(v) => setEmail(v === true)} />
                                </div>
                            </div>

                            <div className='w-80'>
                                <CustomMultiSelectBox
                                    options={terms.map((ex) => ({
                                        label: ex.fmG_GroupName,
                                        value: ex.fmT_Id.toString()
                                    }))}
                                    isLoading={loadingTerm}
                                    disabled={amountCheck || filterType === 'Chal_no'}
                                    value={selectedTerm}
                                    onChange={handleTermChange}
                                    height='150px'
                                />
                            </div>
                        </div>

                        {/* Amount */}
                        <div className='mt-3'>
                            <div className='flex items-center gap-3'>
                                <Checkbox
                                    id='amount'
                                    checked={amountCheck}
                                    onCheckedChange={(v) => {
                                        if (v === true && selectedTerm.length === 0) {
                                            toast.error('Kindly select atleast any one term');
                                            return;
                                        }
                                        setAmountCheck(v === true);
                                    }}
                                />

                                <Label>Amount {amountCheck && <span className='text-red-500'>*</span>}</Label>

                                <InputText
                                    id='amount'
                                    placeholder='Enter Amount'
                                    className='flex transition-colors focus:ring-2 focus:ring-primary/20'
                                    disabled={!amountCheck}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='max-h-[400px] overflow-auto rounded border bg-gray-50 p-4 shadow-inner' style={{ width: '30%' }}>
                        <h3 className='mb-2 font-bold text-lg'>Student Information</h3>
                        <div className='flex min-w-[220px] max-w-[300px] flex-[1] flex-col items-center'>
                            <Card className='w-full p-0 shadow'>
                                <div className='flex justify-center p-4'>
                                    <div className='rounded-full border border-blue-300 p-1'>
                                        <img
                                            src={
                                                studentDetails?.[0]?.amsT_Photoname ??
                                                'https://hutchingspreadmission.blob.core.windows.net/files/Student.jpg'
                                            }
                                            alt='Student'
                                            className='h-40 w-40 rounded-full object-cover'
                                        />
                                    </div>
                                </div>
                                <div className='flex items-center justify-between border-t px-3 py-2 font-semibold text-blue-700 text-sm'>
                                    <span
                                        className='flex cursor-pointer items-center gap-1 hover:underline'
                                        onClick={() => setOpenFeeDetails(true)}>
                                        Fee Details <span>➤</span>
                                    </span>

                                    <span className='flex cursor-pointer items-center gap-1 hover:underline'>
                                        Student Profile <span>➤</span>
                                    </span>
                                </div>

                                {studentDetails.length > 0 && (
                                    <div className='mt-1 px-4 pb-5 font-semibold text-xs'>
                                        <div className='grid grid-cols-2 gap-x-5 gap-y-3 border-gray-300 border-t pt-3 '>
                                            <div>STUDENT NAME</div>
                                            <div className='text-gray-700'>
                                                {studentDetails?.[0]?.amsT_FirstName || 'N/A'}
                                                {studentDetails?.[0]?.amsT_MiddleName}
                                                {studentDetails?.[0]?.amsT_LastName}
                                            </div>

                                            <div>CLASS / SECTION</div>
                                            <div className='text-gray-700'>
                                                {studentDetails?.[0]?.classname} / {studentDetails?.[0]?.sectionname}
                                            </div>

                                            <div>ADMISSION NUMBER</div>
                                            <div className='text-gray-700'>{studentDetails?.[0]?.amsT_AdmNo}</div>

                                            <div>MOBILE NUMBER</div>
                                            <div className='text-gray-700'>{studentDetails?.[0]?.amst_mobile}</div>

                                            <div>FATHER NAME</div>
                                            <div className='text-gray-700'>{studentDetails?.[0]?.fathername}</div>

                                            <div>USERNAME</div>
                                            <div className='text-gray-700'>{studentDetails?.[0]?.username || 'N/A'}</div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>

                {openFeeDetails && <FeeDetails onClose={() => setOpenFeeDetails(false)} data={feeDetails} loading={false} />}

                {/* -------- FEE GRID -------- */}
                {loadingFeeHead ? (
                    <Card className='p-4 text-center'>Loading Fee Head Details...</Card>
                ) : (
                    selectedTerm.length > 0 && (
                        <Card className='p-4'>
                            <table className='w-full border text-center text-sm'>
                                <thead className='bg-gray-100'>
                                    <tr>
                                        <th className='border p-2'>Sl.No</th>
                                        <th className='border p-2'>
                                            <Checkbox checked={selectAll} onCheckedChange={(val) => handleSelectAll(val === true)} />
                                        </th>
                                        <th className='border p-2'>Fee Head</th>
                                        <th className='border p-2'>Installment</th>
                                        <th className='border p-2'>Current Charges</th>
                                        <th className='border p-2'>Total Adjusted</th>
                                        <th className='border p-2'>Total Charges</th>
                                        <th className='border p-2'>Concession</th>
                                        <th className='border p-2'>Opening Balance</th>
                                        <th className='border p-2'>Payable Amount</th>
                                        <th className='border p-2'>Net Amount</th>
                                        <th className='border p-2'>Rebate Amount</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {feeHeads.map((f, index) => (
                                        <tr key={f.fmG_Id}>
                                            <td className='border p-2'>{index + 1}</td>
                                            <td className='border p-2'>
                                                <Checkbox
                                                    checked={selectedHeads[f.fmG_Id] || false}
                                                    onCheckedChange={(val) => toggleRow(f.fmG_Id, val === true)}
                                                />
                                            </td>

                                            <td className='border p-2'>{f.fmG_GroupName}</td>
                                            <td className='border p-2'>{f.fmG_GroupName}</td>
                                            <td className='border p-2'>
                                                <input
                                                    type='number'
                                                    value={currentCharges[f.fmG_Id] || '0'}
                                                    disabled
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (v === '') {
                                                            setCurrentCharges((prev) => ({
                                                                ...prev,
                                                                [f.fmG_Id]: ''
                                                            }));
                                                            return;
                                                        }
                                                        if (/^\d*\.?\d*$/.test(v)) {
                                                            setCurrentCharges((prev) => ({
                                                                ...prev,
                                                                [f.fmG_Id]: v
                                                            }));
                                                        }
                                                    }}
                                                    className='w-full rounded border px-2 py-1 font-semibold text-sm disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 '
                                                />
                                            </td>
                                            <td className='border p-2'>
                                                <input
                                                    type='number'
                                                    value={toatlAdjusted[f.fmG_Id] || ''}
                                                    // disabled
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (v === '') {
                                                            setToatlAdjusted((prev) => ({
                                                                ...prev,
                                                                [f.fmG_Id]: ''
                                                            }));
                                                            return;
                                                        }
                                                        if (/^\d*\.?\d*$/.test(v)) {
                                                            setToatlAdjusted((prev) => ({
                                                                ...prev,
                                                                [f.fmG_Id]: v
                                                            }));
                                                        }
                                                    }}
                                                    className='w-full rounded border px-2 py-1 font-semibold text-sm disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 '
                                                />
                                            </td>
                                            <td className='border p-2'>
                                                <input
                                                    type='number'
                                                    value={totalCharges[f.fmG_Id] || ''}
                                                    disabled
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (v === '') {
                                                            setTotalCharges((prev) => ({
                                                                ...prev,
                                                                [f.fmG_Id]: ''
                                                            }));
                                                            return;
                                                        }
                                                        if (/^\d*\.?\d*$/.test(v)) {
                                                            setTotalCharges((prev) => ({
                                                                ...prev,
                                                                [f.fmG_Id]: v
                                                            }));
                                                        }
                                                    }}
                                                    className='w-full rounded border px-2 py-1 font-semibold text-sm disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 '
                                                />
                                            </td>
                                            <td className='border p-2'>
                                                <input
                                                    type='number'
                                                    value={concession[f.fmG_Id] || ''}
                                                    disabled
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (v === '') {
                                                            setConcession((prev) => ({
                                                                ...prev,
                                                                [f.fmG_Id]: ''
                                                            }));
                                                            return;
                                                        }
                                                        if (/^\d*\.?\d*$/.test(v)) {
                                                            setConcession((prev) => ({
                                                                ...prev,
                                                                [f.fmG_Id]: v
                                                            }));
                                                        }
                                                    }}
                                                    className='w-full rounded border px-2 py-1 font-semibold text-sm disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 '
                                                />
                                            </td>
                                            <td className='border p-2'>
                                                <input
                                                    type='number'
                                                    value={openingBalance[f.fmG_Id] || ''}
                                                    disabled
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (v === '') {
                                                            setOpeningBalance((prev) => ({
                                                                ...prev,
                                                                [f.fmG_Id]: ''
                                                            }));
                                                            return;
                                                        }
                                                        if (/^\d*\.?\d*$/.test(v)) {
                                                            setOpeningBalance((prev) => ({
                                                                ...prev,
                                                                [f.fmG_Id]: v
                                                            }));
                                                        }
                                                    }}
                                                    className='w-full rounded border px-2 py-1 font-semibold text-sm disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 '
                                                />
                                            </td>
                                            <td className='border p-2'>
                                                <input
                                                    type='number'
                                                    value={payableAmount[f.fmG_Id] || ''}
                                                    disabled={!selectedHeads[f.fmG_Id]}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (v === '') {
                                                            setPayableAmount((prev) => ({
                                                                ...prev,
                                                                [f.fmG_Id]: ''
                                                            }));
                                                            return;
                                                        }
                                                        if (/^\d*\.?\d*$/.test(v)) {
                                                            setPayableAmount((prev) => ({
                                                                ...prev,
                                                                [f.fmG_Id]: v
                                                            }));
                                                        }
                                                    }}
                                                    className='w-full rounded border px-2 py-1 font-semibold text-sm disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 '
                                                />
                                            </td>
                                            <td className='border p-2'>
                                                <input
                                                    type='number'
                                                    value={netAmount[f.fmG_Id] || ''}
                                                    disabled
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (v === '') {
                                                            setNetAmount((prev) => ({
                                                                ...prev,
                                                                [f.fmG_Id]: ''
                                                            }));
                                                            return;
                                                        }
                                                        if (/^\d*\.?\d*$/.test(v)) {
                                                            setNetAmount((prev) => ({
                                                                ...prev,
                                                                [f.fmG_Id]: v
                                                            }));
                                                        }
                                                    }}
                                                    className='w-full rounded border px-2 py-1 font-semibold text-sm disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 '
                                                />
                                            </td>
                                            <td className='border p-2'>
                                                <input
                                                    type='number'
                                                    value={rebateAmount[f.fmG_Id] || ''}
                                                    disabled
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (v === '') {
                                                            setRebateAmount((prev) => ({
                                                                ...prev,
                                                                [f.fmG_Id]: ''
                                                            }));
                                                            return;
                                                        }
                                                        if (/^\d*\.?\d*$/.test(v)) {
                                                            setRebateAmount((prev) => ({
                                                                ...prev,
                                                                [f.fmG_Id]: v
                                                            }));
                                                        }
                                                    }}
                                                    className='w-full rounded border px-2 py-1 font-semibold text-sm disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 '
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    )
                )}
                {selectedTerm.length > 0 && !loadingFeeHead && (
                    <div className='flex gap-8'>
                        <div className='max-h-[400px] overflow-auto rounded border bg-gray-50 p-3 shadow-inner'>
                            <Card className='mb-5 p-4'>
                                <RadioGroup
                                    value={modeType}
                                    onValueChange={(v) => {
                                        setModeType(v);
                                        setchepueDates({});
                                    }}
                                    className='flex items-center gap-6'>
                                    <div className='flex cursor-pointer items-center space-x-2'>
                                        <RadioGroupItem value='Single' id='single' />
                                        <Label htmlFor='single' className='text-sm'>
                                            Single
                                        </Label>
                                    </div>

                                    <div className='flex cursor-pointer items-center space-x-2'>
                                        <RadioGroupItem value='Multiple' id='multiple' />
                                        <Label htmlFor='multiple' className='text-sm'>
                                            Multiple
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </Card>

                            <Card className='p-4'>
                                <table className='w-full border text-sm'>
                                    <thead className='bg-gray-100'>
                                        <tr>
                                            <th className='border p-2'> </th>
                                            <th className='border p-2'>Type</th>
                                            <th className='border p-2'>Cheque/DD Date</th>
                                            <th className='border p-2'>Cheque/DD No./Card No</th>
                                            <th className='border p-2'>Bank Name</th>
                                            <th className='border p-2'>Amount</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {bankDetails?.map((f) => (
                                            <tr key={f.fmB_Id}>
                                                <td className='border p-2'>
                                                    {modeType === 'Single' && (
                                                        // <input
                                                        //     type='radio'
                                                        //     value={f.bank}
                                                        //     className='form-radio h-4 w-4 text-gray-600'
                                                        //     checked={payType === f.bank}
                                                        //     onChange={(e) => setPayType(e.target.value)}
                                                        // />
                                                        <RadioGroup value={payType} onValueChange={setPayType}>
                                                            <RadioGroupItem value={f.bank} id={f.bank} />
                                                        </RadioGroup>
                                                    )}
                                                    {modeType === 'Multiple' && (
                                                        <Checkbox
                                                            checked={checkPayType.includes(f.bank)}
                                                            onCheckedChange={(value) => {
                                                                if (value) {
                                                                    setCheckPayType((prev) => [...prev, f.bank]);
                                                                } else {
                                                                    setCheckPayType((prev) => prev.filter((b) => b !== f.bank));
                                                                }
                                                            }}
                                                            aria-label='Select row'
                                                        />
                                                    )}
                                                </td>
                                                <td className='border p-2 font-semibold'>{f.bank}</td>
                                                <td className='border p-2'>
                                                    {payType !== 'Cash' && modeType === 'Single' && (
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant='outline'
                                                                    className='w-full justify-start text-left font-normal'
                                                                    disabled={payType !== f.bank && modeType === 'Single'}>
                                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                                    {chequedates[f.fmB_Id]
                                                                        ? format(chequedates[f.fmB_Id]!, 'PPP')
                                                                        : 'Select Date'}
                                                                </Button>
                                                            </PopoverTrigger>

                                                            <PopoverContent className='w-auto p-0' align='start'>
                                                                <Calendar
                                                                    mode='single'
                                                                    selected={chequedates[f.fmB_Id] ?? undefined}
                                                                    onSelect={(date) =>
                                                                        setchepueDates((prev) => ({
                                                                            ...prev,
                                                                            [f.fmB_Id]: date ?? null
                                                                        }))
                                                                    }
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    )}
                                                    {checkPayType.includes(f.bank) && modeType === 'Multiple' && (
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant='outline'
                                                                    className='w-full justify-start text-left font-normal'>
                                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                                    {chequedates[f.fmB_Id]
                                                                        ? format(chequedates[f.fmB_Id]!, 'PPP')
                                                                        : 'Select Date'}
                                                                </Button>
                                                            </PopoverTrigger>

                                                            <PopoverContent className='w-auto p-0' align='start'>
                                                                <Calendar
                                                                    mode='single'
                                                                    selected={chequedates[f.fmB_Id] ?? undefined}
                                                                    onSelect={(date) =>
                                                                        setchepueDates((prev) => ({
                                                                            ...prev,
                                                                            [f.fmB_Id]: date ?? null
                                                                        }))
                                                                    }
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    )}
                                                </td>
                                                <td className='border p-2'>
                                                    {payType !== 'Cash' && modeType === 'Single' && (
                                                        <input
                                                            type='number'
                                                            value={chequeNo[f.fmB_Id]}
                                                            onChange={(e) => {
                                                                const v = e.target.value;
                                                                if (v === '') {
                                                                    setChequeNo((prev) => ({
                                                                        ...prev,
                                                                        [f.fmG_Id]: ''
                                                                    }));
                                                                    return;
                                                                }
                                                                if (/^\d*\.?\d*$/.test(v)) {
                                                                    setChequeNo((prev) => ({
                                                                        ...prev,
                                                                        [f.fmG_Id]: v
                                                                    }));
                                                                }
                                                            }}
                                                            className='w-full rounded border px-2 py-1 text-sm'
                                                            disabled={payType !== f.bank}
                                                        />
                                                    )}
                                                    {checkPayType.includes(f.bank) && modeType === 'Multiple' && (
                                                        <input
                                                            type='number'
                                                            value={chequeNo[f.fmB_Id]}
                                                            onChange={(e) => {
                                                                const v = e.target.value;
                                                                if (v === '') {
                                                                    setChequeNo((prev) => ({
                                                                        ...prev,
                                                                        [f.fmG_Id]: ''
                                                                    }));
                                                                    return;
                                                                }
                                                                if (/^\d*\.?\d*$/.test(v)) {
                                                                    setChequeNo((prev) => ({
                                                                        ...prev,
                                                                        [f.fmG_Id]: v
                                                                    }));
                                                                }
                                                            }}
                                                            className='w-full rounded border px-2 py-1 text-sm'
                                                            // disabled={payType !== f.bank}
                                                        />
                                                    )}
                                                </td>

                                                <td className='border p-2'>
                                                    {payType !== 'Cash' && modeType === 'Single' && (
                                                        <Select
                                                            value={selectedBanks[f.fmB_Id] || ''} // get value for this row
                                                            onValueChange={(val) =>
                                                                setSelectedBanks((prev) => ({
                                                                    ...prev,
                                                                    [f.fmB_Id]: val // update only this row
                                                                }))
                                                            }>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='Select Bank' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value='sbi'>State Bank Of India</SelectItem>
                                                                <SelectItem value='canara'>Canara Bank</SelectItem>
                                                                <SelectItem value='ka'>Karnataka Bank</SelectItem>
                                                                <SelectItem value='hdfc'>HDFC</SelectItem>
                                                                <SelectItem value='unionBank'>Union Bank</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                    {modeType === 'Multiple' && (
                                                        <Select
                                                            value={selectedBanks[f.fmB_Id] || ''} // get value for this row
                                                            onValueChange={(val) =>
                                                                setSelectedBanks((prev) => ({
                                                                    ...prev,
                                                                    [f.fmB_Id]: val // update only this row
                                                                }))
                                                            }>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='Select Bank' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value='sbi'>State Bank Of India</SelectItem>
                                                                <SelectItem value='canara'>Canara Bank</SelectItem>
                                                                <SelectItem value='ka'>Karnataka Bank</SelectItem>
                                                                <SelectItem value='hdfc'>HDFC</SelectItem>
                                                                <SelectItem value='unionBank'>Union Bank</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </td>
                                                <td className='border p-2'>
                                                    <input
                                                        type='number'
                                                        value={amount[f.fmB_Id]}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            if (v === '') {
                                                                setAmount((prev) => ({
                                                                    ...prev,
                                                                    [f.fmG_Id]: ''
                                                                }));
                                                                return;
                                                            }
                                                            if (/^\d*\.?\d*$/.test(v)) {
                                                                setAmount((prev) => ({
                                                                    ...prev,
                                                                    [f.fmG_Id]: v
                                                                }));
                                                            }
                                                        }}
                                                        className='w-full rounded border px-2 py-1 text-sm'
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>
                        </div>
                        <div className='max-h-[400px] overflow-auto rounded border bg-gray-50 p-3 shadow-inner'>
                            <Card className='mb-5 grid grid-cols-1 gap-4 p-4 text-sm md:grid-cols-2'>
                                <div>
                                    Current Fee: <b>{1000}</b>
                                </div>
                                <div>
                                    Concession: <b>{0}</b>
                                </div>
                                <div>
                                    Outstanding: <b>{300}</b>
                                </div>
                                <div>
                                    Fine: <b>{200}</b>
                                </div>
                                <div>
                                    Now Paying: <b>{200}</b>
                                </div>
                            </Card>

                            <Card className='grid grid-cols-1 gap-4 p-4 text-sm md:grid-cols-2'>
                                <div>
                                    Total Payable: <b>{2000}</b>
                                </div>
                                <div>
                                    Total Concession: <b>{3000}</b>
                                </div>
                                <div>
                                    Total Waived off: <b>{40000}</b>
                                </div>
                                <div>
                                    Overall Outstanding: <b>{40000}</b>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {selectedTerm.length > 0 && !loadingFeeHead && (
                    <div className='flex justify-end gap-3 border-t pt-4'>
                        <Button type='button' variant='outline' className='flex items-center gap-2' onClick={handleReset}>
                            <RotateCcw className='h-4 w-4' /> Reset
                        </Button>

                        <Button type='submit' disabled={isSubmitting}>
                            <Save className='mr-2 h-4 w-4' /> Save
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
}
