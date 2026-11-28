'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner as LoadingSpinner } from '@/components/ui/spinner';
import { type MasterSubMenuSchema, masterSubMenuSchema } from '@/schemas/super-admin/super-admin-module/general-setting/master-sub-menu';
import {
    getMainMenuDropdown,
    getMasterSubMenuDetails,
    getModuleDropdown,
    saveMasterSubMenu
} from '@/server/super-admin/super-admin-module/general-setting/master-sub-menu';
import type {
    IMainMenuDropdownItem,
    IMasterSubMenu,
    IModuleDropdownItem
} from '@/types/super-admin/super-admin-module/general-setting/master-sub-menu';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddMasterSubMenuFormProps {
    onSuccess?: () => void;
    initialData?: IMasterSubMenu;
}

export default function AddMasterSubMenuForm({ onSuccess, initialData }: AddMasterSubMenuFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isEditDataLoading, setIsEditDataLoading] = useState(Boolean(initialData?.ivrmmS_Id));
    const [isMainMenuLoading, setIsMainMenuLoading] = useState(false);
    const [modules, setModules] = useState<IModuleDropdownItem[]>([]);
    const [mainMenus, setMainMenus] = useState<IMainMenuDropdownItem[]>([]);
    const loadedModuleIdRef = useRef<number | null>(null);
    console.log('initialData in AddMasterSubMenuForm:', initialData); // Debugging log

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<MasterSubMenuSchema>({
        resolver: zodResolver(masterSubMenuSchema),
        defaultValues: {
            ivrmmS_Id: initialData?.ivrmmS_Id,
            ivrmM_Id: 0,
            ivrmmM_Id: 0,
            ivrmmS_SubMenuName: '',
            ivrmmS_Order: 0
        }
    });

    const selectedModuleId = watch('ivrmM_Id');

    // Load dropdown and edit data before showing an edit form.
    useEffect(() => {
        let isCurrent = true;
        const editId = initialData?.ivrmmS_Id;

        const loadFormData = async () => {
            if (!editId) {
                try {
                    const moduleRes = await getModuleDropdown();
                    if (!isCurrent) return;
                    if (moduleRes.success && moduleRes.data) {
                        setModules(moduleRes.data);
                    } else {
                        toast.error(moduleRes.message || 'Failed to fetch module dropdown');
                    }
                } catch {
                    if (isCurrent) toast.error('Failed to fetch module dropdown');
                }
                return;
            }

            setIsEditDataLoading(true);
            try {
                const [moduleRes, detailRes] = await Promise.all([getModuleDropdown(), getMasterSubMenuDetails(editId)]);
                if (!moduleRes.success || !moduleRes.data) {
                    throw new Error(moduleRes.message || 'Failed to fetch module dropdown');
                }
                if (!detailRes.success) {
                    throw new Error(detailRes.message || 'Failed to fetch sub-menu details');
                }

                const response = detailRes as any;
                const data = response.edit_s_menu?.[0] || response.data?.[0] || response.data || response;
                if (!data) {
                    throw new Error('Sub-menu details were not returned');
                }

                const moduleId = Number(data.ivrmM_Id ?? data.IVRMM_Id ?? data.ivrmm_Id ?? initialData.ivrmM_Id ?? 0);
                const mainMenuId = Number(data.IVRMMM_Id_select ?? data.ivrmmm_Id_select ?? data.ivrmmM_Id ?? initialData.ivrmmM_Id ?? 0);
                if (!moduleId) {
                    throw new Error('Module ID was not returned for this sub-menu');
                }
                const menuRes = await getMainMenuDropdown(moduleId);
                if (!menuRes.success || !menuRes.data) {
                    throw new Error(menuRes.message || 'Failed to fetch main menu dropdown');
                }
                if (!isCurrent) return;

                setModules(moduleRes.data);
                setMainMenus(menuRes.data);
                loadedModuleIdRef.current = moduleId;
                reset({
                    ivrmmS_Id: Number(data.ivrmmS_Id ?? data.IVRMMM_Id ?? editId),
                    ivrmM_Id: moduleId,
                    ivrmmM_Id: mainMenuId,
                    ivrmmS_SubMenuName: data.ivrmmS_SubMenuName ?? data.SubMenuName ?? data.subMenuName ?? '',
                    ivrmmS_Order: Number(data.ivrmmS_Order ?? data.IVRMMM_MenuOrder ?? data.ivrmmm_MenuOrder ?? 0)
                });
            } catch (error) {
                if (isCurrent) {
                    toast.error(error instanceof Error ? error.message : 'Failed to load edit data');
                }
            } finally {
                if (isCurrent) setIsEditDataLoading(false);
            }
        };

        loadFormData();
        return () => {
            isCurrent = false;
        };
    }, [initialData, reset]);

    // Load main menus when the module changes after initial edit data is ready.
    useEffect(() => {
        const moduleId = Number(selectedModuleId);
        if (!moduleId) {
            setMainMenus([]);
            loadedModuleIdRef.current = null;
            setIsMainMenuLoading(false);
            return;
        }
        if (loadedModuleIdRef.current === moduleId) return;

        let isCurrent = true;
        setIsMainMenuLoading(true);
        getMainMenuDropdown(moduleId)
            .then((res) => {
                if (!isCurrent) return;
                if (res.success && res.data) {
                    setMainMenus(res.data);
                    loadedModuleIdRef.current = moduleId;
                } else {
                    setMainMenus([]);
                    toast.error(res.message || 'Failed to fetch main menu dropdown');
                }
            })
            .catch(() => {
                if (isCurrent) toast.error('Failed to fetch main menu dropdown');
            })
            .finally(() => {
                if (isCurrent) setIsMainMenuLoading(false);
            });
        return () => {
            isCurrent = false;
        };
    }, [selectedModuleId]);

    const onSubmit = async (data: MasterSubMenuSchema) => {
        setIsLoading(true);
        try {
            const result = await saveMasterSubMenu(data);
            if (result.success) {
                toast.success(initialData ? 'Master Sub Menu Updated Successfully' : 'Master Sub Menu Saved Successfully');
                if (!initialData) reset();
                onSuccess?.();
            } else {
                toast.error(result.message || 'Failed to save data');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (isEditDataLoading) {
        return (
            <div className='flex min-h-40 flex-col items-center justify-center gap-3 text-muted-foreground'>
                <LoadingSpinner />
                <span>Loading sub-menu details...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='p-4'>
                <div className='mx-auto max-w-2xl space-y-4'>
                    <div className='grid grid-cols-12 items-center gap-4'>
                        <Label className='col-span-12 text-left md:col-span-4 md:text-right'>
                            Module Name: <span className='text-red-500'>*</span>
                        </Label>
                        <div className='col-span-12 md:col-span-8'>
                            <Controller
                                control={control}
                                name='ivrmM_Id'
                                render={({ field }) => (
                                    <Select
                                        value={field.value ? field.value.toString() : ''}
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                            setValue('ivrmmM_Id', 0); // Reset Main Menu on Module change
                                        }}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Module' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modules.map((module, index) => (
                                                <SelectItem key={`${module.ivrmM_Id}_${index}`} value={module.ivrmM_Id.toString()}>
                                                    {module.ivrmM_ModuleName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.ivrmM_Id?.message}</FormError>
                        </div>
                    </div>

                    <div className='grid grid-cols-12 items-center gap-4'>
                        <Label className='col-span-12 text-left md:col-span-4 md:text-right'>
                            Main Menu Name: <span className='text-red-500'>*</span>
                        </Label>
                        <div className='col-span-12 md:col-span-8'>
                            <Controller
                                control={control}
                                name='ivrmmM_Id'
                                render={({ field }) => (
                                    <Select
                                        value={field.value ? field.value.toString() : ''}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        disabled={!selectedModuleId || isMainMenuLoading}>
                                        <SelectTrigger className='w-full'>
                                            {isMainMenuLoading ? (
                                                <span className='flex items-center gap-2 text-muted-foreground'>
                                                    <LoadingSpinner />
                                                    Loading main menus...
                                                </span>
                                            ) : (
                                                <SelectValue placeholder='Select Main Menu' />
                                            )}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mainMenus.map((menu, index) => (
                                                <SelectItem key={`${menu.ivrmmM_Id}_${index}`} value={menu.ivrmmM_Id.toString()}>
                                                    {menu.ivrmmM_MenuName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.ivrmmM_Id?.message}</FormError>
                        </div>
                    </div>

                    <div className='grid grid-cols-12 items-center gap-4'>
                        <Label className='col-span-12 text-left md:col-span-4 md:text-right'>
                            Sub Menu Name: <span className='text-red-500'>*</span>
                        </Label>
                        <div className='col-span-12 md:col-span-8'>
                            <Controller
                                control={control}
                                name='ivrmmS_SubMenuName'
                                render={({ field }) => (
                                    <InputText
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder='Enter Sub Menu Name'
                                        maxLength={20}
                                    />
                                )}
                            />
                            <FormError>{errors.ivrmmS_SubMenuName?.message}</FormError>
                        </div>
                    </div>

                    <div className='grid grid-cols-12 items-center gap-4'>
                        <Label className='col-span-12 text-left md:col-span-4 md:text-right'>
                            Sub Menu Order: <span className='text-red-500'>*</span>
                        </Label>
                        <div className='col-span-12 md:col-span-8'>
                            <Controller
                                control={control}
                                name='ivrmmS_Order'
                                render={({ field }) => (
                                    <InputText
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder='Enter Sub Menu Order'
                                        type='number'
                                        maxLength={3}
                                    />
                                )}
                            />
                            <FormError>{errors.ivrmmS_Order?.message}</FormError>
                        </div>
                    </div>
                </div>

                <div className='mt-8 flex justify-center gap-4 border-t pt-4'>
                    <Button
                        type='button'
                        variant='destructive'
                        onClick={() => {
                            reset();
                            onSuccess?.();
                        }}
                        className='w-32 bg-red-500 hover:bg-red-600'>
                        <X className='mr-2 h-4 w-4' />
                        Cancel
                    </Button>

                    <Button type='submit' disabled={isLoading} className='w-32 bg-blue-600 hover:bg-blue-700'>
                        {isLoading ? <LoadingSpinner /> : <Save className='mr-2 h-4 w-4' />}
                        {initialData ? 'Update' : 'Save'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
