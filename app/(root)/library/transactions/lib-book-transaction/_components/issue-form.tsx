'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
<<<<<<< HEAD
import { useBookDetailsOnLoad, useIssueBook } from '@/hooks/library/useBookIssue';
import { Loader2, Save, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

export const IssueForm = ({
    initialData: externalInitialData,
    isDataLoading: externalLoading,
    onSuccess
}: {
    initialData?: any;
    isDataLoading?: boolean;
    onSuccess?: () => void;
}) => {
    const { data: fetchedWrapper, isLoading: isFetchedLoading } = useBookDetailsOnLoad();

    const rawData = externalInitialData || fetchedWrapper?.data || fetchedWrapper;
    const isLoading = externalLoading ?? isFetchedLoading;

    const masterData = rawData?.masterData || {};

    const libraries = masterData?.libraries || rawData?.libraries || [];
    const years = rawData?.years || masterData?.years || [];
    const classes = rawData?.classes || masterData?.classes || [];
    const sections = rawData?.sections || masterData?.sections || [];
    const books = rawData?.books || [];
    const students = rawData?.students || masterData?.students || [];
    const currentYear = rawData?.currentYear || masterData?.currentYear || [];
    
    const defaultLibraryId = masterData?.libraryId ? String(masterData.libraryId) : (libraries[0]?.lmaL_Id ? String(libraries[0].lmaL_Id) : '');
    const defaultYearId = currentYear[0]?.asmaY_Id ? String(currentYear[0].asmaY_Id) : (years[0]?.asmaY_Id ? String(years[0].asmaY_Id) : '');

    const { control, handleSubmit, watch, reset, setValue } = useForm({
=======
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBookIssueInitialData, useIssueBook, useStudentsByClassSection } from '@/hooks/library/useBookIssue';
import { Save, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export const IssueForm = ({ onSuccess }: { onSuccess?: () => void }) => {
    const { data: initialDataWrapper, isLoading: isInitialLoading } = useBookIssueInitialData({
        booktype: 'issue',
        issuertype: 'std',
        bookcat_type: 'book'
    });
    const initialData = (initialDataWrapper as any)?.data || initialDataWrapper;

    const issueBookMutation = useIssueBook();

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm({
>>>>>>> 2570db6124a1ee543d4a09e7366d6029e96d5244
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

<<<<<<< HEAD
    // Auto-set default Library Name and Academic Year when initial data arrives
    useEffect(() => {
        if (defaultLibraryId && !watch('libraryName')) {
            setValue('libraryName', defaultLibraryId);
=======
    const asmayId = watch('academicYear');
    const asmclId = watch('class');
    const asmsId = watch('section');

    const { mutate: fetchStudents } = useStudentsByClassSection();
    const [dynamicStudents, setDynamicStudents] = useState<any[]>([]);

    useEffect(() => {
        if (asmayId && asmclId && asmsId) {
            fetchStudents(
                {
                    ASMAY_Id: Number.parseInt(asmayId),
                    ASMCL_Id: Number.parseInt(asmclId),
                    ASMS_Id: Number.parseInt(asmsId)
                },
                {
                    onSuccess: (res: any) => {
                        const students = res?.studentlist || res?.students || res?.data?.students || [];
                        setDynamicStudents(students);
                    }
                }
            );
        } else {
            setDynamicStudents([]);
>>>>>>> 2570db6124a1ee543d4a09e7366d6029e96d5244
        }
        if (defaultYearId && !watch('academicYear')) {
            setValue('academicYear', defaultYearId);
        }
    }, [defaultLibraryId, defaultYearId, setValue, watch]);

<<<<<<< HEAD
    const barcodeValue = watch('barcode');
    const bookTitleValue = watch('bookTitle');
    const studentNameValue = watch('studentName');
    const classValue = watch('class');
    const sectionValue = watch('section');

    // Handle Barcode matching
    useEffect(() => {
        if (barcodeValue && books.length > 0) {
            const matchedBook = books.find(
                (b: any) =>
                    b.lmbanO_AccessionNo?.toLowerCase() === barcodeValue.trim().toLowerCase() ||
                    b.lmB_Id?.toString() === barcodeValue.trim()
            );
            if (matchedBook && matchedBook.lmB_Id?.toString() !== bookTitleValue) {
                setValue('bookTitle', matchedBook.lmB_Id.toString());
            }
        }
    }, [barcodeValue, books, bookTitleValue, setValue]);

    // Selected Book details
    const selectedBook = books.find((b: any) => b.lmB_Id?.toString() === bookTitleValue);

    // Selected Student details
    const selectedStudent = students.find((s: any) => s.amsT_Id?.toString() === studentNameValue);

    // Selected Class Name
    const selectedClassName = classes.find((c: any) => c.asmcL_Id?.toString() === classValue)?.asmcL_ClassName || '';

    // Selected Section Name
    const selectedSectionName = sections.find((s: any) => s.asmS_Id?.toString() === sectionValue)?.asmC_SectionName || '';

    // Formatted student full name
    const studentFullName = selectedStudent
        ? [selectedStudent.amsT_FirstName, selectedStudent.amsT_MiddleName, selectedStudent.amsT_LastName].filter(Boolean).join(' ')
        : '';
=======
    const studentsToDisplay = dynamicStudents.length > 0 ? dynamicStudents : initialData?.studentlist || initialData?.students || [];
>>>>>>> 2570db6124a1ee543d4a09e7366d6029e96d5244

    const onSubmit = (data: any) => {
        console.log('Issue Book Form Data:', data);
        if (onSuccess) onSuccess();
    };

    if (isLoading) {
        return (
            <div className='flex items-center justify-center p-12 text-slate-500 gap-2'>
                <Loader2 className='h-5 w-5 animate-spin' />
                <span>Loading transaction details...</span>
            </div>
        );
    }

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
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
<<<<<<< HEAD
                                    <SelectTrigger className='flex-1 h-8 text-xs'>
                                        <SelectValue placeholder='Select Library' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {libraries.map((item: any) => (
                                            <SelectItem key={item.lmaL_Id} value={item.lmaL_Id.toString()}>
                                                {item.lmaL_LibraryName}
                                            </SelectItem>
                                        ))}
=======
                                    <SelectTrigger className='h-8 flex-1 text-xs'>
                                        <SelectValue placeholder='Library' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='Library'>Library</SelectItem>
                                        {Array.isArray(initialData?.msterliblist || initialData?.liblist) &&
                                            (initialData?.msterliblist || initialData?.liblist)?.map((item: any) => (
                                                <SelectItem
                                                    key={item.lmaL_Id || item.lmA_Id}
                                                    value={(item.lmaL_Id || item.lmA_Id).toString()}>
                                                    {item.lmaL_LibraryName || item.lmA_LibraryName}
                                                </SelectItem>
                                            ))}
>>>>>>> 2570db6124a1ee543d4a09e7366d6029e96d5244
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
<<<<<<< HEAD
                                <RadioGroup onValueChange={field.onChange} value={field.value} className='flex flex-wrap justify-center gap-8 py-1'>
=======
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className='flex flex-wrap justify-center gap-8 py-1'>
>>>>>>> 2570db6124a1ee543d4a09e7366d6029e96d5244
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
<<<<<<< HEAD
                                <RadioGroup onValueChange={field.onChange} value={field.value} className='flex flex-wrap justify-center gap-8 py-2'>
=======
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className='flex flex-wrap justify-center gap-8 py-2'>
>>>>>>> 2570db6124a1ee543d4a09e7366d6029e96d5244
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
<<<<<<< HEAD
                                <RadioGroup onValueChange={field.onChange} value={field.value} className='flex flex-wrap justify-center gap-8 py-2'>
=======
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className='flex flex-wrap justify-center gap-8 py-2'>
>>>>>>> 2570db6124a1ee543d4a09e7366d6029e96d5244
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
<<<<<<< HEAD
                            <Label className='min-w-[120px]'>Academic Year:<span className='text-red-500'>*</span></Label>
                            <Controller control={control} name='academicYear' render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <SelectTrigger className='flex-1 h-8 text-xs'><SelectValue placeholder='Select Year' /></SelectTrigger>
                                    <SelectContent>
                                        {years.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>{item.asmaY_Year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px]'>Class:<span className='text-red-500'>*</span></Label>
                            <Controller control={control} name='class' render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <SelectTrigger className='flex-1 h-8 text-xs'><SelectValue placeholder='Select Class' /></SelectTrigger>
                                    <SelectContent>
                                        {classes.map((item: any) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>{item.asmcL_ClassName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px]'>Section:<span className='text-red-500'>*</span></Label>
                            <Controller control={control} name='section' render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <SelectTrigger className='flex-1 h-8 text-xs'><SelectValue placeholder='Select Section' /></SelectTrigger>
                                    <SelectContent>
                                        {sections.map((item: any) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>{item.asmC_SectionName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
=======
                            <Label className='min-w-[120px]'>
                                Academic Year:<span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='academicYear'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value || undefined}>
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
                                    <Select onValueChange={field.onChange} value={field.value || undefined}>
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
                                    <Select onValueChange={field.onChange} value={field.value || undefined}>
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
>>>>>>> 2570db6124a1ee543d4a09e7366d6029e96d5244
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
<<<<<<< HEAD
                            <Label className='min-w-[120px]'>Book Title:<span className='text-red-500'>*</span></Label>
                            <Controller control={control} name='bookTitle' render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <SelectTrigger className='flex-1 h-8 text-xs'><SelectValue placeholder='Select or search Book in the list...' /></SelectTrigger>
                                    <SelectContent>
                                        {books.map((item: any) => (
                                            <SelectItem key={item.lmB_Id} value={item.lmB_Id.toString()}>
                                                {item.lmB_BookTitle} {item.lmbanO_AccessionNo ? `(Acc No: ${item.lmbanO_AccessionNo})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px]'>Student Name:<span className='text-red-500'>*</span></Label>
                            <Controller control={control} name='studentName' render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <SelectTrigger className='flex-1 h-8 text-xs'><SelectValue placeholder='Select or search Student Name...' /></SelectTrigger>
                                    <SelectContent>
                                        {students.map((item: any) => {
                                            const name = [item.amsT_FirstName, item.amsT_MiddleName, item.amsT_LastName].filter(Boolean).join(' ');
                                            return (
                                                <SelectItem key={item.amsT_Id} value={item.amsT_Id.toString()}>
                                                    {name} {item.amsT_AdmNo ? `(${item.amsT_AdmNo})` : ''}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className='flex items-center gap-2 pt-2'>
                            <Controller control={control} name='bookAvailability' render={({ field }) => (
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} id='avail' />
                            )} />
                            <Label htmlFor='avail' className='text-xs font-semibold cursor-pointer'>BOOK AVAILABILITY</Label>
=======
                            <Label className='min-w-[120px]'>
                                Book Title:<span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='bookTitle'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                                        <SelectTrigger className='h-8 flex-1 text-xs'>
                                            <SelectValue placeholder='Select or search Book in the list...' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(initialData?.booktitle || initialData?.avilbooktitle) &&
                                                (initialData?.booktitle || initialData?.avilbooktitle)?.map((item: any) => (
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
                                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                                        <SelectTrigger className='h-8 flex-1 text-xs'>
                                            <SelectValue placeholder='Select or search Student Name...' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(studentsToDisplay) &&
                                                studentsToDisplay?.map((item: any) => (
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
>>>>>>> 2570db6124a1ee543d4a09e7366d6029e96d5244
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
<<<<<<< HEAD
                        
                        <div className='grid grid-cols-2 gap-x-4 gap-y-3 text-xs font-medium text-slate-700 mt-2'>
                            <div className='flex'><span className='w-24 text-slate-500'>Title</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedBook?.lmB_BookTitle || '-'}</span></div>
                            <div className='flex'><span className='w-24 text-slate-500'>Entry Date</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedBook?.lmB_EntryDate ? selectedBook.lmB_EntryDate.split('T')[0] : '-'}</span></div>
                            
                            <div className='flex'><span className='w-24 text-slate-500'>Vol. No.</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedBook?.lmB_VolNo || '-'}</span></div>
                            <div className='flex'><span className='w-24 text-slate-500'>Class No</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedBook?.lmB_ClassNo || '-'}</span></div>
                            
                            <div className='flex'><span className='w-24 text-slate-500'>Price</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedBook?.lmB_Price !== undefined && selectedBook?.lmB_Price !== null ? `₹${selectedBook.lmB_Price}` : '-'}</span></div>
                            <div className='flex'><span className='w-24 text-slate-500'>Category Name</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedBook?.lmC_Id ? `Category ${selectedBook.lmC_Id}` : '-'}</span></div>
                            
                            <div className='flex'><span className='w-24 text-slate-500'>Call No</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedBook?.mB_Call_No || selectedBook?.lmB_CallNo || '-'}</span></div>
                            <div className='col-span-1'></div>

                            <div className='flex'><span className='w-24 text-slate-500'>Author's Name</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedBook?.authorName || selectedBook?.lmB_AuthorName || '-'}</span></div>
=======

                        <div className='mt-2 grid grid-cols-2 gap-x-4 gap-y-3 font-medium text-slate-700 text-xs'>
                            <div className='flex'>
                                <span className='w-24'>Title</span>
                                <span>:</span>
                                <span className='ml-2 font-bold'></span>
                            </div>
                            <div className='flex'>
                                <span className='w-24'>Entry Date</span>
                                <span>:</span>
                                <span className='ml-2 font-bold'></span>
                            </div>

                            <div className='flex'>
                                <span className='w-24'>Vol. No.</span>
                                <span>:</span>
                                <span className='ml-2 font-bold'></span>
                            </div>
                            <div className='flex'>
                                <span className='w-24'>Class No</span>
                                <span>:</span>
                                <span className='ml-2 font-bold'></span>
                            </div>

                            <div className='flex'>
                                <span className='w-24'>Price</span>
                                <span>:</span>
                                <span className='ml-2 font-bold'></span>
                            </div>
                            <div className='flex'>
                                <span className='w-24'>Category Name</span>
                                <span>:</span>
                                <span className='ml-2 font-bold'></span>
                            </div>

                            <div className='flex'>
                                <span className='w-24'>Call No</span>
                                <span>:</span>
                                <span className='ml-2 font-bold'></span>
                            </div>
                            <div className='col-span-1'></div>

                            <div className='flex'>
                                <span className='w-24'>Author's Name</span>
                                <span>:</span>
                                <span className='ml-2 font-bold'></span>
                            </div>
>>>>>>> 2570db6124a1ee543d4a09e7366d6029e96d5244
                        </div>
                    </div>

                    {/* STUDENT DETAILS CARD */}
                    <div className='relative rounded-md border bg-slate-50/10 p-4 pt-10'>
                        <div className='-mt-3 absolute top-0 right-0 left-0 flex justify-center'>
                            <span className='bg-white px-2 font-semibold text-muted-foreground text-xs tracking-wider'>
                                STUDENT DETAILS
                            </span>
                        </div>

<<<<<<< HEAD
                        <div className='flex mt-2'>
                            <div className='flex-1 space-y-3 text-xs font-medium text-slate-700'>
                                <div className='flex'><span className='w-28 text-slate-500'>Student Name</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{studentFullName || '-'}</span></div>
                                <div className='flex'><span className='w-28 text-slate-500'>Registration No</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedStudent?.amsT_AdmNo || '-'}</span></div>
                                <div className='flex'><span className='w-28 text-slate-500'>Admission No</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedStudent?.amsT_AdmNo || '-'}</span></div>
                                <div className='flex'><span className='w-28 text-slate-500'>Roll No</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedStudent?.amaY_RollNo || '-'}</span></div>
                                <div className='flex'><span className='w-28 text-slate-500'>Class Name</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedClassName || '-'}</span></div>
                                <div className='flex'><span className='w-28 text-slate-500'>Section Name</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedSectionName || '-'}</span></div>
                                <div className='flex'><span className='w-28 text-slate-500'>Parent's No.</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedStudent?.mobileNo || selectedStudent?.amsT_MobileNo || '-'}</span></div>
=======
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
                                    <span className='ml-2 font-bold'></span>
                                </div>
                                <div className='flex'>
                                    <span className='w-28'>Registration No</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold'></span>
                                </div>
                                <div className='flex'>
                                    <span className='w-28'>Admission No</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold'></span>
                                </div>
                                <div className='flex'>
                                    <span className='w-28'>Roll No</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold'></span>
                                </div>
                                <div className='flex'>
                                    <span className='w-28'>Class Name</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold'></span>
                                </div>
                                <div className='flex'>
                                    <span className='w-28'>Section Name</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold'></span>
                                </div>
                                <div className='flex'>
                                    <span className='w-28'>Parent's No.</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold'></span>
                                </div>
>>>>>>> 2570db6124a1ee543d4a09e7366d6029e96d5244
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
<<<<<<< HEAD
                
                <div className='flex items-center gap-2 ml-4'>
                    <Controller control={control} name='sendPushNotification' render={({ field }) => (
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} id='push' />
                    )} />
                    <Label htmlFor='push' className='text-xs cursor-pointer'>Send Mobile Push Notification</Label>
=======

                <div className='ml-4 flex items-center gap-2'>
                    <Controller
                        control={control}
                        name='sendPushNotification'
                        render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id='push' />}
                    />
                    <Label htmlFor='push' className='text-xs'>
                        Send Mobile Push Notification
                    </Label>
>>>>>>> 2570db6124a1ee543d4a09e7366d6029e96d5244
                </div>
            </div>
        </form>
    );
};

