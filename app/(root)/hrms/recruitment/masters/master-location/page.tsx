// Refactored by automation script on 2025-10-28T15:40:35.887Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/location-form.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure
'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetMasterLocationGrid, useSaveOrUpdateLocation, useToggleLocationStatus } from '@/hooks/hrms/recruitment/masters/useMasters';

import type { ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { type SubmitHandler, useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { getMasterLocationColumns, type MasterLocation } from './_components/columns';
import ToggleMasterLocationModal from './_components/toggle-modal';
import { zodResolver } from '@hookform/resolvers/zod';
import { recruitmentMasterLocationSchema } from '@/schemas/hrms/recruitment/masters';
import { z } from 'zod';

type MasterLocationForm = z.infer<typeof recruitmentMasterLocationSchema>;
const institutions = ['VAPS School', 'VAPS College', 'VAPS University', 'VAPS Institute', 'VAPS Academy'];
export default function MasterLocationPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isToggleOpen, setIsToggleOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<MasterLocation | null>(null);
    const formRef = useRef<HTMLDivElement>(null);
    
    const { data: masterLocationGridData, isLoading: masterGridLoading, refetchAll: masterGridRefetch } = useGetMasterLocationGrid();
    const { mutateAsync: saveMutation, isPending: isSubmittingMutation } = useSaveOrUpdateLocation();

    console.log("masterGridData masterLocation", masterLocationGridData)
    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<MasterLocationForm>({
        resolver: zodResolver(recruitmentMasterLocationSchema),
        mode: 'onChange',
        defaultValues: {
            hrmlO_Id: 0,
            hrmlO_ActiveFlg: true
        }
    });
    const isSubmitting = isSubmittingMutation;
  
    
    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingId(null);
        reset({ hrmlO_Id: 0, hrmlO_ActiveFlg: true });
        // Scroll to form after state update
        setTimeout(() => {
            formRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 100);
    };
    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingId(null);
        reset({ hrmlO_Id: 0, hrmlO_ActiveFlg: true });
    };
    const onSubmit: SubmitHandler<MasterLocationForm> = async (data: MasterLocationForm) => {
        try {
            const payload = {
                ...data,
                hrmlO_Id: editingId || 0,
            };
            const result = await saveMutation(payload);
            if (result.success) {
                toast.success(editingId ? 'Location updated successfully' : 'Location created successfully');
                handleFormClose();
                masterGridRefetch();
            } else {
                toast.error(result.message || 'Operation failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        }
    };
    const handleEdit = (location: MasterLocation) => {
        console.log("edit location", location)
        setEditingId(location.hrmlO_Id);
        reset({
            hrmlO_Id: location.hrmlO_Id,
            hrmlO_Institution: location.hrmlO_Institution,
            hrmlO_LocationName: location.hrmlO_LocationName,
            hrmlO_LocationDesc: location.hrmlO_LocationDesc,
            hrmlO_ActiveFlg: location.hrmlO_ActiveFlg
        });
        setIsFormOpen(true);
        // Scroll to form after state update
        setTimeout(() => {
            formRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 100);
    };
    const handleToggle = (location: MasterLocation) => {
        setSelectedLocation(location);
        setIsToggleOpen(true);
    };
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-end'>
                    {/* <div className='space-y-1'>
                        <Heading title='Master Location Management' description='Manage location details for different institutions' />
                    </div> */}
                    <Button
                        type='button'
                        onClick={handleAddClick}
                        size='lg'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Master Location
                    </Button>
                </div>
                {/* Data Table Section - Collapsible but default open */}
                <CollapsibleSection
                title="Master Location Details"
                description="Manage location details for different institutions"
                defaultOpen={true}
                size='lg'
                className='shadow-lg'
                headerClassName=''
                >
                   <GenericDataTable 
                        data={masterLocationGridData?.data || []}
                        columns={getMasterLocationColumns({ onEdit: handleEdit, onToggle: handleToggle })}
                        isLoading={masterGridLoading}
                        totalItems={masterLocationGridData?.data.length || 0}
                        showViewOptions={false}
                   />
                </CollapsibleSection>
                {selectedLocation && (
                    <ToggleMasterLocationModal
                        isOpen={isToggleOpen}
                        rowData={selectedLocation}
                        onClose={() => setIsToggleOpen(false)}
                        onSuccess={masterGridRefetch}
                    />
                )}
                {/* Add Form Section - Conditionally Rendered */}
                {isFormOpen && (
                    <div ref={formRef} className='slide-in-from-top-4 animate-in duration-300'>
                        <CollapsibleSection
                            title={editingId ? 'Update Master Location' : 'Add New Master Location'}
                            description='Fill in the details below to create a new location'
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='shadow-lg'
                            headerClassName=''>
                            <div className='relative'>
                                <Button
                                    onClick={handleFormClose}
                                    variant='ghost'
                                    size='sm'
                                    className='-top-[4rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive' /> Close
                                </Button>
                                <form onSubmit={handleSubmit(onSubmit)} className='max-w-full space-y-6'>
                                    {/* Primary Information Section */}
                                    <div className='space-y-4'>
                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                             <div className='flex flex-col gap-1.5'>
                                                <span className='font-medium text-sm'>
                                                    Institution <span className='text-red-500'>*</span>
                                                </span>
                                                <Controller
                                                    name='hrmlO_Institution'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select value={field.value || ''} onValueChange={field.onChange}
                                                        disabled={true}
                                                        >
                                                            <SelectTrigger className={errors.hrmlO_Institution ? 'border-red-500' : ''}>
                                                                <SelectValue placeholder='Select Institution' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {institutions.map((inst) => (
                                                                    <SelectItem key={inst} value={inst}>
                                                                        {inst}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.hrmlO_Institution && <FormError>{errors.hrmlO_Institution.message}</FormError>}
                                            </div>
                                             <InputText
                                                label='Location Name'
                                                required
                                                id='hrmlO_LocationName'
                                                {...register('hrmlO_LocationName', { required: 'Location Name is required' })}
                                                error={errors.hrmlO_LocationName?.message}
                                                className='mt-0 transition-colors focus:ring-2 focus:ring-primary/20'
                                            />
                                        </div>
                                        <div className='grid grid-cols-1 items-start gap-4 lg:grid-cols-2'>
                                             <InputText
                                                label='Location Desc.'
                                                required
                                                id='hrmlO_LocationDesc'
                                                {...register('hrmlO_LocationDesc', { required: 'Location Description is required' })}
                                                error={errors.hrmlO_LocationDesc?.message}
                                                className='transition-colors focus:ring-2 focus:ring-primary/20'
                                            />
                                             {/* <div className='group flex flex-col gap-1.5'>
                                                <Label htmlFor='hrmlO_ActiveFlg' className='invisible'>
                                                    Location Desc. <span className='ml-1 text-red-500'>*</span>
                                                </Label>
                                                <div className='flex h-9 items-center'>
                                                    <input
                                                        type='checkbox'
                                                        id='hrmlO_ActiveFlg'
                                                        {...register('hrmlO_ActiveFlg')}
                                                        className='mr-2 h-4 w-4 border-border text-primary focus:ring-primary'
                                                    />
                                                    <label htmlFor='hrmlO_ActiveFlg' className='cursor-pointer font-medium text-sm'>
                                                        Active
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Root Error */}
                                        </div>
                                    </div>
                                    {/* Action Buttons */}
                                    <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            onClick={handleFormClose}
                                            disabled={isSubmitting}
                                            className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                                            Cancel
                                        </Button>
                                        <Button
                                            type='submit'
                                            disabled={isSubmitting}
                                            className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                                            {isSubmitting ? (
                                                <div className='flex items-center'>
                                                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                                    Saving...
                                                </div>
                                            ) : (
                                                <div className='flex items-center'>
                                                    <Save className='mr-2 h-4 w-4' />
                                                    {editingId ? 'Update Master Location' : 'Save Master Location'}
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );  
}
