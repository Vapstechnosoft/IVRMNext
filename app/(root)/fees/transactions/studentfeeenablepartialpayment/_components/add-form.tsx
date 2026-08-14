'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    useStudentFeeEnablePartialPayment,
    useopeningacademicyerdropdowndatafee,
    useopeningClassdropdowndatafee,
    useopeningSectiondropdowndatafee
} from '@/hooks/fees/useTrasactions';
import { studentFeeEnablePartialPaymentSchema } from '@/schemas/fees/trasactions';
import { studentNameDropdown } from '@/server/fees/trasactions/fee_opening_balance';
import { saveStudentFeeEnablePartialPayment } from '@/server/fees/trasactions/student_fee_enable_partial_payment';
import type {
    IFeeOpeningAcademicyearDropDownList,
    IFeeOpeningClassDropdownList,
    IFeeOpeningSectionDropdownList,
    IStudentFeeEnablePartialPaymentSavePayload
} from '@/types/fees/transactions/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof studentFeeEnablePartialPaymentSchema.addOrUpdate>;

interface AddStudentFeeEnablePartialPaymentFormProps {
    onSuccess?: () => void;
    className?: string;
    initialData?: {
        yearlist?: IFeeOpeningAcademicyearDropDownList[];
        fillclass?: IFeeOpeningClassDropdownList[];
    };
}

export default function AddStudentFeeEnablePartialPaymentForm({
    onSuccess,
    className = '',
    initialData
}: AddStudentFeeEnablePartialPaymentFormProps) {
    const { data: serverResponse, refetchAll } = useStudentFeeEnablePartialPayment();
    const { data: academicYearData, isLoading: isLoadingAcademicYears } = useopeningacademicyerdropdowndatafee();
    const { data: classData, isLoading: isLoadingClasses } = useopeningClassdropdowndatafee();

    const [formKey, setFormKey] = useState(0);
    const [students, setStudents] = useState<any[]>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        clearErrors,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(studentFeeEnablePartialPaymentSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            asmaY_Id: undefined,
            asmcL_Id: undefined,
            amsC_Id: undefined,
            amsT_Id: undefined,
            fsepP_RemarksDate: '',
            fsepP_Remarks: ''
        }
    });

    const selectedYear = watch('asmaY_Id');
    const selectedClass = watch('asmcL_Id');
    const selectedSection = watch('amsC_Id');

    const { data: sectionData, isLoading: isLoadingSections } = useopeningSectiondropdowndatafee(
        selectedYear ? Number(selectedYear) : 0,
        selectedClass && selectedClass !== 'ALL' ? Number(selectedClass) : 0
    );

    const yearlist: IFeeOpeningAcademicyearDropDownList[] =
        (Array.isArray(academicYearData?.data) ? academicYearData.data : null) ??
        (Array.isArray(academicYearData) ? (academicYearData as any) : null) ??
        initialData?.yearlist ??
        (serverResponse?.data as any)?.yearlist ??
        (serverResponse as any)?.yearlist ??
        [];

    const classlist: IFeeOpeningClassDropdownList[] =
        (Array.isArray(classData?.data) ? classData.data : null) ??
        (Array.isArray(classData) ? (classData as any) : null) ??
        initialData?.fillclass ??
        (serverResponse?.data as any)?.fillclass ??
        (serverResponse as any)?.fillclass ??
        [];

    const sections: IFeeOpeningSectionDropdownList[] =
        (Array.isArray(sectionData?.data) ? sectionData.data : null) ??
        (Array.isArray(sectionData) ? (sectionData as any) : null) ??
        (Array.isArray((sectionData as any)?.sectionlist) ? (sectionData as any).sectionlist : null) ??
        (Array.isArray((sectionData as any)?.fillsection) ? (sectionData as any).fillsection : null) ??
        [];

    // Load students when academic year, class, and section change
    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) {
            setStudents([]);
            return;
        }

        let isMounted = true;
        setIsLoadingStudents(true);

        const fetchStudents = async () => {
            try {
                const payload = {
                    asmay_Id: Number(selectedYear),
                    fillClasFlg: String(selectedClass),
                    fillSecCls: selectedSection === '0' ? '0' : String(selectedSection),
                    filterInitialData: 'NameRegNo',
                    studentType: 'Active'
                };

                const res = await studentNameDropdown(payload);
                if (!isMounted) return;

                const studentlist =
                    (res?.data as any) ??
                    (res as any)?.studentlist ??
                    (Array.isArray(res) ? res : []);

                if (Array.isArray(studentlist) && studentlist.length > 0) {
                    setStudents(studentlist);
                } else {
                    setStudents([]);
                    toast.info('No Student found for selected Class and Section');
                }
            } catch (error: any) {
                if (isMounted) {
                    toast.error(error?.message || 'Failed to load students');
                    setStudents([]);
                }
            } finally {
                if (isMounted) setIsLoadingStudents(false);
            }
        };

        fetchStudents();

        return () => {
            isMounted = false;
        };
    }, [selectedYear, selectedClass, selectedSection]);

    // Handle Class Change
    const handleClassChange = (classIdStr: string) => {
        setValue('asmcL_Id', classIdStr);
        setValue('amsC_Id', undefined as any);
        setValue('amsT_Id', undefined as any);
        setStudents([]);
    };

    // Handle Section Change
    const handleSectionChange = (sectionIdStr: string) => {
        setValue('amsC_Id', sectionIdStr);
        setValue('amsT_Id', undefined as any);
        setStudents([]);
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const selectedStudent = students.find(
                (s: any) => (s.amst_Id ?? s.amsT_Id ?? s.AMST_Id) === Number(data.amsT_Id)
            );
            const selectedYearObj = yearlist.find(
                (y: any) => (y.asmaY_Id ?? y.ASMAY_Id) === Number(data.asmaY_Id)
            );

            const payload: IStudentFeeEnablePartialPaymentSavePayload = {
                FSEPP_Id: 0,
                ASMAY_Id: Number(data.asmaY_Id),
                AMST_Id: Number(data.amsT_Id),
                FSEPP_RemarksDate: new Date(data.fsepP_RemarksDate).toISOString(),
                FSEPP_Remarks: data.fsepP_Remarks.trim(),
                ASMAY_Year: selectedYearObj?.asmaY_Year ?? '',
                AMST_FirstName: selectedStudent?.amsT_FirstName ?? selectedStudent?.firstName ?? '',
                AMST_MiddleName: selectedStudent?.amsT_MiddleName ?? selectedStudent?.middleName ?? '',
                AMST_LastName: selectedStudent?.amsT_LastName ?? selectedStudent?.lastName ?? '',
                AMST_AdmNo: selectedStudent?.amsT_AdmNo ?? selectedStudent?.admNo ?? '',
                AMST_RegistrationNo: selectedStudent?.amsT_RegistrationNo ?? selectedStudent?.registrationNo ?? '',
                retrunMsg: '',
                alldata: [],
                yearlist: [],
                fillclass: [],
                fillsection: [],
                sectionlist: [],
                studentlist: []
            };

            const response = await saveStudentFeeEnablePartialPayment(payload);

            if (
                response &&
                (response.retrunMsg === 'Add' ||
                    response.retrunMsg === 'Update' ||
                    response.success ||
                    (response as any)?.data?.retrunMsg === 'Add')
            ) {
                toast.success('Record Saved Successfully');
                handleReset();
                refetchAll();
                onSuccess?.();
            } else if (response?.retrunMsg === 'false' || (response as any)?.data?.retrunMsg === 'false') {
                toast.error('Record Not saved / Updated');
            } else {
                toast.error(response?.message || 'Something Went Wrong Please Contact Administrator');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save record');
        }
    };

    const handleReset = () => {
        reset({
            asmaY_Id: undefined,
            asmcL_Id: undefined,
            amsC_Id: undefined,
            amsT_Id: undefined,
            fsepP_RemarksDate: '',
            fsepP_Remarks: ''
        });
        clearErrors();
        setStudents([]);
        setIsLoadingStudents(false);
        setFormKey((prev) => prev + 1);
    };

    return (
        <div className={`${className} w-full`}>
            <Card className='mx-auto w-full border-gray-200 shadow-sm'>
                <CardContent className='p-6'>
                    <form key={formKey} onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            {/* Left Column */}
                            <div className='space-y-5'>
                                {/* Academic Year */}
                                <div className='flex flex-col gap-1.5'>
                                    <Label htmlFor='asmaY_Id'>
                                        Academic Year <span className='text-destructive'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmaY_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value ? String(field.value) : ''}
                                                onValueChange={(val) => {
                                                    field.onChange(Number(val));
                                                    setValue('asmcL_Id', undefined as any);
                                                    setValue('amsC_Id', undefined as any);
                                                    setValue('amsT_Id', undefined as any);
                                                    setStudents([]);
                                                }}>
                                                <SelectTrigger id='asmaY_Id' className='w-full'>
                                                    {isLoadingAcademicYears ? (
                                                        <div className='flex items-center gap-2 text-muted-foreground'>
                                                            <Loader2 className='h-4 w-4 animate-spin' />
                                                            Loading academic years...
                                                        </div>
                                                    ) : (
                                                        <SelectValue placeholder='Select Academic Year' />
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {yearlist.map((year: any, idx: number) => {
                                                        const yearId = year.asmaY_Id ?? year.ASMAY_Id ?? year.asmaY_ID;
                                                        const yearName = year.asmaY_Year ?? year.ASMAY_Year ?? '';
                                                        if (yearId === undefined || yearId === null) return null;
                                                        return (
                                                            <SelectItem key={`year-${yearId}-${idx}`} value={String(yearId)}>
                                                                {yearName}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                                </div>

                                {/* Class */}
                                <div className='flex flex-col gap-1.5'>
                                    <Label htmlFor='asmcL_Id'>
                                        Class <span className='text-destructive'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmcL_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
                                                onValueChange={handleClassChange}
                                                disabled={!selectedYear || isLoadingClasses}>
                                                <SelectTrigger id='asmcL_Id' className='w-full'>
                                                    {isLoadingClasses ? (
                                                        <div className='flex items-center gap-2 text-muted-foreground'>
                                                            <Loader2 className='h-4 w-4 animate-spin' />
                                                            Loading classes...
                                                        </div>
                                                    ) : (
                                                        <SelectValue placeholder='Select Class' />
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='0'>All</SelectItem>
                                                    {classlist.map((cls: any, idx: number) => {
                                                        const classId = cls.asmcL_Id ?? cls.asmcL_ID ?? cls.ASMCL_Id ?? cls.ASMCL_ID;
                                                        const className = cls.asmcL_ClassName ?? cls.className ?? cls.ASMCL_ClassName ?? '';
                                                        if (classId === undefined || classId === null) return null;
                                                        return (
                                                            <SelectItem key={`class-${classId}-${idx}`} value={String(classId)}>
                                                                {className}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                                </div>

                                {/* Section */}
                                <div className='flex flex-col gap-1.5'>
                                    <Label htmlFor='amsC_Id'>
                                        Section <span className='text-destructive'>*</span>
                                    </Label>
                                    <Controller
                                        name='amsC_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
                                                onValueChange={handleSectionChange}
                                                disabled={isLoadingSections || selectedClass === undefined}>
                                                <SelectTrigger id='amsC_Id' className='w-full'>
                                                    {isLoadingSections ? (
                                                        <div className='flex items-center gap-2 text-muted-foreground'>
                                                            <Loader2 className='h-4 w-4 animate-spin' />
                                                            Loading sections...
                                                        </div>
                                                    ) : (
                                                        <SelectValue placeholder='Select Section' />
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sections.map((sec: any, idx: number) => {
                                                        const sectionId =
                                                            sec.asmS_Id ??
                                                            sec.ASMS_Id ??
                                                            sec.asms_Id ??
                                                            sec.asmS_ID ??
                                                            sec.amsS_Id ??
                                                            sec.amsC_Id ??
                                                            sec.AMSC_Id ??
                                                            sec.asmC_Id ??
                                                            sec.ASMC_Id ??
                                                            sec.amsC_ID;
                                                        const sectionName =
                                                            sec.asmC_SectionName ??
                                                            sec.ASMC_SectionName ??
                                                            sec.asmc_sectionname ??
                                                            sec.sectionName ??
                                                            sec.asmC_Sectionname ??
                                                            sec.sectionname ??
                                                            '';
                                                        if (sectionId === undefined || sectionId === null) return null;
                                                        return (
                                                            <SelectItem key={`section-${sectionId}-${idx}`} value={String(sectionId)}>
                                                                {sectionName}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.amsC_Id && <FormError>{errors.amsC_Id.message}</FormError>}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className='space-y-5'>
                                {/* Student */}
                                <div className='flex flex-col gap-1.5'>
                                    <Label htmlFor='amsT_Id'>
                                        Student <span className='text-destructive'>*</span>
                                    </Label>
                                    <Controller
                                        name='amsT_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                searchable={true}
                                                value={field.value ? String(field.value) : ''}
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                disabled={isLoadingStudents || !selectedSection}>
                                                <SelectTrigger id='amsT_Id' className='w-full'>
                                                    {isLoadingStudents ? (
                                                        <div className='flex items-center gap-2 text-muted-foreground'>
                                                            <Loader2 className='h-4 w-4 animate-spin' />
                                                            Loading students...
                                                        </div>
                                                    ) : (
                                                        <SelectValue placeholder='Select or search Student in the list' />
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {students.map((std: any, idx: number) => {
                                                        const studentId = std.amst_Id ?? std.amsT_Id ?? std.AMST_Id ?? std.amsT_ID;
                                                        const firstName = std.amsT_FirstName ?? std.firstName ?? '';
                                                        const middleName = std.amsT_MiddleName ?? std.middleName ?? '';
                                                        const lastName = std.amsT_LastName ?? std.lastName ?? '';
                                                        const admNo = std.amsT_AdmNo ?? std.admNo ?? '';
                                                        const fullName = [firstName, middleName, lastName]
                                                            .filter(Boolean)
                                                            .join(' ');
                                                        const displayText = admNo
                                                            ? `${admNo} : ${fullName}`
                                                            : fullName;
                                                        if (studentId === undefined || studentId === null) return null;

                                                        return (
                                                            <SelectItem
                                                                key={`student-${studentId}-${idx}`}
                                                                value={String(studentId)}
                                                                textValue={displayText}>
                                                                {displayText}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.amsT_Id && <FormError>{errors.amsT_Id.message}</FormError>}
                                </div>

                                {/* Request Date */}
                                <Controller
                                    name='fsepP_RemarksDate'
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <DateField
                                            label='Request Date'
                                            required
                                            field={field}
                                            fieldState={fieldState}
                                            placeholder='Select Date'
                                        />
                                    )}
                                />

                                {/* Remarks */}
                                <InputTextarea
                                    label='Remarks'
                                    required
                                    id='fsepP_Remarks'
                                    placeholder='Enter Remarks (max 500 characters)'
                                    rows={4}
                                    maxLength={500}
                                    {...control.register('fsepP_Remarks')}
                                    error={errors.fsepP_Remarks?.message}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-start'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleReset}
                                disabled={isSubmitting}
                                className='order-2 w-full transition-all duration-200 hover:scale-105 sm:order-1 sm:w-fit'>
                                <RotateCcw className='mr-2 h-4 w-4' />
                                Reset
                            </Button>
                            <Button
                                type='submit'
                                disabled={isSubmitting}
                                isLoading={isSubmitting}
                                loadingText='Saving...'
                                className='order-1 w-full shadow-md transition-all duration-200 hover:scale-105 sm:order-2 sm:w-fit'>
                                <Save className='mr-2 h-4 w-4' />
                                Save
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
