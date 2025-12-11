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
import { format } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
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

    const canShowAdjustmentBoxes = useMemo(() => {
        return !!academicYearId && !!classId && !!sectionId;
    }, [academicYearId, classId, sectionId]);
    const toggleFromGroup = (headId: number) => {
        setFromGroupSelections((prev) => {
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

    const handleReset = () => {
        reset();
        setSelectedDate(new Date());
        setNameType('Name:Adm.No');
        setRefundableType('Refundable');
        setStudentWise('');
        setFromGroupSelections(new Set());
    };

    const handleSave = () => {
        if (fromGroupSelections.size === 0) {
            toast.error('Please select at least one fee head from "Adjustment From Group"');
            return;
        }
        toast.success('Fee adjustment saved successfully!');
        onSuccess?.();
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className='border-orange-400 border-b-2 pb-4'>
                <h2 className='font-bold text-2xl text-gray-800'>FEE ADJUSTMENT</h2>
            </div>

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
                        <Select value={studentWise} onValueChange={setStudentWise}>
                            <SelectTrigger className='w-80'>
                                <SelectValue placeholder='Select Student' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='1'>KIRAN KUMAR N : 7-24/25</SelectItem>
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
                    <div className='grid grid-cols-1 gap-6 pt-4 lg:grid-cols-2'>
                        <div className='overflow-hidden rounded-lg border-2 border-blue-400'>
                            <div className=' justify-center px-4 py-3 font-semibold text-black'>Adjustment From Group</div>
                            <div className='min-h-48 bg-gray-50 p-6'>
                                {refundabledata?.data?.map((head: any) => (
                                    <div key={head.fmH_Id} className='mb-3 flex items-center space-x-3'>
                                        <Checkbox
                                            checked={fromGroupSelections.has(head.fmH_Id)}
                                            onCheckedChange={() => toggleFromGroup(head.fmH_Id)}
                                        />
                                        {/* <label className="text-lg cursor-pointer select-none">
                                            {head.fmH_FeeName}
                                        </label>
                                     */}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='overflow-hidden rounded-lg border-2 border-blue-400'>
                            <div className=' justify-center px-4 py-3 font-semibold text-black'>Adjustment To Group</div>
                            <div className='min-h-48 bg-gray-50 p-6'>
                                <p className='text-center text-gray-500'>No items selected</p>
                            </div>
                        </div>
                    </div>

                    {fromGroupSelections.size > 0 && (
                        <div className='mt-6'>
                            <div className='rounded-t-lg bg-blue-900 px-4 py-2 font-semibold text-white'>Adjusted From Head</div>
                            <div className='overflow-hidden rounded-b-lg border-2 border-blue-400'>
                                <table className='w-full bg-white'>
                                    <thead className=' text-black '>
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
                                                    <Input type='number' defaultValue='10' className='w-24' />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
