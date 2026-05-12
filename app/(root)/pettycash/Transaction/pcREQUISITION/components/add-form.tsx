'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PcRequisitionFormValues, pcRequisitionSchema } from '@/schemas/pettycash/transaction/pcREQUISITION';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, Trash2, Loader2, Eye, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useDepartmentName, useEmployeeName, useParticularGetData } from '@/hooks/pettycash/transaction/pcREQUISITION';
import { IDepartmentName, IEmployeeName } from '@/types/pettycash/transaction/pcREQUISITION';
import { saveRequisition } from '@/server/pettycash/transaction/pcREQUISITION';

interface AddPcRequisitionFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddPcRequisitionForm({ onSuccess, className = '' }: AddPcRequisitionFormProps) {
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [previewFile, setPreviewFile] = useState<{ url: string; type: string } | null>(null);

    const { data: session } = useSession();
    const mi_id =
        (session as any)?.mi_id ||
        (session as any)?.mi_Id ||
        (session as any)?.user?.mi_Id ||
        (session as any)?.user?.mi_id ||
        0;

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<PcRequisitionFormValues>({
        resolver: zodResolver(pcRequisitionSchema.addOrUpdate),
        defaultValues: {
            departmentname: '',
            employeename: '',
            pcreqtN_Date: new Date(),
            pcreqtN_Purpose: '',
            requisitionDetails: [{ pcmparT_Id: '', pcreqtndE_Amount: 0, pcreqtndE_Remarks: '' }],
            requisitionDocuments: []
        }
    });

    const {
        fields: detailFields,
        append: appendDetail,
        remove: removeDetail
    } = useFieldArray({
        control,
        name: 'requisitionDetails'
    });

    const {
        fields: documentFields,
        append: appendDocument,
        remove: removeDocument
    } = useFieldArray({
        control,
        name: 'requisitionDocuments'
    });

    const detailsWatcher = watch('requisitionDetails');
    const watchedDepartmentId = watch('departmentname');

    // Fetch Departments
    const { data: departmentRes, isLoading: isLoadingDept } = useDepartmentName({ id: mi_id, enabled: true });

    // Fetch Employees based on selected department
    const { data: employeeRes, isLoading: isLoadingEmp } = useEmployeeName({ id: Number(watchedDepartmentId), enabled: !!watchedDepartmentId });

    const { data: particularRes, isLoading: isLoadingParticular } = useParticularGetData({ id: mi_id, enabled: true });

    const particulars = Array.isArray(particularRes)
        ? particularRes
        : particularRes?.data ?? particularRes?.data?.$values ?? [];
    // Safely extract arrays handling both direct array and nested API Response structures
    const departments: IDepartmentName[] = Array.isArray(departmentRes)
        ? departmentRes
        : departmentRes?.data ?? departmentRes?.data?.$values ?? [];

    const employees: IEmployeeName[] = Array.isArray(employeeRes)
        ? employeeRes
        : employeeRes?.data ?? employeeRes?.data?.$values ?? [];

    const totalAmount = detailsWatcher?.reduce((sum, item) => sum + (Number(item.pcreqtndE_Amount) || 0), 0) || 0;

    const onSubmit: SubmitHandler<PcRequisitionFormValues> = async (data) => {
        try {
            const payload = {
                pcreqtN_Id: 0,
                hrmD_Id: Number(data.departmentname) || 0,
                hrmE_Id: Number(data.employeename) || 0,
                pcreqtN_Purpose: data.pcreqtN_Purpose,
                pcreqtN_TotAmount: totalAmount,
                pcreqtN_Date: data.pcreqtN_Date.toISOString(),
                pC_Requisition_DetailsDTODetails: (data.requisitionDetails || []).map((item) => {
                    const selectedParticular = particulars.find((p: any) => Number(p.pcmparT_Id) === Number(item.pcmparT_Id));
                    return {
                        pcmparT_Id: Number(item.pcmparT_Id) || 0,
                        pcreqtndeT_Id: 0,
                        pcmparT_ParticularName: selectedParticular?.pcmparT_ParticularName || '',
                        pcreqtndeT_Amount: Number(item.pcreqtndE_Amount) || 0,
                        pcreqtndeT_Remarks: item.pcreqtndE_Remarks || ''
                    };
                }),
                uploaddocments: (data.requisitionDocuments || []).map((doc) => ({
                    pcreqtnuP_Id: '',
                    pcreqtnuP_FileName: doc.pcreqtndO_FileName || '',
                    pcreqtnuP_FileLocation: doc.pcreqtndO_FilePath || ''
                })),
                pcreqtndeT_Id: 0
            };

            console.log('Submitting requisition payload:', payload);

            const response = await saveRequisition(payload);

            if (response?.success) {
                toast.success(response.message);
                reset();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to save requisition');
            }
        } catch (error: any) {
            console.error("Save Error:", error);
            toast.error(error.message);
        }
    };

    return (
        <div className={className}>
            <form
                onSubmit={(e) => {
                    setHasSubmitted(true);
                    handleSubmit(onSubmit)(e);
                }}
                className='space-y-8'>

                {/* Section 1: PARTICULARS REQUISITION */}
                <div className='rounded-md border'>
                    <div className='bg-primary/5 border-b p-3 font-semibold text-primary uppercase text-sm'>
                        Particulars Requisition
                    </div>
                    <div className='p-4 space-y-6'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-1.5'>
                                <Label htmlFor='departmentname'>Department Name <span className='text-red-500'>*</span></Label>
                                <Controller
                                    control={control}
                                    name='departmentname'
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange}
                                            value={field.value || ''}
                                            disabled={isLoadingDept}>
                                            <SelectTrigger className={hasSubmitted && errors.departmentname ? 'border-red-500' : ''}>
                                                <SelectValue placeholder={isLoadingDept ? 'Loading...' : 'Select Department'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.hrmD_Id} value={dept.hrmD_Id.toString()}>
                                                        {dept.hrmD_DepartmentName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {hasSubmitted && errors.departmentname && <FormError>{errors.departmentname.message}</FormError>}
                            </div>

                            <div className='space-y-1.5'>
                                <Label htmlFor='pcreqtN_Date'>Date <span className='text-red-500'>*</span></Label>
                                <Controller
                                    control={control}
                                    name='pcreqtN_Date'
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value}
                                            setDate={field.onChange}
                                            className={hasSubmitted && errors.pcreqtN_Date ? 'border-red-500' : ''}
                                        />
                                    )}
                                />
                                {hasSubmitted && errors.pcreqtN_Date && <FormError>{errors.pcreqtN_Date.message as string}</FormError>}
                            </div>

                            <div className='space-y-1.5'>
                                <Label htmlFor='employeename'>Employee Name <span className='text-red-500'>*</span></Label>
                                <Controller
                                    control={control}
                                    name='employeename'
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange}
                                            value={field.value || ''}
                                            disabled={isLoadingEmp || !watchedDepartmentId}>
                                            <SelectTrigger className={hasSubmitted && errors.employeename ? 'border-red-500' : ''}>
                                                <SelectValue placeholder={isLoadingEmp ? 'Loading...' : 'Select Employee'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employees.map((emp) => (
                                                    <SelectItem key={emp.hrmE_Id} value={emp.hrmE_Id.toString()}>
                                                        {emp.empname}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {hasSubmitted && errors.employeename && <FormError>{errors.employeename.message}</FormError>}
                            </div>

                            <div className='space-y-1.5'>
                                <Label htmlFor='pcreqtN_Purpose'>Purpose <span className='text-red-500'>*</span></Label>
                                <Input
                                    id='pcreqtN_Purpose'
                                    placeholder='Enter purpose'
                                    {...register('pcreqtN_Purpose')}
                                    className={hasSubmitted && errors.pcreqtN_Purpose ? 'border-red-500' : ''}
                                />
                                {hasSubmitted && errors.pcreqtN_Purpose && <FormError>{errors.pcreqtN_Purpose.message}</FormError>}
                            </div>
                        </div>

                        {/* Particulars Grid */}
                        <div className="overflow-x-auto border rounded-md">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-purple-700 text-white">
                                    <tr>
                                        <th className="p-3 text-center border-r w-16">SLNO</th>
                                        <th className="p-3 text-center border-r min-w-[200px]">Particulars</th>
                                        <th className="p-3 text-center border-r w-40">Amount</th>
                                        <th className="p-3 text-center border-r">Remark</th>
                                        <th className="p-3 text-center w-20">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailFields.map((field, index) => (
                                        <tr key={field.id} className="border-b bg-white">
                                            <td className="p-3 text-center border-r">{index + 1}</td>
                                            <td className="p-3 border-r">
                                                <Controller
                                                    control={control}
                                                    name={`requisitionDetails.${index}.pcmparT_Id`}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoadingParticular} >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={isLoadingParticular ? "Loading..." : "Select Particular"} />
                                                            </SelectTrigger>

                                                            <SelectContent>
                                                                {particulars.map((item: any) => (
                                                                    <SelectItem
                                                                        key={item.pcmparT_Id}
                                                                        value={item.pcmparT_Id.toString()}
                                                                    >
                                                                        {item.pcmparT_ParticularName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </td>
                                            <td className="p-3 border-r">
                                                <Input
                                                    type="number"
                                                    {...register(`requisitionDetails.${index}.pcreqtndE_Amount`, { valueAsNumber: true })}
                                                />
                                            </td>
                                            <td className="p-3 border-r">
                                                <Input
                                                    {...register(`requisitionDetails.${index}.pcreqtndE_Remarks`)}
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                {index === detailFields.length - 1 ? (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-primary hover:text-primary hover:bg-primary/10 font-bold"
                                                        onClick={() => appendDetail({ pcmparT_Id: '', pcreqtndE_Amount: 0, pcreqtndE_Remarks: '' })}>
                                                        <Plus className="h-5 w-5" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => removeDetail(index)}>
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-semibold">
                            <span>Total Amount:</span>
                            <Input readOnly className="w-40 bg-gray-50 max-w-[150px]" value={totalAmount} />
                        </div>
                    </div>
                </div>

                {/* Section 2: ADD DOCUMENTS */}
                <div className='rounded-md border'>
                    <div className='bg-primary/5 border-b p-3 font-semibold text-primary uppercase text-sm'>
                        Add Documents
                    </div>
                    <div className='p-4'>
                        <div className="overflow-x-auto border rounded-md">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-purple-700 text-white">
                                    <tr>
                                        <th className="p-3 text-center border-r w-16">SL.NO.</th>
                                        <th className="p-3 text-center border-r min-w-[200px]">File Name</th>
                                        <th className="p-3 text-center border-r min-w-[200px]">File</th>
                                        <th className="p-3 text-center border-r w-24">View</th>
                                        <th className="p-3 text-center w-28">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documentFields.length === 0 && (
                                        <tr className="border-b bg-white">
                                            <td colSpan={5} className="p-3 text-center italic text-muted-foreground text-xs py-8">
                                                No documents added. Click + to add one.
                                            </td>
                                        </tr>
                                    )}
                                    {documentFields.map((field, index) => (
                                        <tr key={field.id} className="border-b bg-white">
                                            <td className="p-3 text-center border-r">{index + 1}</td>
                                            <td className="p-3 border-r">
                                                <Input
                                                    {...register(`requisitionDocuments.${index}.pcreqtndO_FileName`)}
                                                />
                                            </td>
                                            <td className="p-3 border-r flex items-center justify-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <label className="bg-[#f46a2a] hover:bg-[#d65719] text-white px-3 py-1 rounded cursor-pointer text-xs font-semibold uppercase transition-all hover:scale-105 active:scale-95 shadow-sm">
                                                        {watch(`requisitionDocuments.${index}.file`) ? 'Change File' : 'Upload File'}
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="video/mp4,.pdf,.doc,.docx"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const previewUrl = URL.createObjectURL(file);

                                                                    setValue(`requisitionDocuments.${index}.fileType`, file.type);
                                                                    setValue(`requisitionDocuments.${index}.pcreqtndO_FilePath`, previewUrl);
                                                                    setValue(`requisitionDocuments.${index}.file`, file);

                                                                    setValue(`requisitionDocuments.${index}.pcreqtndO_FileName`, file.name);
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                    {watch(`requisitionDocuments.${index}.file`) && (
                                                        <span className="text-[10px] text-green-600 font-medium truncate max-w-[150px]">
                                                            {(watch(`requisitionDocuments.${index}.file`) as File).name}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 border-r text-center">
                                                {watch(`requisitionDocuments.${index}.pcreqtndO_FilePath`) && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const filePath = watch(`requisitionDocuments.${index}.pcreqtndO_FilePath`);
                                                            if (filePath) {
                                                                setPreviewFile({
                                                                    url: filePath,
                                                                    type: (watch(`requisitionDocuments.${index}`) as any)?.fileType || ''
                                                                });
                                                            } else {
                                                                toast.error("No file to preview");
                                                            }
                                                        }}
                                                        className="text-primary hover:underline text-xs font-bold flex items-center gap-1"
                                                    >
                                                        <Eye className="h-3 w-3" /> VIEW
                                                    </Button>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {index === documentFields.length - 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8 font-bold"
                                                            onClick={() => appendDocument({ pcreqtndO_FileName: '', pcreqtndO_FilePath: '' })}>
                                                            <Plus className="h-5 w-5" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8 font-bold"
                                                        onClick={() => removeDocument(index)}>
                                                        <span className="text-xl leading-none">-</span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {documentFields.length === 0 && (
                                        <tr className="bg-white">
                                            <td colSpan={5} className="p-2 text-center">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => appendDocument({ pcreqtndO_FileName: '', pcreqtndO_FilePath: '' })}>
                                                    <Plus className="mr-2 h-4 w-4" /> Add Row
                                                </Button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-full sm:w-32 bg-[#f46a2a] hover:bg-[#d65719] text-white transition-all duration-200 hover:scale-105 sm:order-1'>
                        <div className='flex items-center'>
                            <Save className='mr-2 font-bold h-4 w-4' />
                            {isSubmitting ? 'Saving...' : 'SAVE'}
                        </div>
                    </Button>

                    <Button
                        type='button'
                        onClick={() => {
                            reset();
                            setHasSubmitted(false);
                        }}
                        disabled={isSubmitting}
                        className='order-2 w-full sm:w-32 bg-white hover:bg-gray-100 text-black border border-gray-300 transition-all duration-200 hover:scale-105 sm:order-2'>
                        <div className='flex items-center justify-center font'>
                            <span className="mr-2 h-4 w-4 text-center leading-[14px]"></span> CANCEL
                        </div>
                    </Button>
                </div>
            </form >

            {/* Document Preview Modal */}
            {previewFile && (
                <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300'>
                    <div className='bg-white rounded-xl shadow-2xl max-w-4xl w-[95%] p-2 relative slide-in-from-bottom-4 animate-in duration-300'>
                        {/* Header */}
                        <div className='flex items-center justify-between p-4 border-b bg-gray-50/50 rounded-t-xl'>
                            <div className='flex flex-col'>
                                <h3 className='font-bold text-lg text-primary flex items-center gap-2'>
                                    <Eye className='h-5 w-5 text-purple-600' /> Document Preview
                                </h3>
                                <span className='text-xs text-muted-foreground truncate max-w-[400px]'>
                                    Source: {previewFile.url.startsWith('blob:') ? 'Local Upload' : previewFile.url.split('/').pop()}
                                </span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    asChild
                                    className='h-9 gap-2 shadow-sm hover:bg-primary/5'
                                >
                                    <a href={previewFile.url} download target="_blank" rel="noopener noreferrer">
                                        <Save className='h-4 w-4' /> Download
                                    </a>
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => setPreviewFile(null)}
                                    className='h-9 w-9 rounded-full hover:bg-destructive/10 text-destructive'
                                >
                                    <X className='h-5 w-5' />
                                </Button>
                            </div>
                        </div>

                        {/* File Preview Content */}
                        <div className='p-4 overflow-auto max-h-[75vh] flex justify-center bg-[#f8f9fa]'>
                            {previewFile.type === "application/pdf" ? (
                                <iframe
                                    src={previewFile.url}
                                    className="w-full h-[650px] border-0 rounded-lg shadow-xl bg-white"
                                />
                            ) : previewFile.type?.startsWith("image/") ? (
                                <img
                                    src={previewFile.url}
                                    className="max-w-full max-h-[650px] object-contain border rounded-lg shadow-xl"
                                />
                            ) : previewFile.type === "video/mp4" ? (
                                <video
                                    controls
                                    className="max-w-full max-h-[650px] rounded-lg shadow-xl"
                                >
                                    <source src={previewFile.url} type="video/mp4" />
                                    Your browser does not support video.
                                </video>
                            ) : previewFile.type === "application/msword" ||
                                previewFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                                <div className="text-center p-10">
                                    <p className="font-semibold text-gray-700 mb-3">
                                        Preview not available for Word documents
                                    </p>
                                    <a
                                        href={previewFile.url}
                                        target="_blank"
                                        className="text-blue-600 underline"
                                    >
                                        Click here to download and view
                                    </a>
                                </div>
                            ) : (
                                <p className="text-center text-red-500">Unsupported file type</p>
                            )}
                        </div>

                        {/* Footer info */}
                        <div className='p-3 border-t bg-gray-50/30 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-semibold'>
                            Internal Petty Cash Document Viewer
                        </div>

                        {/* Backdrop click to close */}
                        <div className='absolute inset-0 -z-10' onClick={() => setPreviewFile(null)} />
                    </div>
                </div>
            )}
        </div>
    );
}