'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useMasterFeeOpeningBalance } from '@/hooks/fees/useTrasactions';
// import { feeOpeningBalanceSchema } from "@/schemas/fees/openingbalance";

import { feeOpeningBalanceSchema } from '@/schemas/fees/trasactions';
import { addOrUpdateFeeOpeningBalance } from '@/server/fees/trasactions/fee_opening_balance';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feeOpeningBalanceSchema.addOrUpdate>;

interface AddFeeConfigProps {
    onSuccess?: () => void;
    className?: string;
}

const studentData = [
    { name: 'ADVIK J', regNo: '6-24/25' },
    { name: 'GANAVI S', regNo: '38/2025-26' },
    { name: 'KIRAN KUMAR N', regNo: '7-24/25' }
];

const academicYears = ['2025-2026', '2024-2025', '2023-2024'];
const categoryWises = [
    'State Class I',
    'State Class II',
    'State Class III',
    'State Class IV',
    'State Class V',
    'State Class VI',
    'State Class VII',
    'State Class VIII',
    'State Class IX',
    'State Class X',
    'ICSE Class I',
    'ICSE Class II',
    'ICSE Class III',
    'ICSE Class IV',
    'ICSE Class V',
    'ICSE Class VI',
    'ICSE Class VII',
    'ICSE Class VIII',
    'ICSE Class IX'
];
const classWises = [
    'LKG STATE',
    'UKG STATE',
    'LKG',
    'UKG',
    'I STD',
    'II STD',
    'III STD',
    'IV STD',
    'V STD',
    'VI STD',
    'VII STD',
    'VIII STD',
    'IX STD',
    'X STD',
    'Nursery',
    'I CSE',
    'II CSE',
    'III CSE',
    'IV CSE'
];

const selectheads = ['TUTION FEES', 'IML & OTHER FEES', 'BOOKS FEES', 'TRANSPORT FEE', 'Other Allowances'];

const feeGroupsByHead: Record<string, string[]> = {
    'TUTION FEES': ['HS TUTION FEES', 'IC TUTION FEES', 'KG TUTION FEES', 'NUR TUTION FEES', 'PS TUTION FEES'],
    'IML & OTHER FEES': [
        'HS ILM & OTHER FEES',
        'IC ILM & OTHER FEES',
        'KG ILM & OTHER FEES',
        'NUR ILM & OTHER FEES',
        'PS ILM & OTHER FEES'
    ],
    'BOOKS FEES': ['HS BOOKS FEES', 'IC BOOKS FEES', 'KG BOOKS FEES', 'NUR BOOKS FEES', 'PS BOOKS FEES'],
    'TRANSPORT FEE': ['TRANSPORT FEE', 'TRANSPORT OTHER FEE', 'TRANSPORT UKG AND LKG FEE']
};

interface ClassOption {
    value: string;
    label: string;
}

export default function AddFeeOpeningBalanceForm({ onSuccess, className = '' }: AddFeeConfigProps) {
    const { refetchAll } = useMasterFeeOpeningBalance();

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeOpeningBalanceSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {}
    });

    const [selectionType, setSelectionType] = useState<string>('T');
    const [academicYear, setAcademicYear] = useState<string | null>(null);
    const [categoryWise, setcategoryWise] = useState<string | null>(null);
    const [classWise, setclassWise] = useState<string | null>(null);
    const [studentWise, setstudentWise] = useState<string | null>(null);
    const [sectionWise, setsectionWise] = useState<string | null>(null);
    const [selecthead, setselectHead] = useState<string | null>(null);
    const [feeGroup, setFeeGroup] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [refundableType, setRefundableType] = useState<string>('Refundable');
    const [activeType, setactiveType] = useState<string>('Active');
    const [nameType, setnameType] = useState<string>('NameReg.No');
    const [pdaorfeeType, setpdaorfeeType] = useState<string>('Fees');
    const [classOptions, _setClassOptions] = useState<ClassOption[]>([
        { value: '1', label: 'JUNE' },
        { value: '2', label: 'JULY' },
        { value: '3', label: 'AUG' },
        { value: '4', label: 'SEP' },
        { value: '5', label: 'OCT' },
        { value: '6', label: 'NOV' },
        { value: '7', label: 'DEC' },
        { value: '8', label: 'JAN' },
        { value: '9', label: 'FEB' },
        { value: '10', label: 'MAR' }
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const filteredClassOptions = classOptions.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));

    const availableSections = useMemo(() => {
        if (!classWise) return [];

        if (classWise === 'LKG STATE' || classWise === 'UKG STATE') {
            return [];
        }

        if (classWise === 'LKG' || classWise === 'UKG') {
            return ['A', 'B', 'C'];
        }

        if (['I STD', 'II STD', 'III STD', 'IV STD', 'V STD'].includes(classWise)) {
            return ['A'];
        }

        if (['VI STD', 'VII STD', 'VIII STD', 'IX STD', 'X STD'].includes(classWise)) {
            return ['A', 'B'];
        }

        if (classWise === 'Nursery') {
            return ['A'];
        }

        if (['I CSE', 'II CSE', 'III CSE', 'IV CSE'].includes(classWise)) {
            return ['B', 'C'];
        }

        return [];
    }, [classWise]);

    const availableFeeGroups = useMemo(() => {
        if (!selecthead || selecthead === 'Other Allowances') return [];
        return feeGroupsByHead[selecthead] || [];
    }, [selecthead]);

    const showFeeGroup = useMemo(() => {
        return selecthead && selecthead !== 'Other Allowances';
    }, [selecthead]);

    const showFeeInstallment = useMemo(() => {
        return (
            selecthead === 'TRANSPORT FEE' &&
            feeGroup !== null &&
            ['TRANSPORT FEE', 'TRANSPORT OTHER FEE', 'TRANSPORT UKG AND LKG FEE'].includes(feeGroup)
        );
    }, [selecthead, feeGroup]);

    const formattedStudentList = useMemo(() => {
        if (nameType === 'NameReg.No') {
            return studentData.map((student) => ({
                value: `${student.name}-${student.regNo}`,
                label: `${student.name} - ${student.regNo}`
            }));
        }
        return studentData.map((student) => ({
            value: `${student.regNo}-${student.name}`,
            label: `${student.regNo} - ${student.name}`
        }));
    }, [nameType]);

    const handleSelectionTypeChange = (value: string) => {
        setSelectionType(value);
        setstudentWise(null);
        if (value === 'C') {
            setclassWise(null);
            setsectionWise(null);
        }
        if (value !== 'C') {
            setcategoryWise(null);
        }
    };

    const handleClassChange = (value: string) => {
        setclassWise(value);
        if (sectionWise) {
            const newSections = getSectionsForClass(value);
            if (!newSections.includes(sectionWise)) {
                setsectionWise(null);
            }
        }
    };

    const handleFeeHeadChange = (value: string) => {
        setselectHead(value);
        setFeeGroup(null);
    };

    const handleFeeGroupChange = (value: string) => {
        setFeeGroup(value);
        setSelectedClasses([]);
    };

    const getSectionsForClass = (className: string) => {
        if (className === 'LKG STATE' || className === 'UKG STATE') return [];
        if (className === 'LKG' || className === 'UKG') return ['A', 'B', 'C'];
        if (['I STD', 'II STD', 'III STD', 'IV STD', 'V STD'].includes(className)) return ['A'];
        if (['VI STD', 'VII STD', 'VIII STD', 'IX STD', 'X STD'].includes(className)) return ['A', 'B'];
        if (className === 'Nursery') return ['A'];
        if (['I CSE', 'II CSE', 'III CSE', 'IV CSE'].includes(className)) return ['B', 'C'];
        return [];
    };

    const handleInstallmentChange = (value: string) => {
        setSelectedClasses((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
    };

    const onSubmit: SubmitHandler<FormFields | any> = async (_data: FormFields) => {
        try {
            const payload = {
                mi_id: 30,
                selectionType: selectionType,
                academicYear: academicYear,
                category: selectionType === 'C' ? categoryWise : null,
                class: selectionType !== 'C' ? classWise : null,
                section: selectionType !== 'C' ? sectionWise : null,
                student: selectionType === 'G' ? studentWise : null,
                feeHead: selecthead,
                feeGroup: showFeeGroup ? feeGroup : null,
                feeInstallments: showFeeInstallment ? selectedClasses : [],
                date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
                refundableType: refundableType,
                activeType: activeType,
                pdaorfeeType: pdaorfeeType,
                nameFormat: nameType
            };

            const response = await addOrUpdateFeeOpeningBalance(payload);
            if (response.success) {
                toast.success(response.message);
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleReset = () => {
        reset();
        setSelectionType('T');
        setAcademicYear(null);
        setcategoryWise(null);
        setclassWise(null);
        setsectionWise(null);
        setstudentWise(null);
        setselectHead(null);
        setFeeGroup(null);
        setSelectedDate(undefined);
        setRefundableType('Refundable');
        setactiveType('Active');
        setpdaorfeeType('Fees');
        setnameType('NameReg.No');
        setSelectedClasses([]);
        setSearchTerm('');
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='flex items-center justify-center space-x-6 rounded-lg border border-gray-300 bg-white px-4 py-2'>
                    <label className='inline-flex cursor-pointer items-center space-x-3'>
                        <input
                            type='radio'
                            name='FMC_GroupOrTermFlg'
                            value='T'
                            className='form-radio h-4 w-4 text-blue-600'
                            checked={selectionType === 'T'}
                            onChange={(e) => handleSelectionTypeChange(e.target.value)}
                        />
                        <span className='text-gray-900 text-sm'>All</span>
                    </label>

                    <label className='inline-flex cursor-pointer items-center space-x-3'>
                        <input
                            type='radio'
                            name='FMC_GroupOrTermFlg'
                            value='G'
                            className='form-radio h-4 w-4 text-gray-600'
                            checked={selectionType === 'G'}
                            onChange={(e) => handleSelectionTypeChange(e.target.value)}
                        />
                        <span className='text-gray-900 text-sm'>Individual</span>
                    </label>

                    <label className='inline-flex cursor-pointer items-center space-x-3'>
                        <input
                            type='radio'
                            name='FMC_GroupOrTermFlg'
                            value='C'
                            className='form-radio h-4 w-4 text-gray-600'
                            checked={selectionType === 'C'}
                            onChange={(e) => handleSelectionTypeChange(e.target.value)}
                        />
                        <span className='text-gray-900 text-sm'>Category Wise</span>
                    </label>
                </div>

                <div className='flex gap-6'>
                    <div className='flex-1 space-y-6'>
                        <div>
                            <Label>Academic Year*</Label>
                            <Select onValueChange={setAcademicYear} value={academicYear || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYears.map((y) => (
                                        <SelectItem key={y} value={y}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectionType === 'C' && (
                            <div>
                                <Label>Category*</Label>
                                <Select onValueChange={setcategoryWise} value={categoryWise || ''}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Category' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryWises.map((y) => (
                                            <SelectItem key={y} value={y}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {selectionType !== 'C' && (
                            <>
                                <div>
                                    <Label>Class*</Label>
                                    <Select onValueChange={handleClassChange} value={classWise || ''}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Class' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classWises.map((y) => (
                                                <SelectItem key={y} value={y}>
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {availableSections.length > 0 && (
                                    <div>
                                        <Label>Section*</Label>
                                        <Select onValueChange={setsectionWise} value={sectionWise || ''}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Section' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableSections.map((y) => (
                                                    <SelectItem key={y} value={y}>
                                                        {y}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </>
                        )}

                        <div className='space-y-2'>
                            <Label>Type*</Label>
                            <div className='flex flex-row items-center justify-around rounded-lg border border-gray-300 bg-white px-3 py-2'>
                                <label className='inline-flex cursor-pointer items-center space-x-2'>
                                    <input
                                        type='radio'
                                        name='RefundableFlg'
                                        value='Refundable'
                                        className='form-radio h-4 w-4 text-blue-600'
                                        checked={refundableType === 'Refundable'}
                                        onChange={(e) => setRefundableType(e.target.value)}
                                    />
                                    <span className='text-gray-900 text-sm'>Refundable</span>
                                </label>

                                <label className='inline-flex cursor-pointer items-center space-x-2'>
                                    <input
                                        type='radio'
                                        name='RefundableFlg'
                                        value='NonRefundable'
                                        className='form-radio h-4 w-4 text-gray-600'
                                        checked={refundableType === 'NonRefundable'}
                                        onChange={(e) => setRefundableType(e.target.value)}
                                    />
                                    <span className='text-gray-900 text-sm'>Non Refundable</span>
                                </label>
                            </div>
                        </div>

                        {refundableType === 'NonRefundable' && (
                            <>
                                <div>
                                    <Label>Fee Head*</Label>
                                    <Select onValueChange={handleFeeHeadChange} value={selecthead || ''}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Fee Head' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectheads.map((y) => (
                                                <SelectItem key={y} value={y}>
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {showFeeGroup && (
                                    <div>
                                        <Label>Fee Group*</Label>
                                        <Select onValueChange={handleFeeGroupChange} value={feeGroup || ''}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Fee Group' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableFeeGroups.map((y) => (
                                                    <SelectItem key={y} value={y}>
                                                        {y}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </>
                        )}

                        {showFeeInstallment && (
                            <div>
                                <Label htmlFor='classes'>Fee Installment*</Label>
                                <div className='min-h-[40px] rounded-md border bg-white px-3 py-2'>
                                    <input
                                        type='text'
                                        placeholder='Search Installments'
                                        className='mb-2 w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <div className='flex max-h-40 flex-col gap-1 overflow-y-auto'>
                                        {filteredClassOptions.length > 0 ? (
                                            filteredClassOptions.map((option) => (
                                                <label
                                                    key={option.value}
                                                    className='flex cursor-pointer items-center rounded p-1 hover:bg-gray-50'>
                                                    <input
                                                        type='checkbox'
                                                        value={option.value}
                                                        checked={selectedClasses.includes(option.value)}
                                                        onChange={() => handleInstallmentChange(option.value)}
                                                        className='mr-2 h-4 w-4 accent-blue-600'
                                                    />
                                                    <span className='truncate text-sm'>{option.label}</span>
                                                </label>
                                            ))
                                        ) : (
                                            <span className='text-gray-400 text-sm'>No installments found</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='flex-1 space-y-6'>
                        {selectionType === 'G' && (
                            <>
                                <div className='flex flex-row items-center justify-start gap-4 rounded-lg border border-gray-300 bg-white px-3 py-2'>
                                    <label className='inline-flex cursor-pointer items-center space-x-2'>
                                        <input
                                            type='radio'
                                            name='NameReg.NoFlg'
                                            value='NameReg.No'
                                            className='form-radio h-4 w-4 text-blue-600'
                                            checked={nameType === 'NameReg.No'}
                                            onChange={(e) => setnameType(e.target.value)}
                                        />
                                        <span className='text-gray-900 text-sm'>Name:Reg.No</span>
                                    </label>

                                    <label className='inline-flex cursor-pointer items-center space-x-2'>
                                        <input
                                            type='radio'
                                            name='NameReg.NoFlg'
                                            value='Reg.NoName'
                                            className='form-radio h-4 w-4 text-gray-600'
                                            checked={nameType === 'Reg.NoName'}
                                            onChange={(e) => setnameType(e.target.value)}
                                        />
                                        <span className='text-gray-900 text-sm'>Reg.No:Name</span>
                                    </label>
                                </div>

                                <div>
                                    <Label>Student Name*</Label>
                                    <Select onValueChange={setstudentWise} value={studentWise || ''}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Student' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {formattedStudentList.map((student) => (
                                                <SelectItem key={student.value} value={student.value}>
                                                    {student.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}

                        <div>
                            <Label>Date*</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant='outline' className='w-full justify-start text-left font-normal'>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {selectedDate ? format(selectedDate, 'PPP') : <span>Select Date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0' align='start'>
                                    <Calendar mode='single' selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className='flex flex-row items-center gap-4'>
                            <div className='flex w-1/2 flex-row items-center justify-start gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2'>
                                <label className='inline-flex cursor-pointer items-center space-x-2'>
                                    <input
                                        type='radio'
                                        name='ActiveFlg'
                                        value='Active'
                                        className='form-radio h-4 w-4 text-blue-600'
                                        checked={activeType === 'Active'}
                                        onChange={(e) => setactiveType(e.target.value)}
                                    />
                                    <span className='text-gray-900 text-sm'>Active</span>
                                </label>

                                <label className='inline-flex cursor-pointer items-center space-x-2'>
                                    <input
                                        type='radio'
                                        name='ActiveFlg'
                                        value='Left'
                                        className='form-radio h-4 w-4 text-gray-600'
                                        checked={activeType === 'Left'}
                                        onChange={(e) => setactiveType(e.target.value)}
                                    />
                                    <span className='text-gray-900 text-sm'>Left</span>
                                </label>
                            </div>

                            <div className='flex w-1/2 flex-row items-center justify-start gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2'>
                                <label className='inline-flex cursor-pointer items-center space-x-2'>
                                    <input
                                        type='radio'
                                        name='PDAFlg'
                                        value='Fees'
                                        className='form-radio h-4 w-4 text-gray-600'
                                        checked={pdaorfeeType === 'Fees'}
                                        onChange={(e) => setpdaorfeeType(e.target.value)}
                                    />
                                    <span className='text-gray-900 text-sm'>Fees</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
