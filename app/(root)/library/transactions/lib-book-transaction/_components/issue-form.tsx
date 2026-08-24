'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

    // Auto-set default Library Name and Academic Year when initial data arrives
    useEffect(() => {
        if (defaultLibraryId && !watch('libraryName')) {
            setValue('libraryName', defaultLibraryId);
        }
        if (defaultYearId && !watch('academicYear')) {
            setValue('academicYear', defaultYearId);
        }
    }, [defaultLibraryId, defaultYearId, setValue, watch]);

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
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                
                {/* Left Column */}
                <div className='space-y-6'>
                    {/* Library Name */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[120px]'>Library Name:<span className='text-red-500'>*</span></Label>
                        <Controller
                            control={control}
                            name='libraryName'
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <SelectTrigger className='flex-1 h-8 text-xs'>
                                        <SelectValue placeholder='Select Library' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {libraries.map((item: any) => (
                                            <SelectItem key={item.lmaL_Id} value={item.lmaL_Id.toString()}>
                                                {item.lmaL_LibraryName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {/* Radio Settings */}
                    <div className='border rounded-md divide-y p-2 space-y-2 bg-slate-50/30'>
                        <Controller
                            control={control}
                            name='memberType'
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} value={field.value} className='flex flex-wrap justify-center gap-8 py-1'>
                                    {['STUDENT', 'STAFF', 'DEPARTMENT', 'GUEST'].map((opt) => (
                                        <div key={opt} className='flex items-center space-x-2'>
                                            <RadioGroupItem value={opt} id={`m-${opt}`} />
                                            <Label htmlFor={`m-${opt}`} className='text-xs font-semibold cursor-pointer'>{opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                        <Controller
                            control={control}
                            name='materialType'
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} value={field.value} className='flex flex-wrap justify-center gap-8 py-2'>
                                    {['BOOK', 'NON-BOOK'].map((opt) => (
                                        <div key={opt} className='flex items-center space-x-2'>
                                            <RadioGroupItem value={opt} id={`mat-${opt}`} />
                                            <Label htmlFor={`mat-${opt}`} className='text-xs font-semibold cursor-pointer'>{opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                        <Controller
                            control={control}
                            name='transactionType'
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} value={field.value} className='flex flex-wrap justify-center gap-8 py-2'>
                                    {['ISSUE', 'REFERENCE'].map((opt) => (
                                        <div key={opt} className='flex items-center space-x-2'>
                                            <RadioGroupItem value={opt} id={`t-${opt}`} />
                                            <Label htmlFor={`t-${opt}`} className='text-xs font-semibold cursor-pointer'>{opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                    </div>

                    {/* Academic Fields */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-4'>
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
                        </div>
                    </div>

                    {/* Book & Student Selectors */}
                    <div className='space-y-3 mt-4'>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px] uppercase'>BARCODE:</Label>
                            <Controller control={control} name='barcode' render={({ field }) => (
                                <Input {...field} placeholder='Barcode Scanner' className='h-8 text-xs' />
                            )} />
                        </div>
                        <div className='flex items-center gap-4'>
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
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className='space-y-6'>
                    {/* BOOK DETAILS CARD */}
                    <div className='border rounded-md p-4 relative pt-6 bg-slate-50/10'>
                        <div className='absolute top-0 left-0 right-0 flex justify-center -mt-3'>
                            <span className='bg-white px-2 text-muted-foreground text-xs font-semibold tracking-wider'>BOOK DETAILS</span>
                        </div>
                        
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
                        </div>
                    </div>

                    {/* STUDENT DETAILS CARD */}
                    <div className='border rounded-md p-4 relative pt-10 bg-slate-50/10'>
                        <div className='absolute top-0 left-0 right-0 flex justify-center -mt-3'>
                            <span className='bg-white px-2 text-muted-foreground text-xs font-semibold tracking-wider'>STUDENT DETAILS</span>
                        </div>
                        
                        <div className='absolute top-2 right-4 w-40'>
                            <Input placeholder='Scan QR Code' className='h-7 text-xs text-blue-500 placeholder:text-blue-300 border-blue-200' />
                        </div>

                        <div className='flex mt-2'>
                            <div className='flex-1 space-y-3 text-xs font-medium text-slate-700'>
                                <div className='flex'><span className='w-28 text-slate-500'>Student Name</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{studentFullName || '-'}</span></div>
                                <div className='flex'><span className='w-28 text-slate-500'>Registration No</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedStudent?.amsT_AdmNo || '-'}</span></div>
                                <div className='flex'><span className='w-28 text-slate-500'>Admission No</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedStudent?.amsT_AdmNo || '-'}</span></div>
                                <div className='flex'><span className='w-28 text-slate-500'>Roll No</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedStudent?.amaY_RollNo || '-'}</span></div>
                                <div className='flex'><span className='w-28 text-slate-500'>Class Name</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedClassName || '-'}</span></div>
                                <div className='flex'><span className='w-28 text-slate-500'>Section Name</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedSectionName || '-'}</span></div>
                                <div className='flex'><span className='w-28 text-slate-500'>Parent's No.</span><span>:</span><span className='ml-2 font-bold text-slate-800'>{selectedStudent?.mobileNo || selectedStudent?.amsT_MobileNo || '-'}</span></div>
                            </div>
                            <div className='w-24 h-28 border border-dashed rounded-md flex items-center justify-center text-[10px] text-muted-foreground bg-slate-50'>
                                Student Photo
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Action Buttons */}
            <div className='mt-8 flex items-center justify-center gap-4'>
                <Button type='submit' className='h-8 px-6 py-1 text-xs min-w-[100px] bg-[#4251b1] hover:bg-[#35418e] shadow-sm rounded-sm'>
                    <Save className='mr-1.5 h-3.5 w-3.5' /> ISSUE
                </Button>
                <Button type='button' onClick={() => reset()} className='h-8 px-6 py-1 text-xs min-w-[100px] bg-[#ff5a30] hover:bg-[#e64d26] text-white shadow-sm rounded-sm'>
                    <XCircle className='mr-1.5 h-3.5 w-3.5' /> CANCEL
                </Button>
                
                <div className='flex items-center gap-2 ml-4'>
                    <Controller control={control} name='sendPushNotification' render={({ field }) => (
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} id='push' />
                    )} />
                    <Label htmlFor='push' className='text-xs cursor-pointer'>Send Mobile Push Notification</Label>
                </div>
            </div>
        </form>
    );
};

