'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBookIssueInitialData, useIssueBook } from '@/hooks/library/useBookIssue';
import { Save, XCircle } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

export const IssueForm = ({ onSuccess }: { onSuccess?: () => void }) => {
    const { data: initialDataWrapper, isLoading: isInitialLoading } = useBookIssueInitialData({
        booktype: 'issue',
        issuertype: 'std',
        bookcat_type: 'book'
    });
    const initialData = (initialDataWrapper as any)?.data || initialDataWrapper;

    const _issueBookMutation = useIssueBook();

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            libraryName: '',
            memberType: 'STUDENT',
            materialType: 'BOOK',
            transactionType: 'ISSUE',
            academicYear: '',
            class: '',
            section: '',
            barcode: '',
            bookTitle: '',
            studentName: '',
            bookAvailability: false,
            sendPushNotification: false
        }
    });

    const onSubmit = (_data: any) => {};

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='bg-white p-6'>
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-6'>
                    {/* Library Name */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[120px]'>
                            Library Name:<span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='libraryName'
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className='h-8 flex-1 text-xs'>
                                        <SelectValue placeholder='Library' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='Library'>Library</SelectItem>
                                        {Array.isArray(initialData?.liblist) &&
                                            initialData?.liblist?.map((item: any) => (
                                                <SelectItem key={item.lmA_Id} value={item.lmA_Id.toString()}>
                                                    {item.lmA_LibraryName}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {/* Radio Settings */}
                    <div className='space-y-2 divide-y rounded-md border bg-slate-50/30 p-2'>
                        <Controller
                            control={control}
                            name='memberType'
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className='flex flex-wrap justify-center gap-8 py-1'>
                                    {['STUDENT', 'STAFF', 'DEPARTMENT', 'GUEST'].map((opt) => (
                                        <div key={opt} className='flex items-center space-x-2'>
                                            <RadioGroupItem value={opt} id={`m-${opt}`} />
                                            <Label htmlFor={`m-${opt}`} className='cursor-pointer font-semibold text-xs'>
                                                {opt}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                        <Controller
                            control={control}
                            name='materialType'
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className='flex flex-wrap justify-center gap-8 py-2'>
                                    {['BOOK', 'NON-BOOK'].map((opt) => (
                                        <div key={opt} className='flex items-center space-x-2'>
                                            <RadioGroupItem value={opt} id={`mat-${opt}`} />
                                            <Label htmlFor={`mat-${opt}`} className='cursor-pointer font-semibold text-xs'>
                                                {opt}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                        <Controller
                            control={control}
                            name='transactionType'
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className='flex flex-wrap justify-center gap-8 py-2'>
                                    {['ISSUE', 'REFERENCE'].map((opt) => (
                                        <div key={opt} className='flex items-center space-x-2'>
                                            <RadioGroupItem value={opt} id={`t-${opt}`} />
                                            <Label htmlFor={`t-${opt}`} className='cursor-pointer font-semibold text-xs'>
                                                {opt}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                    </div>

                    {/* Academic Fields */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px]'>
                                Academic Year:<span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='academicYear'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className='h-8 flex-1 text-xs'>
                                            <SelectValue placeholder='Select Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(initialData?.yearlist) &&
                                                initialData?.yearlist?.map((item: any) => (
                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px]'>
                                Class:<span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='class'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className='h-8 flex-1 text-xs'>
                                            <SelectValue placeholder='Select Class' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(initialData?.classlist) &&
                                                initialData?.classlist?.map((item: any) => (
                                                    <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                        {item.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px]'>
                                Section:<span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='section'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className='h-8 flex-1 text-xs'>
                                            <SelectValue placeholder='Select Section' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(initialData?.sectionlist) &&
                                                initialData?.sectionlist?.map((item: any) => (
                                                    <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                        {item.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    {/* Book & Student Selectors */}
                    <div className='mt-4 space-y-3'>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px] uppercase'>BARCODE:</Label>
                            <Controller
                                control={control}
                                name='barcode'
                                render={({ field }) => <Input {...field} placeholder='Barcode Scanner' className='h-8 text-xs' />}
                            />
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px]'>
                                Book Title:<span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='bookTitle'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className='h-8 flex-1 text-xs'>
                                            <SelectValue placeholder='Select or search Book in the list...' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(initialData?.avilbooktitle) &&
                                                initialData?.avilbooktitle?.map((item: any) => (
                                                    <SelectItem key={item.lmB_Id} value={item.lmB_Id.toString()}>
                                                        {item.lmB_BookTitle}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px]'>
                                Student Name:<span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='studentName'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className='h-8 flex-1 text-xs'>
                                            <SelectValue placeholder='Select or search Student Name...' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(initialData?.studentlist) &&
                                                initialData?.studentlist?.map((item: any) => (
                                                    <SelectItem key={item.amsT_Id} value={item.amsT_Id.toString()}>
                                                        {item.amsT_FirstName}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className='flex items-center gap-2 pt-2'>
                            <Controller
                                control={control}
                                name='bookAvailability'
                                render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id='avail' />}
                            />
                            <Label htmlFor='avail' className='font-semibold text-xs'>
                                BOOK AVAILABILITY
                            </Label>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className='space-y-6'>
                    {/* BOOK DETAILS CARD */}
                    <div className='relative rounded-md border bg-slate-50/10 p-4 pt-6'>
                        <div className='-mt-3 absolute top-0 right-0 left-0 flex justify-center'>
                            <span className='bg-white px-2 font-semibold text-muted-foreground text-xs tracking-wider'>BOOK DETAILS</span>
                        </div>

                        <div className='mt-2 grid grid-cols-2 gap-x-4 gap-y-3 font-medium text-slate-700 text-xs'>
                            <div className='flex'>
                                <span className='w-24'>Title</span>
                                <span>:</span>
                                <span className='ml-2 font-bold' />
                            </div>
                            <div className='flex'>
                                <span className='w-24'>Entry Date</span>
                                <span>:</span>
                                <span className='ml-2 font-bold' />
                            </div>

                            <div className='flex'>
                                <span className='w-24'>Vol. No.</span>
                                <span>:</span>
                                <span className='ml-2 font-bold' />
                            </div>
                            <div className='flex'>
                                <span className='w-24'>Class No</span>
                                <span>:</span>
                                <span className='ml-2 font-bold' />
                            </div>

                            <div className='flex'>
                                <span className='w-24'>Price</span>
                                <span>:</span>
                                <span className='ml-2 font-bold' />
                            </div>
                            <div className='flex'>
                                <span className='w-24'>Category Name</span>
                                <span>:</span>
                                <span className='ml-2 font-bold' />
                            </div>

                            <div className='flex'>
                                <span className='w-24'>Call No</span>
                                <span>:</span>
                                <span className='ml-2 font-bold' />
                            </div>
                            <div className='col-span-1' />

                            <div className='flex'>
                                <span className='w-24'>Author's Name</span>
                                <span>:</span>
                                <span className='ml-2 font-bold' />
                            </div>
                        </div>
                    </div>

                    {/* STUDENT DETAILS CARD */}
                    <div className='relative rounded-md border bg-slate-50/10 p-4 pt-10'>
                        <div className='-mt-3 absolute top-0 right-0 left-0 flex justify-center'>
                            <span className='bg-white px-2 font-semibold text-muted-foreground text-xs tracking-wider'>
                                STUDENT DETAILS
                            </span>
                        </div>

                        <div className='absolute top-2 right-4 w-40'>
                            <Input
                                placeholder='Scan QR Code'
                                className='h-7 border-blue-200 text-blue-500 text-xs placeholder:text-blue-300'
                            />
                        </div>

                        <div className='mt-2 flex'>
                            <div className='flex-1 space-y-3 font-medium text-slate-700 text-xs'>
                                <div className='flex'>
                                    <span className='w-28'>Student Name</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold' />
                                </div>
                                <div className='flex'>
                                    <span className='w-28'>Registration No</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold' />
                                </div>
                                <div className='flex'>
                                    <span className='w-28'>Admission No</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold' />
                                </div>
                                <div className='flex'>
                                    <span className='w-28'>Roll No</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold' />
                                </div>
                                <div className='flex'>
                                    <span className='w-28'>Class Name</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold' />
                                </div>
                                <div className='flex'>
                                    <span className='w-28'>Section Name</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold' />
                                </div>
                                <div className='flex'>
                                    <span className='w-28'>Parent's No.</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold' />
                                </div>
                            </div>
                            <div className='flex h-28 w-24 items-center justify-center rounded-md border border-dashed bg-slate-50 text-[10px] text-muted-foreground'>
                                Student Photo
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='mt-8 flex items-center justify-center gap-4'>
                <Button type='submit' className='h-8 min-w-[100px] rounded-sm bg-[#4251b1] px-6 py-1 text-xs shadow-sm hover:bg-[#35418e]'>
                    <Save className='mr-1.5 h-3.5 w-3.5' /> ISSUE
                </Button>
                <Button
                    type='button'
                    onClick={() => reset()}
                    className='h-8 min-w-[100px] rounded-sm bg-[#ff5a30] px-6 py-1 text-white text-xs shadow-sm hover:bg-[#e64d26]'>
                    <XCircle className='mr-1.5 h-3.5 w-3.5' /> CANCEL
                </Button>

                <div className='ml-4 flex items-center gap-2'>
                    <Controller
                        control={control}
                        name='sendPushNotification'
                        render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id='push' />}
                    />
                    <Label htmlFor='push' className='text-xs'>
                        Send Mobile Push Notification
                    </Label>
                </div>
            </div>
        </form>
    );
};
