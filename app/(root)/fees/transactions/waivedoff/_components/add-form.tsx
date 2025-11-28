'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GenericDataTable, useDataTableProps } from '@/components/ui/view-data-table/view-generic-data-table';
import {
    useClassdropdowndatafee,
    useMasterFeeTransactionWaiveOff,
    useSectiondropdowndatafee,
    useacademicyerdropdowndatafee
} from '@/hooks/fees/useTrasactions';

import { feeTransactionWaivedOffSchema } from '@/schemas/fees/trasactions';
import { addOrUpdateTransactionWaivedOff, getGroupList, getHeadList, getStudentdetails } from '@/server/fees/trasactions/waived_off';
import type { ApiSearchparams } from '@/types';
import type { IMasterStudentClassMappingList } from '@/types/fees/masters/masters';
import type {
    feeTransactionWaivedOffGroup,
    feeTransactionWaivedOffHead,
    feeTransactionWaivedOffStudentDetails
} from '@/types/fees/transactions/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Save, Trash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { FeeTransactionHeadList } from './head-list-columns';

type FormFields = z.infer<typeof feeTransactionWaivedOffSchema.addOrUpdate>;

interface AddFeeTransactionWaiveOffFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddFeeTransactionWaiveOffForm({ onSuccess, className = '' }: AddFeeTransactionWaiveOffFormProps) {
    const { refetchAll } = useMasterFeeTransactionWaiveOff();

    const {
        handleSubmit,
        reset,
        setValue,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeTransactionWaivedOffSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {}
    });
    const [academicYear, setAcademicYear] = useState<number | null>(null);
    const [classWise, setclassWise] = useState<number | null>(null);
    const [sectionWise, setsectionWise] = useState<number | null>(null);
    const [studentWise, setstudentWise] = useState<number | null>(null);
    const [remarks, setRemarks] = useState<string>('');
    const [grouplist, setgrouplist] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [refundableType, setRefundableType] = useState<string>('Refundable');
    const [fineWaiveOff, setFineWaiveOff] = useState<boolean>(false);
    const [completeFineWaiveOff, setCompleteFineWaiveOff] = useState<boolean>(false);
    const [nameType, setnameType] = useState<string>('NameReg.No');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [studentDetails, setStudentDetails] = useState<feeTransactionWaivedOffStudentDetails[]>([]);
    const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
    const [studentDetailsError, setStudentDetailsError] = useState<any>(null);
    const [groupList, setGroupList] = useState<feeTransactionWaivedOffGroup[]>([]);
    const [groupListLoading, setGroupListLoading] = useState(false);
    const [groupListError, setGroupListError] = useState<any>(null);
    //   const [groupSearch, setGroupSearch] = useState("");
    const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isViewing, setIsViewing] = useState(false);
    const [selectedHead, setSelectedHead] = useState<IMasterStudentClassMappingList[]>([]);
    const [apisearchParams_, setApisearchParams_] = useState<ApiSearchparams>({});
    const [tableProps, setTableProps] = useState<any>(null);
    const [headList, setHeadList] = useState<feeTransactionWaivedOffHead[]>([]);
    const [headListLoading, setHeadListLoading] = useState(false);
    const [headListError, setHeadListError] = useState<any>(null);

    const { data: academicYears, isLoading: academicYearLoading, error: academicYearError } = useacademicyerdropdowndatafee();
    useEffect(() => {
        if (academicYears) {
            if (academicYears?.data && Array.isArray(academicYears.data)) {
                const firstId = academicYears.data[0].asmaY_Id;
                setValue('academicYear', firstId);
            }
        }
    }, [academicYears, reset]);

    const { data: classdata, isLoading: classloading, error: classerror } = useClassdropdowndatafee();

    const { data: sectiondata, isLoading: secloading, error: sectionerror } = useSectiondropdowndatafee();

    const asmay_Id = watch('academicYear');
    const asmcl_Id = watch('class');
    const asms_Id = watch('section');
    const amst_Id = watch('student');

    //Student List
    const fetchStudentDetails = async () => {
        if (!asmay_Id) return;
        if (!asmcl_Id) return;
        if (!asms_Id) return;
        try {
            setStudentDetailsLoading(true);
            setStudentDetailsError(null);

            const res = await getStudentdetails(Number(asmay_Id), Number(asmcl_Id), Number(asms_Id));
            setStudentDetails(res.data ?? []);
            setValue('student', 0);
        } catch (error) {
            console.error('Error fetching student class mapping', error);
            setStudentDetailsError(error);
        } finally {
            setStudentDetailsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentDetails();
    }, [asmay_Id, asmcl_Id, asms_Id]);

    //Group List
    const fetcthGroupList = async () => {
        if (!asmay_Id) return;
        if (!amst_Id) return;
        try {
            setGroupListLoading(true);
            setGroupListError(null);

            const res = await getGroupList(Number(asmay_Id), Number(amst_Id), refundableType);
            setGroupList(res.data ?? []);
        } catch (error) {
            console.error('Error fetching student class mapping', error);
            setGroupListError(error);
        } finally {
            setGroupListLoading(false);
        }
    };

    useEffect(() => {
        setGroupList([]);
        setSelectedGroups([]);
        fetcthGroupList();
    }, [asmay_Id, amst_Id, refundableType]);

    //Head List
    const fetcthHeadList = async () => {
        if (!asmay_Id) return;
        if (!amst_Id) return;
        if (!selectedGroups) return;
        try {
            setHeadListLoading(true);
            setHeadListError(null);

            const res = await getHeadList(Number(asmay_Id), Number(amst_Id), refundableType, fineWaiveOff === true ? 1 : 0, {
                groupIds: selectedGroups
            });
            setHeadList(res.data ?? []);
            setTableProps(useDataTableProps(res ?? []));
        } catch (error) {
            console.error('Error fetching student class mapping', error);
            setHeadListError(error);
        } finally {
            setHeadListLoading(false);
        }
    };

    useEffect(() => {
        fetcthHeadList();
    }, [amst_Id, selectedGroups, fineWaiveOff]);

    useEffect(() => {
        setGroupList([]);
        setSelectedGroups([]);
    }, [asmay_Id, asmcl_Id, asms_Id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        setPhotoFile(f);
        setPhotoPreview(URL.createObjectURL(f!));
    };

    const handleSelectHead = (selectedRows: IMasterStudentClassMappingList[]) => {
        setSelectedHead(selectedRows);
    };

    const handleApiParmasChange = (apiparmas: ApiSearchparams) => {
        setApisearchParams_((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(apiparmas)) return prev;
            return apiparmas;
        });
    };

    const feeHeads = useMemo(() => {
        return FeeTransactionHeadList.filter((col) => {
            if (fineWaiveOff && 'accessorKey' in col && col.accessorKey === 'totalTobepaid') {
                return false;
            }
            return true;
        });
    }, [fineWaiveOff]);

    const onSubmit: SubmitHandler<FormFields | any> = async () => {
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
                            <Label className='min-w-[150px] text-right' htmlFor='academicYear'>
                                Academic Year:<span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <div className='flex w-full max-w-[400px] flex-col'>
                                <Controller
                                    name='academicYear'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            key={field.value || 'empty'}
                                            onValueChange={(val) => {
                                                const id = Number(val);
                                                field.onChange(id);
                                                setAcademicYear(id);
                                            }}
                                            value={
                                                typeof field.value === 'number' || typeof field.value === 'string'
                                                    ? String(field.value)
                                                    : ''
                                            }
                                            disabled={academicYearLoading}>
                                            <SelectTrigger className='min-w-[400px] text-center'>
                                                <SelectValue placeholder='--Select Academic Year--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYearLoading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : academicYearError ? (
                                                    <SelectItem value='error' disabled>
                                                        Error loading
                                                    </SelectItem>
                                                ) : (
                                                    academicYears?.data?.map((item: any) => (
                                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                            {item.asmaY_Year}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.academicYear && <FormError>{errors.academicYear.message}</FormError>}
                            </div>
                        </div>
                        <div>
                            <Label className='min-w-[150px] text-right' htmlFor='class'>
                                Class:<span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <div className='flex w-full max-w-[400px] flex-col'>
                                <Controller
                                    name='class'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            key={field.value || 'empty'}
                                            onValueChange={(val) => {
                                                const id = Number(val);
                                                field.onChange(id);
                                                setclassWise(id);
                                            }}
                                            value={
                                                typeof field.value === 'number' || typeof field.value === 'string'
                                                    ? String(field.value)
                                                    : ''
                                            }
                                            //   disabled={classloading}
                                        >
                                            <SelectTrigger className='min-w-[400px] text-center'>
                                                <SelectValue placeholder='--Select Class --' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classloading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : classerror ? (
                                                    <SelectItem value='error' disabled>
                                                        Error loading
                                                    </SelectItem>
                                                ) : (
                                                    classdata?.data?.map((item: any) => (
                                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                            {item.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.class && <FormError>{errors.class.message}</FormError>}
                            </div>
                        </div>

                        <div>
                            <Label className='min-w-[150px] text-right' htmlFor='section'>
                                Section:<span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <div className='flex w-full max-w-[400px] flex-col'>
                                <Controller
                                    name='section'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            key={field.value || 'empty'}
                                            onValueChange={(val) => {
                                                const id = Number(val);
                                                field.onChange(id);
                                                setsectionWise(id);
                                            }}
                                            value={
                                                typeof field.value === 'number' || typeof field.value === 'string'
                                                    ? String(field.value)
                                                    : ''
                                            }
                                            //   disabled={secloading}
                                        >
                                            <SelectTrigger className='min-w-[400px] text-center'>
                                                <SelectValue placeholder='--Select Section --' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {secloading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : sectionerror ? (
                                                    <SelectItem value='error' disabled>
                                                        Error loading
                                                    </SelectItem>
                                                ) : (
                                                    sectiondata?.data?.map((item: any) => (
                                                        <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                            {item.asmC_SectionName}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.section && <FormError>{errors.section.message}</FormError>}
                            </div>
                        </div>
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
                            <Label htmlFor='student'>
                                Student Name:<span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <div className='flex w-full max-w-[400px] flex-col'>
                                <Controller
                                    name='student'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            //   key={field.value || "empty"}
                                            //   onValueChange={(val) => {
                                            //     const id = Number(val);
                                            //     field.onChange(id);
                                            //     setstudentWise(id);
                                            //   }}
                                            //   value={
                                            //     typeof field.value === "number" ||
                                            //     typeof field.value === "string"
                                            //       ? String(field.value)
                                            //       : ""
                                            //   }

                                            key={field.value}
                                            value={field.value && field.value !== 0 ? String(field.value) : undefined}
                                            onValueChange={(val) => field.onChange(Number(val))}>
                                            <SelectTrigger className='min-w-[400px] text-center'>
                                                <SelectValue placeholder='--Select student --' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {studentDetailsLoading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : studentDetailsError ? (
                                                    <SelectItem value='error' disabled>
                                                        Error loading
                                                    </SelectItem>
                                                ) : studentDetails.length === 0 ? (
                                                    <SelectItem value='nodata' disabled>
                                                        No Results
                                                    </SelectItem>
                                                ) : (
                                                    studentDetails?.map((item: any) => (
                                                        <SelectItem key={item.amsT_Id} value={item.amsT_Id.toString()}>
                                                            {item.studentName}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.student && <FormError>{errors.student.message}</FormError>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor='remarks' className='inline-flex cursor-pointer items-center space-x-2'>
                                Remarks: <span className='ml-1 text-red-500'>*</span>
                            </Label>

                            <Controller
                                name='remarks'
                                control={control}
                                render={({ field }) => (
                                    <textarea
                                        id='remarks'
                                        rows={5}
                                        {...field}
                                        className='mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm'
                                    />
                                )}
                            />

                            {errors.remarks && <FormError>{errors.remarks.message}</FormError>}
                        </div>
                    </div>

                    <div className='flex-1 space-y-6'>
                        <div>
                            <Label htmlFor='date'>
                                Date:<span className='ml-1 text-red-500'>*</span>
                            </Label>

                            <Controller
                                name='date'
                                control={control}
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant='outline' className='w-full justify-start text-left font-normal'>
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {field.value ? format(field.value, 'PPP') : 'Select Date'}
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar
                                                mode='single'
                                                selected={field.value}
                                                onSelect={(date) => field.onChange(date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />

                            {errors.date && <FormError>{errors.date.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Type:<span className='ml-1 text-red-500'>*</span>
                            </Label>
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
                                Group List:<span className='ml-1 text-red-500'>*</span>
                            </label>
                            <div className='group flex flex-col gap-1.5 md:col-span-2'>
                                <div className='min-h-[40px] rounded-md border bg-white px-3 py-2'>
                                    {/* <input
                    type="text"
                    placeholder="Search Group Name"
                    className="mb-2 w-full rounded border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                  /> */}
                                    <div className='flex max-h-40 flex-col gap-2 overflow-y-auto'>
                                        {groupListLoading ? (
                                            <span className='text-gray-400 text-sm'>Loading Groups...</span>
                                        ) : groupList.length > 0 ? (
                                            groupList.map((grp) => {
                                                const optVal = Number(grp.fmG_Id);
                                                return (
                                                    <label
                                                        key={grp.fmG_Id}
                                                        className='flex cursor-pointer items-center rounded p-1 hover:bg-gray-50'>
                                                        <input
                                                            type='checkbox'
                                                            value={grp.fmG_Id}
                                                            checked={selectedGroups.includes(optVal)}
                                                            onChange={async (e) => {
                                                                const checked = e.target.checked;
                                                                const newSelected = checked
                                                                    ? [...selectedGroups, optVal]
                                                                    : selectedGroups.filter((p) => p !== optVal);
                                                                setSelectedGroups(newSelected);
                                                            }}
                                                            className='mr-2 h-4 w-4 accent-blue-600'
                                                        />
                                                        <span className='truncate'>{grp.fmG_GroupName}</span>
                                                    </label>
                                                );
                                            })
                                        ) : groupListError ? (
                                            <span className='text-gray-400 text-sm'>Error loading</span>
                                        ) : (
                                            <span className='text-gray-400 text-sm'>No Results</span>
                                        )}
                                    </div>
                                    {selectedGroups.length > 0 && (
                                        <div className='mt-2 text-blue-600 text-sm'>{selectedGroups.length} head(s) selected</div>
                                    )}
                                </div>
                            </div>
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
                                    <div className='mt-2 flex items-center gap-3'>
                                        <div className='text-gray-600 text-sm'>{photoFile.name}</div>

                                        <Button type='button' variant='secondary' onClick={() => setIsViewing(true)} className='px-3'>
                                            View
                                        </Button>

                                        <Button
                                            type='button'
                                            variant='ghost'
                                            onClick={() => {
                                                setPhotoFile(null);
                                                setPhotoPreview(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}>
                                            <Trash className='text-red-600' />
                                        </Button>
                                    </div>
                                )}
                                {isViewing && photoPreview && (
                                    <div
                                        onClick={() => setIsViewing(false)}
                                        className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'>
                                        <img src={photoPreview} alt='preview' className='max-h-[90%] max-w-[150%] rounded-lg shadow-lg' />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='grid grid-cols-1 gap-2 md:grid-cols-1 '>
                    <div className='container mx-auto w-[1000px] space-y-4 p-1'>
                        {' '}
                        <CollapsibleSection
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <GenericDataTable
                                {...tableProps}
                                columns={feeHeads}
                                onRowSelectionChange={handleSelectHead}
                                isLoading={headListLoading}
                                error={headListError}
                                columnPinning={{ right: ['actions'] }}
                                loadingMessage='Loading Student Head List...'
                                noDataTitle='No Student Head List Found'
                                noDataDescription='Get started by creating your first Student Head List'
                                errorTitle='Error Student Head List'
                                onSearchQueryChange={handleApiParmasChange}
                                showSearch={false}
                                searchQuery=''
                                showPagination={false}
                                currentApiParams={apisearchParams_}
                            />
                        </CollapsibleSection>
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
                            <Save className=' h-4 w-4' />
                            Save
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
