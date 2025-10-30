'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { useMasterFeeTransactionWaiveOff } from '@/hooks/fees/useTrasactions';

import { feeTransactionWaivedOffSchema } from '@/schemas/fees/trasactions';
import { addOrUpdateTransactionWaivedOff } from '@/server/fees/trasactions/waived_off';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, CheckSquare, Save, Square, Trash } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feeTransactionWaivedOffSchema.addOrUpdate>;

interface AddFeeConfigProps {
    onSuccess?: () => void;
    className?: string;
}

const studentData = [
    { name: 'ADVIK J', regNo: '6-24/25' },
    { name: 'GANAVI S', regNo: '38/2025-26' },
    { name: 'KIRAN KUMAR N', regNo: '7-24/25' }
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

export default function AddFeeTransactionWaiveOffForm({ onSuccess, className = '' }: AddFeeConfigProps) {
    const { refetchAll } = useMasterFeeTransactionWaiveOff();

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeTransactionWaivedOffSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {}
    });
    const { data: academicYears, isLoading: loadingAY } = useAcademicYearDropdown();
    const [academicYear, setAcademicYear] = useState<string | null>(null);
    const [classWise, setclassWise] = useState<string | null>(null);
    const [studentWise, setstudentWise] = useState<string | null>(null);
    const [sectionWise, setsectionWise] = useState<string | null>(null);
    const [remarks, setRemarks] = useState<string>('');
    const [grouplist, setgrouplist] = useState<string[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [refundableType, setRefundableType] = useState<string>('Refundable');
    const [fineWaiveOff, setFineWaiveOff] = useState<boolean>(false);
    const [completeFineWaiveOff, setCompleteFineWaiveOff] = useState<boolean>(false);
    const [nameType, setnameType] = useState<string>('NameReg.No');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        setPhotoFile(f);
    };

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

    const handleClassChange = (value: string) => {
        setclassWise(value);
        if (sectionWise) {
            const newSections = getSectionsForClass(value);
            if (!newSections.includes(sectionWise)) {
                setsectionWise(null);
            }
        }
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

    const nonRefundableOption = ['KG TUTION FEES', 'KG ILM & OTHER FEES', 'KG BOOKS FEES', 'KG ILM & OTHER FEES', 'KG BOOKS FEES'];

    const groupOptions = useMemo(() => {
        return nonRefundableOption.map((g) => ({ value: g, label: g }));
    }, []);

    const filteredGroupOptions = useMemo(() => {
        if (!searchTerm) return groupOptions;
        return groupOptions.filter((o) => o.label.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [groupOptions, searchTerm]);

    const handleSelectAll = () => {
        const allVisible = filteredGroupOptions.map((o) => o.value);
        const allSelected = allVisible.every((v) => selectedGroups.includes(v));
        if (allSelected) {
            setSelectedGroups((prev) => prev.filter((p) => !allVisible.includes(p)));
        } else {
            setSelectedGroups((prev) => Array.from(new Set([...prev, ...allVisible])));
        }
    };

    const handleGroupToggle = (value: string) => {
        setSelectedGroups((prev) => {
            if (prev.includes(value)) return prev.filter((p) => p !== value);
            return [...prev, value];
        });
    };

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const activeTypeValues = [fineWaiveOff ? 'FineWaiveOff' : null, completeFineWaiveOff ? 'CompleteFineWaiveOff' : null].filter(
                Boolean
            ) as string[];

            const payload = {
                mi_id: 30,
                academicYear: academicYear,
                class: classWise,
                section: sectionWise,
                student: studentWise,
                date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
                refundableType: refundableType,
                activeType: activeTypeValues.join(','),
                remarks: remarks,
                nameFormat: nameType,
                grouplist: selectedGroups.length > 0 ? selectedGroups : grouplist
            };
            const jsondata = JSON.stringify(payload);

            console.log('Payload Data', jsondata);
            const response = await addOrUpdateTransactionWaivedOff(payload as any);
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
        setAcademicYear(null);
        setclassWise(null);
        setsectionWise(null);
        setstudentWise(null);
        setSelectedDate(undefined);
        setRefundableType('Refundable');
        setFineWaiveOff(false);
        setCompleteFineWaiveOff(false);
        setnameType('NameReg.No');
        setRemarks('');
        setgrouplist([]);
        setSelectedGroups([]);
        setPhotoFile(null);
    };
    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='flex gap-6'>
                    <div className='flex-1 space-y-6'>
                        <div>
                            <Label>Academic Year*</Label>
                            <Select onValueChange={setAcademicYear} value={academicYear || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.isArray(academicYears)
                                        ? academicYears.map((y) => (
                                              <SelectItem key={String(y)} value={String(y)}>
                                                  {String(y)}
                                              </SelectItem>
                                          ))
                                        : null}
                                </SelectContent>
                            </Select>
                        </div>
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

                        <div>
                            <label htmlFor='remarks' className='inline-flex cursor-pointer items-center space-x-2'>
                                Remarks
                            </label>
                            <textarea
                                id='remarks'
                                name='Remarks'
                                rows={5}
                                value={remarks}
                                className='mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm'
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className='flex-1 space-y-6'>
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
                        <div>
                            <label htmlFor='grouplist' className='inline-flex cursor-pointer items-center space-x-2'>
                                Group List
                            </label>
                            {refundableType === 'NonRefundable' ? (
                                <div className='flex flex-col gap-2 border border-1 p-2'>
                                    <div className='flex items-center gap-2 px-2'>
                                        <input
                                            type='text'
                                            placeholder='Search groups...'
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm'
                                        />
                                    </div>

                                    <div
                                        className='mt-2 flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-50'
                                        onClick={handleSelectAll}>
                                        {filteredGroupOptions.length > 0 &&
                                        filteredGroupOptions.every((o) => selectedGroups.includes(o.value)) ? (
                                            <CheckSquare className='h-4 w-4 text-blue-600' />
                                        ) : (
                                            <Square className='h-4 w-4 text-gray-400' />
                                        )}
                                        <span className='text-gray-900 text-sm'>Select All</span>
                                    </div>

                                    <div className='max-h-28 overflow-auto'>
                                        {filteredGroupOptions.map((opt) => {
                                            const selected = selectedGroups.includes(opt.value);
                                            return (
                                                <div
                                                    key={opt.value}
                                                    onClick={() => handleGroupToggle(opt.value)}
                                                    className={`flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-50 ${
                                                        selected ? 'bg-blue-50' : ''
                                                    }`}>
                                                    {selected ? (
                                                        <CheckSquare className='h-4 w-4 text-blue-600' />
                                                    ) : (
                                                        <Square className='h-4 w-4 text-gray-400' />
                                                    )}
                                                    <span className='text-gray-900 text-sm'>{opt.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <input
                                    id='grouplist'
                                    name='Group List'
                                    defaultValue={grouplist.join(', ')}
                                    className='mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm'
                                />
                            )}
                        </div>

                        <div className='flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2'>
                            <label className='inline-flex cursor-pointer items-center space-x-2'>
                                <input
                                    type='checkbox'
                                    name='FineWaiveOff'
                                    value='FineWaiveOff'
                                    className='form-checkbox h-4 w-4 text-blue-600'
                                    checked={fineWaiveOff}
                                    onChange={(e) => setFineWaiveOff(e.target.checked)}
                                />
                                <span className='text-gray-900 text-sm'>Fine WaiveOff</span>
                            </label>

                            <label className='inline-flex cursor-pointer items-center space-x-2'>
                                <input
                                    type='checkbox'
                                    name='CompleteFineWaiveOff'
                                    value='CompleteFineWaiveOff'
                                    className='form-checkbox h-4 w-4 text-gray-600'
                                    checked={completeFineWaiveOff}
                                    disabled={!fineWaiveOff}
                                    onChange={(e) => setCompleteFineWaiveOff(e.target.checked)}
                                />
                                <span className='text-gray-900 text-sm'>Complete Fine WaiveOff</span>
                            </label>
                        </div>
                        <div>
                            <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleFileChange} />

                            <div>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isSubmitting}
                                    className='order-2 w-fit bg-blue-500 transition-all duration-200 hover:scale-105 sm:order-1'>
                                    Upload Photo
                                </Button>

                                {photoFile && (
                                    <div className='flex gap-3'>
                                        <div className='mt-2 text-gray-600 text-sm'>{photoFile.name}</div>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            onClick={() => {
                                                setPhotoFile(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className='w-1/3 '>
                                            <span>
                                                <Trash className='text-red-600' />
                                            </span>
                                        </Button>
                                    </div>
                                )}
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
