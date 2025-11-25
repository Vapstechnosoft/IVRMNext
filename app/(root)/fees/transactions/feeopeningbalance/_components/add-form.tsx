'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    useMasterFeeOpeningBalance,
    useopeningCategorydropdowndatafee,
    useopeningClassdropdowndatafee,
    useopeningGroupdropdowndatafee,
    useopeningHeaddropdowndatafee,
    useopeningInstallmentdropdowndatafee,
    useopeningSectiondropdowndatafee,
    useopeningacademicyerdropdowndatafee
} from '@/hooks/fees/useTrasactions';
import { feeOpeningBalanceSchema } from '@/schemas/fees/trasactions';
import { addOrUpdateFeeOpeningBalance, studentNameDropdown } from '@/server/fees/trasactions/fee_opening_balance';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feeOpeningBalanceSchema.addOrUpdate>;

interface AddFeeConfigProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddFeeOpeningBalanceForm({ onSuccess, className = '' }: AddFeeConfigProps) {
    const { refetchAll } = useMasterFeeOpeningBalance();

    const {
        control,
        handleSubmit,
        reset,
        resetField, // Added this
        formState: { isSubmitting, errors }
    } = useForm<FormFields>({
        resolver: zodResolver(feeOpeningBalanceSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            studentType: 'other',
            academicYearId: undefined,
            classId: undefined,
            sectionId: undefined,
            studentName: '',
            groupId: undefined,
            headId: undefined,
            installmentId: undefined,
            towards: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            paymentMode: 'B',
            bankId: undefined,
            chequeDate: format(new Date(), 'yyyy-MM-dd'),
            chequeNo: ''
        }
    });
    const [date, setDate] = useState(new Date());

    const academicYearId = useWatch({ control, name: 'academicYearId' });
    const classId = useWatch({ control, name: 'classId' });
    const headId = useWatch({ control, name: 'headId' });
    const groupId = useWatch({ control, name: 'groupId' });
    const { data: academicYear, isLoading: academicYearLoading } = useopeningacademicyerdropdowndatafee();
    const { data: classdata, isLoading: classloading } = useopeningClassdropdowndatafee();

    const { data: sectiondata, isLoading: sectionloading } = useopeningSectiondropdowndatafee(
        academicYearId ? Number(academicYearId) : 0,
        classId ? Number(classId) : 0
    );

    const { data: headdata, isLoading: headloading } = useopeningHeaddropdowndatafee();
    const { data: categorydata, isLoading: categoryloading } = useopeningCategorydropdowndatafee();
    const { data: groupdata, isLoading: grouploading } = useopeningGroupdropdowndatafee(headId ? Number(headId) : 0);
    const { data: installmentdata, isLoading: installmentloading } = useopeningInstallmentdropdowndatafee(
        academicYearId ? Number(academicYearId) : 0,
        groupId ? Number(groupId) : 0,
        headId ? Number(headId) : 0
    );

    const [selectionType, setSelectionType] = useState<string>('T');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string | null>(null);
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
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [studentDropdownList, setStudentDropdownList] = useState<any[]>([]);
    const [studentDropdownLoading, setStudentDropdownLoading] = useState(false);

    const showFeeGroup = useMemo(() => {
        return headdata && selecthead !== 'Other Allowances';
    }, [headdata]);

    const showFeeInstallment = useMemo(() => {
        return (
            selecthead === 'TRANSPORT FEE' &&
            feeGroup !== null &&
            ['TRANSPORT FEE', 'TRANSPORT OTHER FEE', 'TRANSPORT UKG AND LKG FEE'].includes(feeGroup)
        );
    }, [selecthead, feeGroup]);

    // Reset section when academic year or class changes
    useEffect(() => {
        resetField('sectionId');
    }, [academicYearId, classId, resetField]);

    useEffect(() => {
        if (selectionType === 'G' && academicYearId && classId && sectiondata?.data) {
            const fetchStudentDropdown = async () => {
                setStudentDropdownLoading(true);
                try {
                    const payload = {
                        asmay_Id: Number(academicYearId),
                        fillClasFlg: String(classId),
                        fillSecCls: String(sectiondata.data?.[0]?.asmS_Id) || 0,
                        filterInitialData: nameType === 'NameReg.No' ? 'NameRegNo' : 'RegNo',
                        studentType: activeType
                    };

                    const response = await studentNameDropdown(payload);
                    if (response?.data && Array.isArray(response.data)) {
                        const formattedStudents = response.data.map((student: any) => {
                            const fullName =
                                `${student.amsT_FirstName || ''} ${student.amsT_MiddleName || ''} ${student.amsT_LastName || ''}`.trim();
                            return {
                                value: String(student.amst_Id),
                                label: fullName
                            };
                        });
                        setStudentDropdownList(formattedStudents);
                    }
                } catch (error) {
                    console.error('Error fetching student dropdown:', error);
                } finally {
                    setStudentDropdownLoading(false);
                }
            };
            fetchStudentDropdown();
        }
    }, [selectionType, academicYearId, classId, sectiondata?.data, nameType, activeType]);

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

    const onSubmit: SubmitHandler<FormFields | any> = async (_data: FormFields) => {
        try {
            const payload = {
                mi_Id: 30,
                asmay_Id: Number(_data.academicYearId),
                fmg_Id: groupId ? Number(groupId) : 0,
                fmh_Id: Number(_data.headId),
                user_Id: 0,
                fillBusRouteStudents: 'string',
                filterrefund: refundableType === 'Refundable' ? 'Y' : 'N',
                fmoB_Entry_Date: selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") : new Date().toISOString(),

                saveTmpData: [
                    {
                        amst_Id: 0,
                        fmoB_Student_Due: 0,
                        fmoB_Institution_Due: 0,
                        checkedvalue: true
                    }
                ],
                tempHeadList: _data.installmentId ? [{ ftI_Id: Number(_data.installmentId) }] : [{ ftI_Id: 83 }],

                returnText: 'string',
                returnval: true,
                selectionType: selectionType,
                academicYear: selectedAcademicYear,
                category: selectionType === 'C' ? categoryWise : null,
                classdata: selectionType !== 'C' ? classdata : null,
                sectiondata: selectionType !== 'C' ? sectiondata : null,
                student: selectionType === 'G' ? studentWise : null,
                headdata: selecthead,
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
        setSelectedAcademicYear(null);
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
                        <Label className='min-w-[150px] text-right'>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='academicYearId'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                    <SelectTrigger className='min-w-[400px]'>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYearLoading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : (
                                            academicYear?.data?.map((item) => (
                                                <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.academicYearId && <FormError>{errors.academicYearId.message}</FormError>}

                        {selectionType === 'C' && (
                            <div>
                                <Label>Category*</Label>
                                <Controller
                                    name='categoryId'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                            <SelectTrigger className='min-w-[400px]'>
                                                <SelectValue placeholder='Select class ' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categoryloading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : (
                                                    categorydata?.data?.map((item) => (
                                                        <SelectItem key={item.fmcC_Id} value={String(item.fmcC_Id)}>
                                                            {item.fmcC_ClassCategoryName}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        )}
                        <>
                            <div>
                                <Label className='min-w-[150px] text-right'>
                                    Class* <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='classId'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                            <SelectTrigger className='min-w-[400px]'>
                                                <SelectValue placeholder='Select class ' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classloading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : (
                                                    classdata?.data?.map((item) => (
                                                        <SelectItem key={item.asmcL_Id} value={String(item.asmcL_Id)}>
                                                            {item.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.classId && <FormError>{errors.classId.message}</FormError>}
                            </div>

                            <div>
                                <Label>Section*</Label>
                                <Controller
                                    name='sectionId'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            value={field.value?.toString()}
                                            disabled={!classId} // Optional: disable until class is selected
                                        >
                                            <SelectTrigger className='min-w-[400px]'>
                                                <SelectValue placeholder={!classId ? 'Select Class first' : 'Select Section'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sectionloading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading sections...
                                                    </SelectItem>
                                                ) : !sectiondata?.data || sectiondata.data.length === 0 ? (
                                                    <SelectItem value='no-section' disabled>
                                                        No sections available
                                                    </SelectItem>
                                                ) : (
                                                    sectiondata.data.map((item) => (
                                                        <SelectItem key={item.asmS_Id} value={String(item.asmS_Id)}>
                                                            {item.asmC_SectionName}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.sectionId && <FormError>{errors.sectionId.message}</FormError>}
                            </div>
                        </>

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

                        <>
                            <div>
                                <Label>Fee Head*</Label>
                                <Controller
                                    name='headId'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                            <SelectTrigger className='min-w-[400px]'>
                                                <SelectValue placeholder='Select class ' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {headloading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : (
                                                    headdata?.data?.map((item) => (
                                                        <SelectItem key={item.fmH_Id} value={String(item.fmH_Id)}>
                                                            {item.fmH_FeeName}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.headId && <FormError>{errors.headId.message}</FormError>}
                            </div>

                            {showFeeGroup && (
                                <div>
                                    <Label>Fee Group*</Label>
                                    <Controller
                                        name='groupId'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                                disabled={!headId} // Optional: disable until class is selected
                                            >
                                                <SelectTrigger className='min-w-[400px]'>
                                                    <SelectValue placeholder={!headId ? 'Select head first' : 'Select Group'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {grouploading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading Groups...
                                                        </SelectItem>
                                                    ) : !groupdata?.data || groupdata.data.length === null ? (
                                                        <SelectItem value='no-Groups' disabled>
                                                            No Groups available
                                                        </SelectItem>
                                                    ) : (
                                                        groupdata.data.map((item) => (
                                                            <SelectItem key={item.fmG_Id} value={String(item.fmG_Id)}>
                                                                {item.fmG_GroupName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            )}
                        </>

                        {showFeeInstallment && (
                            <div>
                                <Label htmlFor='classes'>Fee Installment*</Label>
                                <Controller
                                    name='installmentId'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            value={field.value?.toString()}
                                            disabled={!groupId} // Optional: disable until class is selected
                                        >
                                            <SelectTrigger className='min-w-[400px]'>
                                                <SelectValue placeholder={!groupId ? 'Select group first' : 'Select Installment'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {installmentloading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading installments...
                                                    </SelectItem>
                                                ) : !installmentdata?.data || installmentdata.data.length === 0 ? (
                                                    <SelectItem value='no-installments' disabled>
                                                        No installments available
                                                    </SelectItem>
                                                ) : (
                                                    installmentdata.data.map((item) => (
                                                        <SelectItem key={item.ftI_Id} value={String(item.ftI_Id)}>
                                                            {item.ftI_Name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
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
                                    <Select onValueChange={setstudentWise} value={studentWise || ''} disabled={studentDropdownLoading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={studentDropdownLoading ? 'Loading students...' : 'Select Student'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {studentDropdownLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : !studentDropdownList || studentDropdownList.length === 0 ? (
                                                <SelectItem value='no-students' disabled>
                                                    No students available
                                                </SelectItem>
                                            ) : (
                                                studentDropdownList.map((student) => (
                                                    <SelectItem key={student.value} value={student.value}>
                                                        {student.label}
                                                    </SelectItem>
                                                ))
                                            )}
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
