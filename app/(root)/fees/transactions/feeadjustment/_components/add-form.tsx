'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useFeeOpeningRefundable,
    useopeningClassdropdowndatafee,
    useopeningSectiondropdowndatafee,
    useopeningacademicyerdropdowndatafee
} from '@/hooks/fees/useTrasactions';
import { studentNameDropdown } from '@/server/fees/trasactions/fee_opening_balance';
import { format } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

export default function AddFeeAdjustmentForm({
    onSuccess,
    className = ''
}: {
    onSuccess?: () => void;
    className?: string;
}) {
    const { control, reset } = useForm({
        defaultValues: {
            academicYearId: undefined,
            classId: undefined,
            sectionId: undefined,
            date: format(new Date(), 'yyyy-MM-dd')
        }
    });

    const academicYearId = useWatch({ control, name: 'academicYearId' });
    const classId = useWatch({ control, name: 'classId' });
    const sectionId = useWatch({ control, name: 'sectionId' });

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [nameType, setNameType] = useState<'Name:Adm.No' | 'Adm.No:Name'>('Name:Adm.No');
    const [refundableType, setRefundableType] = useState<'Refundable' | 'NonRefundable'>('Refundable');
    const [studentWise, setStudentWise] = useState<string>('');
    const [fromGroupSelections, setFromGroupSelections] = useState<Set<number>>(new Set());
    const [toGroupSelections, setToGroupSelections] = useState<Set<number>>(new Set());
    const [loadingDropdown, setLoadingDropdown] = useState(false);
    const [studentDropdownList, setStudentDropdownList] = useState<{ value: string; label: string }[]>([]);

    const { data: academicYear, isLoading: loadingAcademicYear } = useopeningacademicyerdropdowndatafee();
    const { data: classdata, isLoading: loadingClasses } = useopeningClassdropdowndatafee();
    const { data: sectiondata, isLoading: loadingSections } = useopeningSectiondropdowndatafee(
        academicYearId ? Number(academicYearId) : 0,
        classId ? Number(classId) : 0
    );

    // Fee heads loaded based on selected student and refundable type
    const { data: refundabledata, isLoading: loadingRefundable } = useFeeOpeningRefundable(
        studentWise ? Number(studentWise) : 0,
        refundableType
    );

    const canShowAdjustmentBoxes = useMemo(() => {
        return !!academicYearId && !!classId && !!sectionId && !!studentWise;
    }, [academicYearId, classId, sectionId, studentWise]);

    const canSelectToGroup = fromGroupSelections.size > 0;

    const toggleFromGroup = (headId: number) => {
        setFromGroupSelections((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(headId)) {
                newSet.delete(headId);
                // Remove from To Group if it was selected there
                setToGroupSelections((toPrev) => {
                    const toNew = new Set(toPrev);
                    toNew.delete(headId);
                    return toNew;
                });
            } else {
                newSet.add(headId);
            }
            return newSet;
        });
    };

    const toggleToGroup = (headId: number) => {
        if (!canSelectToGroup) return;

        setToGroupSelections((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(headId)) {
                newSet.delete(headId);
            } else {
                newSet.add(headId);
            }
            return newSet;
        });
    };

    const selectedFromHeads = refundabledata?.data?.filter((head: any) => fromGroupSelections.has(head.fmH_Id)) || [];
    const selectedToHeads = refundabledata?.data?.filter((head: any) => toGroupSelections.has(head.fmH_Id)) || [];

    const handleReset = () => {
        reset();
        setSelectedDate(new Date());
        setNameType('Name:Adm.No');
        setRefundableType('Refundable');
        setStudentWise('');
        setFromGroupSelections(new Set());
        setToGroupSelections(new Set());
        setStudentDropdownList([]);
    };

    useEffect(() => {
        let isMounted = true;
        setLoadingDropdown(true);
        setStudentDropdownList([]);
        setStudentWise('');

        const fetchStudents = async () => {
            if (!academicYearId || !classId) {
                setLoadingDropdown(false);
                return;
            }

            try {
                const payload = {
                    asmay_Id: Number(academicYearId),
                    fillClasFlg: String(classId),
                    fillSecCls: sectionId ? String(sectionId) : '0',
                    filterInitialData: nameType === 'Name:Adm.No' ? 'NameRegNo' : 'RegNoName'
                };

                const res = await studentNameDropdown(payload);
                if (!isMounted) return;

                if (res?.data && Array.isArray(res.data)) {
                    const formatted = res.data.map((s: any) => ({
                        value: String(s.amst_Id || s.AMST_Id || s.studentId),
                        label:
                            [s.amsT_FirstName || s.firstName, s.amsT_MiddleName || s.middleName, s.amsT_LastName || s.lastName]
                                .filter(Boolean)
                                .join(' ')
                                .trim() ||
                            s.studentName ||
                            'Unknown'
                    }));
                    setStudentDropdownList(formatted);
                }
            } catch (error) {
                toast.error('Failed to load students');
            } finally {
                if (isMounted) setLoadingDropdown(false);
            }
        };

        fetchStudents();

        return () => {
            isMounted = false;
        };
    }, [academicYearId, classId, sectionId, nameType]);

    // Reset selections when student or refundable type changes
    useEffect(() => {
        setFromGroupSelections(new Set());
        setToGroupSelections(new Set());
    }, [studentWise, refundableType]);

    const handleSave = () => {
        if (fromGroupSelections.size === 0) {
            toast.error('Please select at least one fee head from "Adjustment From Group"');
            return;
        }
        if (toGroupSelections.size === 0) {
            toast.error('Please select at least one fee head from "Adjustment To Group"');
            return;
        }
        toast.success('Fee adjustment saved successfully!');
        onSuccess?.();
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className='grid gap-8 lg:grid-cols-2'>
                <div className='space-y-6'>
                    <div className='flex items-center gap-4'>
                        <Label className='w-40 text-right'>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='academicYearId'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className='w-80'>
                                        <SelectValue placeholder={loadingAcademicYear ? 'Loading...' : 'Select Academic Year'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYear?.data?.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className='flex items-center gap-4'>
                        <Label className='w-40 text-right'>
                            Class <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='classId'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className='w-80'>
                                        <SelectValue placeholder={loadingClasses ? 'Loading...' : 'Select Class'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classdata?.data?.map((item: any) => (
                                            <SelectItem key={item.asmcL_Id} value={String(item.asmcL_Id)}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className='flex items-center gap-4'>
                        <Label className='w-40 text-right'>
                            Section <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='sectionId'
                            control={control}
                            render={({ field }) => (
                                <Select disabled={!classId || loadingSections} onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className='w-80'>
                                        <SelectValue placeholder={loadingSections ? 'Loading...' : 'Select Section'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectiondata?.data?.map((item: any) => (
                                            <SelectItem key={item.asmS_Id} value={String(item.asmS_Id)}>
                                                {item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className='flex items-center gap-4'>
                        <Label className='w-40 text-right'>
                            Adjustment Date <span className='text-red-500'>*</span>
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant='outline' className='w-80 justify-start text-left font-normal'>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {format(selectedDate, 'dd-MM-yyyy')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0'>
                                <Calendar mode='single' selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className='space-y-6'>
                    <div className='flex justify-center gap-8 rounded-lg border bg-white p-4'>
                        <label className='flex cursor-pointer items-center gap-3'>
                            <input
                                type='radio'
                                name='nameType'
                                checked={nameType === 'Name:Adm.No'}
                                onChange={() => setNameType('Name:Adm.No')}
                                className='h-5 w-5 text-blue-600'
                            />
                            <span className='font-medium'>Name:Adm.No</span>
                        </label>
                        <label className='flex cursor-pointer items-center gap-3'>
                            <input
                                type='radio'
                                name='nameType'
                                checked={nameType === 'Adm.No:Name'}
                                onChange={() => setNameType('Adm.No:Name')}
                                className='h-5 w-5 text-blue-600'
                            />
                            <span className='font-medium'>Adm.No:Name</span>
                        </label>
                    </div>

                    <div className='flex items-center gap-4'>
                        <Label className='w-40 text-right'>
                            Student Name <span className='text-red-500'>*</span>
                        </Label>
                        <Select
                            value={studentWise}
                            onValueChange={setStudentWise}
                            disabled={loadingDropdown || studentDropdownList.length === 0}>
                            <SelectTrigger className='w-80'>
                                <SelectValue
                                    placeholder={
                                        loadingDropdown
                                            ? 'Loading students...'
                                            : studentDropdownList.length === 0
                                              ? 'No students found'
                                              : 'Select Student'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {studentDropdownList.map((student) => (
                                    <SelectItem key={student.value} value={student.value}>
                                        {student.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='flex justify-center gap-8 rounded-lg border bg-white p-4'>
                        <label className='flex cursor-pointer items-center gap-3'>
                            <input
                                type='radio'
                                name='refundable'
                                checked={refundableType === 'Refundable'}
                                onChange={() => setRefundableType('Refundable')}
                                className='h-5 w-5 text-blue-600'
                            />
                            <span className='font-medium'>Refundable</span>
                        </label>
                        <label className='flex cursor-pointer items-center gap-3'>
                            <input
                                type='radio'
                                name='refundable'
                                checked={refundableType === 'NonRefundable'}
                                onChange={() => setRefundableType('NonRefundable')}
                                className='h-5 w-5 text-blue-600'
                            />
                            <span className='font-medium'>Non Refundable</span>
                        </label>
                    </div>
                </div>
            </div>

            {canShowAdjustmentBoxes && (
                <>
                    {/* Adjustment Groups - Side by Side */}
                    <div className='grid grid-cols-1 gap-6 pt-4 lg:grid-cols-2'>
                        {/* From Group */}
                        <div className='overflow-hidden rounded-lg border-2 border-blue-400'>
                            <div className='justify-center bg-blue-100 px-4 py-3 font-semibold text-black'>Adjustment From Group</div>
                            <div className='relative min-h-48 bg-gray-50 p-6'>
                                {loadingRefundable ? (
                                    <p className='absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-500'>
                                        Loading fee heads...
                                    </p>
                                ) : !refundabledata?.data || refundabledata.data.length === 0 ? (
                                    <p className='absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-500'>
                                        No fee heads available
                                    </p>
                                ) : (
                                    refundabledata.data.map((head: any) => (
                                        <div key={head.fmH_Id} className='mb-3 flex items-center space-x-3'>
                                            <Checkbox
                                                checked={fromGroupSelections.has(head.fmH_Id)}
                                                onCheckedChange={() => toggleFromGroup(head.fmH_Id)}
                                            />
                                            <Label className='cursor-pointer select-none text-lg'>{head.fmH_FeeName}</Label>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* To Group */}
                        <div className='relative overflow-hidden rounded-lg border-2 border-blue-400'>
                            <div className='justify-center bg-blue-100 px-4 py-3 font-semibold text-black'>Adjustment To Group</div>
                            <div className={`min-h-48 bg-gray-50 p-6 ${!canSelectToGroup ? 'opacity-50' : ''}`}>
                                {loadingRefundable ? (
                                    <p className='text-center text-gray-500'>Loading...</p>
                                ) : !refundabledata?.data || refundabledata.data.length === 0 ? (
                                    <p className='text-center text-gray-500'>No fee heads available</p>
                                ) : (
                                    refundabledata.data.map((head: any) => (
                                        <div key={head.fmH_Id} className='mb-3 flex items-center space-x-3'>
                                            <Checkbox
                                                checked={toGroupSelections.has(head.fmH_Id)}
                                                onCheckedChange={() => toggleToGroup(head.fmH_Id)}
                                                disabled={!canSelectToGroup || fromGroupSelections.has(head.fmH_Id)}
                                            />
                                            <Label
                                                className={`select-none text-lg ${!canSelectToGroup || fromGroupSelections.has(head.fmH_Id) ? 'text-gray-500' : 'cursor-pointer'}`}>
                                                {head.fmH_FeeName}
                                            </Label>
                                        </div>
                                    ))
                                )}
                            </div>
                            {/* {!canSelectToGroup && fromGroupSelections.size === 0 && !loadingRefundable && refundabledata?.data?.length > 0 && (
                                <div className='absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded-lg pointer-events-none'>
                                    <p className='text-gray-700 font-medium'>
                                        Select at least one head from "Adjustment From Group" first
                                    </p>
                                </div>
                            )} */}
                        </div>
                    </div>

                    {/* Adjusted Tables - Side by Side */}
                    {(fromGroupSelections.size > 0 || toGroupSelections.size > 0) && (
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                            {fromGroupSelections.size > 0 && (
                                <div className='overflow-hidden rounded-lg border-2 border-blue-400'>
                                    <div className='rounded-t-lg bg-blue-900 px-4 py-2 font-semibold text-white'>Adjusted From Head</div>
                                    <table className='w-full bg-white'>
                                        <thead className='bg-blue-100 text-black'>
                                            <tr>
                                                <th className='px-4 py-3 text-left' />
                                                <th className='px-4 py-3 text-left'>Head</th>
                                                <th className='px-4 py-3 text-left'>Installment</th>
                                                <th className='px-4 py-3 text-left'>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedFromHeads.map((head: any) => (
                                                <tr key={head.fmH_Id} className='border-b'>
                                                    <td className='px-4 py-3'>
                                                        <Checkbox checked={true} disabled />
                                                    </td>
                                                    <td className='px-4 py-3 font-medium'>{head.fmH_FeeName}</td>
                                                    <td className='px-4 py-3'>Yearly</td>
                                                    <td className='px-4 py-3'>
                                                        <Input type='number' defaultValue='0' className='w-24' />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {toGroupSelections.size > 0 && (
                                <div className='overflow-hidden rounded-lg border-2 border-blue-400'>
                                    <div className='rounded-t-lg bg-blue-900 px-4 py-2 font-semibold text-white'>Adjusted To Head</div>
                                    <table className='w-full bg-white'>
                                        <thead className='bg-blue-100 text-black'>
                                            <tr>
                                                <th className='px-4 py-3 text-left' />
                                                <th className='px-4 py-3 text-left'>Head</th>
                                                <th className='px-4 py-3 text-left'>Installment</th>
                                                <th className='px-4 py-3 text-left'>Balance</th>
                                                <th className='px-4 py-3 text-left'>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedToHeads.map((head: any) => (
                                                <tr key={head.fmH_Id} className='border-b'>
                                                    <td className='px-4 py-3'>
                                                        <Checkbox checked={true} disabled />
                                                    </td>
                                                    <td className='px-4 py-3 font-medium'>{head.fmH_FeeName}</td>
                                                    <td className='px-4 py-3'>1 Installment</td>
                                                    <td className='px-4 py-3 font-medium text-blue-600'>2000</td>
                                                    <td className='px-4 py-3'>
                                                        <Input type='number' defaultValue='0' className='w-24' />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <div className='flex justify-center gap-6 border-t pt-8'>
                <Button size='lg' onClick={handleSave} className='w-full transition-all duration-200 hover:scale-105 sm:w-auto'>
                    <Save className='mr-2 h-5 w-5' />
                    Save
                </Button>
                <Button
                    size='lg'
                    variant='outline'
                    className='w-full transition-all duration-200 hover:scale-105 sm:w-auto'
                    onClick={handleReset}>
                    CANCEL
                </Button>
            </div>
        </div>
    );
}
