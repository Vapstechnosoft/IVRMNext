'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useBookIssueInitialData, useIssueBook, useStudentsByClassSection } from '@/hooks/library/useBookIssue';
import { Loader2, Save, XCircle } from 'lucide-react';
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

    const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
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

    const asmayId = watch('academicYear');
    const asmclId = watch('class');
    const asmsId = watch('section');
    
    const { mutate: fetchStudents } = useStudentsByClassSection();
    const [dynamicStudents, setDynamicStudents] = useState<any[]>([]);

    useEffect(() => {
        if (asmayId && asmclId && asmsId) {
            fetchStudents({
                ASMAY_Id: parseInt(asmayId),
                ASMCL_Id: parseInt(asmclId),
                ASMS_Id: parseInt(asmsId)
            }, {
                onSuccess: (res: any) => {
                    const students = res?.studentlist || res?.students || res?.data?.students || [];
                    setDynamicStudents(students);
                }
            });
        } else {
            setDynamicStudents([]);
        }
    }, [asmayId, asmclId, asmsId, fetchStudents]);

    const studentsToDisplay = dynamicStudents.length > 0 ? dynamicStudents : (initialData?.studentlist || initialData?.students || []);

    const onSubmit = (data: any) => {
        // Handle issue submit logic here
        console.log('Issue Book Form Data:', data);
    };

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
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className='flex-1 h-8 text-xs'>
                                        <SelectValue placeholder='Library' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='Library'>Library</SelectItem>
                                        {Array.isArray(initialData?.msterliblist || initialData?.liblist) &&
                                            (initialData?.msterliblist || initialData?.liblist)?.map((item: any) => (
                                                <SelectItem key={item.lmaL_Id || item.lmA_Id} value={(item.lmaL_Id || item.lmA_Id).toString()}>{item.lmaL_LibraryName || item.lmA_LibraryName}</SelectItem>
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
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex flex-wrap justify-center gap-8 py-1'>
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
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex flex-wrap justify-center gap-8 py-2'>
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
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex flex-wrap justify-center gap-8 py-2'>
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
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className='flex-1 h-8 text-xs'><SelectValue placeholder='Select Year' /></SelectTrigger>
                                    <SelectContent>
                                        {Array.isArray(initialData?.yearlist) && initialData?.yearlist?.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>{item.asmaY_Year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px]'>Class:<span className='text-red-500'>*</span></Label>
                            <Controller control={control} name='class' render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className='flex-1 h-8 text-xs'><SelectValue placeholder='Select Class' /></SelectTrigger>
                                    <SelectContent>
                                        {Array.isArray(initialData?.classlist) && initialData?.classlist?.map((item: any) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>{item.asmcL_ClassName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px]'>Section:<span className='text-red-500'>*</span></Label>
                            <Controller control={control} name='section' render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className='flex-1 h-8 text-xs'><SelectValue placeholder='Select Section' /></SelectTrigger>
                                    <SelectContent>
                                        {Array.isArray(initialData?.sectionlist) && initialData?.sectionlist?.map((item: any) => (
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
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className='flex-1 h-8 text-xs'><SelectValue placeholder='Select or search Book in the list...' /></SelectTrigger>
                                    <SelectContent>
                                        {Array.isArray(initialData?.booktitle || initialData?.avilbooktitle) && (initialData?.booktitle || initialData?.avilbooktitle)?.map((item: any) => (
                                            <SelectItem key={item.lmB_Id} value={item.lmB_Id.toString()}>{item.lmB_BookTitle}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px]'>Student Name:<span className='text-red-500'>*</span></Label>
                            <Controller control={control} name='studentName' render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className='flex-1 h-8 text-xs'><SelectValue placeholder='Select or search Student Name...' /></SelectTrigger>
                                    <SelectContent>
                                        {Array.isArray(studentsToDisplay) && studentsToDisplay?.map((item: any) => (
                                            <SelectItem key={item.amsT_Id} value={item.amsT_Id.toString()}>{item.amsT_FirstName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className='flex items-center gap-2 pt-2'>
                            <Controller control={control} name='bookAvailability' render={({ field }) => (
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} id='avail' />
                            )} />
                            <Label htmlFor='avail' className='text-xs font-semibold'>BOOK AVAILABILITY</Label>
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
                            <div className='flex'><span className='w-24'>Title</span><span>:</span><span className='ml-2 font-bold'></span></div>
                            <div className='flex'><span className='w-24'>Entry Date</span><span>:</span><span className='ml-2 font-bold'></span></div>
                            
                            <div className='flex'><span className='w-24'>Vol. No.</span><span>:</span><span className='ml-2 font-bold'></span></div>
                            <div className='flex'><span className='w-24'>Class No</span><span>:</span><span className='ml-2 font-bold'></span></div>
                            
                            <div className='flex'><span className='w-24'>Price</span><span>:</span><span className='ml-2 font-bold'></span></div>
                            <div className='flex'><span className='w-24'>Category Name</span><span>:</span><span className='ml-2 font-bold'></span></div>
                            
                            <div className='flex'><span className='w-24'>Call No</span><span>:</span><span className='ml-2 font-bold'></span></div>
                            <div className='col-span-1'></div>

                            <div className='flex'><span className='w-24'>Author's Name</span><span>:</span><span className='ml-2 font-bold'></span></div>
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
                                <div className='flex'><span className='w-28'>Student Name</span><span>:</span><span className='ml-2 font-bold'></span></div>
                                <div className='flex'><span className='w-28'>Registration No</span><span>:</span><span className='ml-2 font-bold'></span></div>
                                <div className='flex'><span className='w-28'>Admission No</span><span>:</span><span className='ml-2 font-bold'></span></div>
                                <div className='flex'><span className='w-28'>Roll No</span><span>:</span><span className='ml-2 font-bold'></span></div>
                                <div className='flex'><span className='w-28'>Class Name</span><span>:</span><span className='ml-2 font-bold'></span></div>
                                <div className='flex'><span className='w-28'>Section Name</span><span>:</span><span className='ml-2 font-bold'></span></div>
                                <div className='flex'><span className='w-28'>Parent's No.</span><span>:</span><span className='ml-2 font-bold'></span></div>
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
                    <Label htmlFor='push' className='text-xs'>Send Mobile Push Notification</Label>
                </div>
            </div>
        </form>
    );
};
