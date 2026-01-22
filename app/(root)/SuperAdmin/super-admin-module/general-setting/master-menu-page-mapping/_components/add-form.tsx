'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Spinner as LoadingSpinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { masterMenuPageMappingSchema, type MasterMenuPageMappingSchema } from '@/schemas/super-admin/super-admin-module/general-setting/master-menu-page-mapping';
import { saveMasterMenuPageMapping, getMainMenuDropdown, getSubMenuDropdown } from '@/server/super-admin/super-admin-module/general-setting/master-menu-page-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { IModuleDropdownItem, IMainMenuDropdownItem, ISubMenuDropdownItem, IMasterPageItem } from '@/types/super-admin/super-admin-module/general-setting/master-menu-page-mapping';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface AddMasterMenuPageMappingFormProps {
    onSuccess?: () => void;
    modules: IModuleDropdownItem[];
    allPages: IMasterPageItem[];
}

export default function AddMasterMenuPageMappingForm({ onSuccess, modules, allPages }: AddMasterMenuPageMappingFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [mainMenus, setMainMenus] = useState<IMainMenuDropdownItem[]>([]);
    const [subMenus, setSubMenus] = useState<ISubMenuDropdownItem[]>([]);

    // Page selection state
    const [selectedPages, setSelectedPages] = useState<IMasterPageItem[]>([]);
    const [pageSearch, setPageSearch] = useState('');

    const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<MasterMenuPageMappingSchema>({
        resolver: zodResolver(masterMenuPageMappingSchema),
        defaultValues: {
            ivrmM_Id: 0,
            ivrmmM_Id: 0,
            ivrmmS_Id: 0,
        },
    });

    const selectedModuleId = watch('ivrmM_Id');
    const selectedMainMenuId = watch('ivrmmM_Id');

    // Fetch main menus when module changes
    useEffect(() => {
        if (selectedModuleId) {
            getMainMenuDropdown(selectedModuleId).then(res => {
                if (res.success && res.data) {
                    setMainMenus(res.data);
                } else {
                    setMainMenus([]);
                }
            });
        } else {
            setMainMenus([]);
        }
    }, [selectedModuleId]);

    // Fetch sub menus when main menu changes
    useEffect(() => {
        if (selectedMainMenuId) {
            getSubMenuDropdown(selectedMainMenuId).then(res => {
                if (res.success && res.data) {
                    setSubMenus(res.data);
                } else {
                    setSubMenus([]);
                }
            });
        } else {
            setSubMenus([]);
        }
    }, [selectedMainMenuId]);


    const handleAddPage = (page: IMasterPageItem) => {
        if (!selectedPages.some(p => p.ivrmP_Id === page.ivrmP_Id)) {
            setSelectedPages([...selectedPages, page]);
        }
    };

    const handleRemovePage = (pageId: number) => {
        setSelectedPages(selectedPages.filter(p => p.ivrmP_Id !== pageId));
    };

    const filteredPages = allPages.filter(page =>
        page.pagename.toLowerCase().includes(pageSearch.toLowerCase())
    );

    const onSubmit = async (data: MasterMenuPageMappingSchema) => {
        if (selectedPages.length === 0) {
            toast.error('Please select at least one page');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ivrmM_Id: data.ivrmM_Id,
                ivrmmM_Id: data.ivrmmM_Id,
                ivrmmS_Id: data.ivrmmS_Id, // API expects ivrmmS_Id as per standard, or IVRMMM_Idsubmenu based on HTML
                savetmpdata: selectedPages.map(p => ({ ivrmP_Id: p.ivrmP_Id }))
            };

            const result = await saveMasterMenuPageMapping(payload);
            if (result.success) {
                toast.success('Saved Successfully');
                reset();
                setSelectedPages([]);
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='p-4'>
                <div className='mx-auto max-w-4xl space-y-4'>
                    {/* Dropdowns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Module Name <span className='text-red-500'>*</span></Label>
                            <Controller
                                control={control}
                                name='ivrmM_Id'
                                render={({ field }) => (
                                    <Select
                                        value={field.value ? field.value.toString() : ''}
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                            setValue('ivrmmM_Id', 0);
                                            setValue('ivrmmS_Id', 0);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Module" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modules.map((module) => (
                                                <SelectItem key={module.ivrmM_Id} value={module.ivrmM_Id.toString()}>
                                                    {module.ivrmM_ModuleName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.ivrmM_Id?.message}</FormError>
                        </div>
                        <div className="space-y-2">
                            <Label>Main Menu Name <span className='text-red-500'>*</span></Label>
                            <Controller
                                control={control}
                                name='ivrmmM_Id'
                                render={({ field }) => (
                                    <Select
                                        value={field.value ? field.value.toString() : ''}
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                            setValue('ivrmmS_Id', 0);
                                        }}
                                        disabled={!selectedModuleId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Main Menu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mainMenus.map((menu) => (
                                                <SelectItem key={menu.ivrmmM_Id} value={menu.ivrmmM_Id.toString()}>
                                                    {menu.ivrmmM_MenuName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.ivrmmM_Id?.message}</FormError>
                        </div>
                        <div className="space-y-2">
                            <Label>Sub Menu Name <span className='text-red-500'>*</span></Label>
                            <Controller
                                control={control}
                                name='ivrmmS_Id'
                                render={({ field }) => (
                                    <Select
                                        value={field.value ? field.value.toString() : ''}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        disabled={!selectedMainMenuId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Sub Menu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subMenus.map((menu) => (
                                                <SelectItem key={menu.ivrmmS_Id} value={menu.ivrmmS_Id.toString()}>
                                                    {menu.ivrmmS_SubMenuName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.ivrmmS_Id?.message}</FormError>
                        </div>
                    </div>

                    {/* Grids */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {/* Master Pages Grid */}
                        <div className="border rounded-md p-4 shadow-sm bg-background">
                            <h3 className="font-semibold mb-2">Master Pages</h3>
                            <div className="relative mb-4">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search pages..."
                                    className="pl-8"
                                    value={pageSearch}
                                    onChange={(e) => setPageSearch(e.target.value)}
                                />
                            </div>
                            <div className="h-64 overflow-y-auto border rounded-md">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 sticky top-0">
                                        <tr>
                                            <th className="p-2">Page Name</th>
                                            <th className="p-2 text-center">Select</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPages.map((page) => {
                                            const isSelected = selectedPages.some(p => p.ivrmP_Id === page.ivrmP_Id);
                                            return (
                                                <tr key={page.ivrmP_Id} className="border-b hover:bg-muted/50">
                                                    <td className="p-2">{page.pagename}</td>
                                                    <td className="p-2 text-center">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) handleAddPage(page);
                                                                else handleRemovePage(page.ivrmP_Id);
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredPages.length === 0 && (
                                            <tr>
                                                <td colSpan={2} className="p-4 text-center text-muted-foreground">No pages found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Selected Pages Grid */}
                        <div className="border rounded-md p-4 shadow-sm bg-background">
                            <h3 className="font-semibold mb-2">Selected Pages</h3>
                            <div className="h-[21rem] overflow-y-auto border rounded-md mt-14"> {/* Added top margin to align with search box height */}
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 sticky top-0">
                                        <tr>
                                            <th className="p-2">Page Name</th>
                                            <th className="p-2 text-center">Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedPages.map((page) => (
                                            <tr key={page.ivrmP_Id} className="border-b hover:bg-muted/50">
                                                <td className="p-2">{page.pagename}</td>
                                                <td className="p-2 text-center">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 text-destructive p-0 hover:bg-destructive/10"
                                                        onClick={() => handleRemovePage(page.ivrmP_Id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {selectedPages.length === 0 && (
                                            <tr>
                                                <td colSpan={2} className="p-4 text-center text-muted-foreground">No pages selected</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-8 flex justify-center gap-4 border-t pt-4'>
                    <Button
                        type='button'
                        variant='destructive'
                        onClick={() => { reset(); setSelectedPages([]); onSuccess?.(); }}
                        className='bg-red-500 hover:bg-red-600 w-32'
                    >
                        <X className='mr-2 h-4 w-4' />
                        Cancel
                    </Button>

                    <Button
                        type='submit'
                        disabled={isLoading}
                        className='bg-blue-600 hover:bg-blue-700 w-32'
                    >
                        {isLoading ? <LoadingSpinner /> : <Save className='mr-2 h-4 w-4' />}
                        Save
                    </Button>
                </div>
            </div>
        </form>
    );
}
