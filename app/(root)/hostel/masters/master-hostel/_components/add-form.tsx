'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMasterHostel } from '@/hooks/hostel/useMasterHostel';
import { type IMasterHostelForm, masterHostelSchema } from '@/schemas/hostel/master-hostel.schema';
import {
    type ICountry,
    type IEmployee,
    type IFacility,
    type IMess,
    type IState,
    saveHostel
} from '@/server/hostel/master-hostel/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddMasterHostelFormProps {
    onSuccess: () => void;
    countries: ICountry[];
    states: IState[];
    facilities: IFacility[];
    messes: IMess[];
    employees: IEmployee[];
    initialData?: any; // For edit mode pre-fill
}

export default function AddMasterHostelForm({
    onSuccess,
    countries,
    states,
    facilities,
    messes,
    employees,
    initialData
}: AddMasterHostelFormProps) {
    const { refetch } = useMasterHostel();

    const methods = useForm<IMasterHostelForm>({
        resolver: zodResolver(masterHostelSchema),
        defaultValues: {
            hlmH_Name: '',
            hlmH_ContactNo: '',
            hlmH_TotalCapacity: '',
            hlmH_BoysGirlsFlg: 'Boys',
            hlmH_Address: '',
            ivrmmC_Id: '',
            ivrmmS_Id: '',
            hlmH_City: '',
            hlmH_Pincode: '',
            hlmH_TotalFloor: '',
            hlmH_TotalRoom: '',
            hlmH_Desc: '',
            hlmhW_WardenType: '',
            facilities: [],
            wardens: [],
            messes: [],
            documents: [],
            hlmH_ActiveFlag: true,
            ...initialData // Override with initial data if present
        },
        mode: 'onChange'
    });

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = methods;

    const selectedCountryId = watch('ivrmmC_Id');
    const documents = watch('documents') || [];

    // Filter states based on country
    const filteredStates = useMemo(() => {
        if (!selectedCountryId) return [];
        return states.filter((s) => s.ivrmmC_Id === Number(selectedCountryId));
    }, [selectedCountryId, states]);

    const onSubmit = async (data: IMasterHostelForm) => {
        try {
            const formData = {
                ...data,
                hlmH_Id: initialData?.hlmH_Id
            };
            const result = await saveHostel(formData);
            if (result.success) {
                toast.success(result.message);
                refetch();
                onSuccess();
                if (!initialData) reset();
            } else {
                toast.error(result.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save hostel');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newDoc = {
                hlmhP_FileName: file.name,
                hlmhP_FilePath: URL.createObjectURL(file), // Mock path
                filetype: file.name.split('.').pop()
            };
            setValue('documents', [...documents, newDoc]);
            e.target.value = ''; // Reset input
        }
    };

    const removeDocument = (index: number) => {
        const newDocs = [...documents];
        newDocs.splice(index, 1);
        setValue('documents', newDocs);
    };

    return (
        <div className='flex w-full flex-col gap-6'>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-md' noValidate>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {/* Hostel Name */}
                        <div>
                            <Label>
                                Hostel Name <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='hlmH_Name'
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} placeholder='Enter Hostel Name' />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>

                        {/* Contact No */}
                        <div>
                            <Label>
                                Contact No. <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='hlmH_ContactNo'
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} maxLength={10} placeholder='Enter Contact No' />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>

                        {/* Total Capacity */}
                        <div>
                            <Label>
                                Total Capacity <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='hlmH_TotalCapacity'
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} maxLength={5} placeholder='Enter Total Capacity' />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>

                        {/* Hostel Category */}
                        <div>
                            <Label>
                                Hostel Category <span className='text-red-500'>*</span>
                            </Label>
                            <div className='flex gap-4 pt-2'>
                                <label className='flex cursor-pointer items-center gap-2'>
                                    <input type='radio' value='Boys' {...methods.register('hlmH_BoysGirlsFlg')} />
                                    <span>Boys</span>
                                </label>
                                <label className='flex cursor-pointer items-center gap-2'>
                                    <input type='radio' value='Girls' {...methods.register('hlmH_BoysGirlsFlg')} />
                                    <span>Girls</span>
                                </label>
                            </div>
                            {errors.hlmH_BoysGirlsFlg && <FormError>{errors.hlmH_BoysGirlsFlg.message}</FormError>}
                        </div>

                        {/* Country */}
                        <div>
                            <Label>
                                Country <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='ivrmmC_Id'
                                render={({ field, fieldState }) => (
                                    <>
                                        <Select value={field.value?.toString()} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Country' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries.map((c) => (
                                                    <SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>
                                                        {c.ivrmmC_CountryName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>

                        {/* State */}
                        <div>
                            <Label>
                                State <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='ivrmmS_Id'
                                render={({ field, fieldState }) => (
                                    <>
                                        <Select value={field.value?.toString()} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select State' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredStates.map((s) => (
                                                    <SelectItem key={s.ivrmmS_Id} value={s.ivrmmS_Id.toString()}>
                                                        {s.ivrmmS_Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>

                        {/* City */}
                        <div>
                            <Label>
                                City <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='hlmH_City'
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} placeholder='Enter City Name' />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>

                        {/* Pincode */}
                        <div>
                            <Label>
                                Pincode <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='hlmH_Pincode'
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} maxLength={6} placeholder='Enter Pincode' />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>

                        {/* Total Floor */}
                        <div>
                            <Label>
                                Total Floor <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='hlmH_TotalFloor'
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} placeholder='Enter Total Floor' />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>

                        {/* Total Room */}
                        <div>
                            <Label>
                                Total Room <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='hlmH_TotalRoom'
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input {...field} placeholder='Enter Total Room' />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>

                        {/* Document Upload Section - Moved here as requested */}
                        <div className='rounded-md border p-4 md:col-span-2'>
                            <div className='mb-4 flex items-center justify-between'>
                                <Label className='font-semibold text-base'>Hostel Guide Upload</Label>
                            </div>

                            <div className='overflow-x-auto'>
                                <table className='w-full text-center text-sm'>
                                    <thead className='bg-gray-100'>
                                        <tr>
                                            <th className='border p-2'>SL.NO.</th>
                                            <th className='border p-2'>File</th>
                                            <th className='border p-2'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents.map((doc, index) => (
                                            <tr key={index}>
                                                <td className='border p-2'>{index + 1}</td>
                                                <td className='border p-2'>{doc.hlmhP_FileName}</td>
                                                <td className='border p-2'>
                                                    <Button type='button' variant='ghost' size='sm' onClick={() => removeDocument(index)}>
                                                        <Trash2 className='h-4 w-4 text-red-500' />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td className='border p-2 text-center' colSpan={3}>
                                                <div className='relative inline-block'>
                                                    <Button type='button' variant='secondary' size='sm'>
                                                        Upload File
                                                    </Button>
                                                    <input
                                                        type='file'
                                                        className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                                                        onChange={handleFileUpload}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Address */}
                        <div className='md:col-span-2'>
                            <Label>
                                Address <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='hlmH_Address'
                                render={({ field, fieldState }) => (
                                    <>
                                        <Textarea {...field} placeholder='Enter Address' />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>

                        {/* Description */}
                        <div className='md:col-span-2'>
                            <Label>Description</Label>
                            <Controller
                                control={control}
                                name='hlmH_Desc'
                                render={({ field }) => <Textarea {...field} placeholder='Enter Description' />}
                            />
                        </div>

                        {/* Facilities Checkboxes */}
                        <div className='md:col-span-2'>
                            <Controller
                                control={control}
                                name='facilities'
                                render={({ field }) => (
                                    <CustomMultiSelectBox
                                        label='Facilities'
                                        isRequired
                                        options={facilities.map((f) => ({ label: f.hlmftY_FacilityName, value: f.hlmftY_Id.toString() }))}
                                        value={field.value?.map(String) || []}
                                        onChange={(vals) => field.onChange(vals.map(Number))}
                                        error={errors.facilities?.message}
                                        isSearchRequired
                                    />
                                )}
                            />
                        </div>

                        {/* Warden Type */}
                        <div>
                            <Label>Warden Type</Label>
                            <Controller
                                control={control}
                                name='hlmhW_WardenType'
                                render={({ field }) => <Input {...field} placeholder='Enter Warden Type' />}
                            />
                        </div>

                        {/* Wardens Checkboxes */}
                        <div className='md:col-span-2'>
                            <Controller
                                control={control}
                                name='wardens'
                                render={({ field }) => (
                                    <CustomMultiSelectBox
                                        label='Warden'
                                        isRequired
                                        options={employees.map((e) => ({
                                            label: `${e.hrmE_EmployeeFirstName} : ${e.hrmE_EmployeeCode}`,
                                            value: e.hrmE_Id.toString()
                                        }))}
                                        value={field.value?.map(String) || []}
                                        onChange={(vals) => field.onChange(vals.map(Number))}
                                        error={errors.wardens?.message}
                                        isSearchRequired
                                    />
                                )}
                            />
                        </div>

                        {/* Mess Checkboxes */}
                        <div className='md:col-span-2'>
                            <Controller
                                control={control}
                                name='messes'
                                render={({ field }) => (
                                    <CustomMultiSelectBox
                                        label='Mess'
                                        isRequired
                                        options={messes.map((m) => ({ label: m.hlmM_Name, value: m.hlmM_Id.toString() }))}
                                        value={field.value?.map(String) || []}
                                        onChange={(vals) => field.onChange(vals.map(Number))}
                                        error={errors.messes?.message}
                                        isSearchRequired
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className='flex justify-center gap-2'>
                        <Button type='submit' disabled={isSubmitting}>
                            {isSubmitting ? (initialData ? 'Updating...' : 'Saving...') : initialData ? 'Update' : 'Save'}
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                                reset();
                                onSuccess();
                            }}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
