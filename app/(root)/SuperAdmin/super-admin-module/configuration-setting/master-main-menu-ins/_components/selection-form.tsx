'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { InstitutionDTO, ModuleDTO } from '@/types/super-admin/configuration-setting/master-main-menu-ins';
import { getInstitutionDropdown, getModuleDropdown } from '@/server/super-admin/configuration-setting/master-main-menu-ins';

export default function SelectionForm() {
    const { control, formState: { errors } } = useFormContext();
    const [institutions, setInstitutions] = useState<InstitutionDTO[]>([]);
    const [modules, setModules] = useState<ModuleDTO[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const instData = await getInstitutionDropdown();
                if (instData.success && instData.data?.institutionList) {
                    setInstitutions(instData.data.institutionList);
                }

                const modData = await getModuleDropdown();
                if (modData.success && modData.data?.moduleList) {
                    setModules(modData.data.moduleList);
                }
            } catch (e) {
                console.error("Error fetching dropdowns", e);
            }
        };
        fetchData();
    }, []);

    return (
        <Card className="mb-6 bg-white shadow-md rounded-lg p-0 border">
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Institution Dropdown */}
                    <div className="space-y-2">
                        <Label className="font-semibold">Institution Name: <span className="text-red-500">*</span></Label>
                        <Controller
                            control={control}
                            name="institution"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Institution" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {institutions.map((item) => (
                                            <SelectItem key={item.mI_Id} value={item.mI_Id.toString()}>
                                                {item.mI_Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.institution && (
                            <p className="text-sm font-medium text-destructive text-red-500">
                                {errors.institution.message as string}
                            </p>
                        )}
                    </div>

                    {/* Module Dropdown */}
                    <div className="space-y-2">
                        <Label className="font-semibold">Module Name: <span className="text-red-500">*</span></Label>
                        <Controller
                            control={control}
                            name="module"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Module" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {modules.map((item) => (
                                            <SelectItem key={item.ivrmM_Id} value={item.ivrmM_Id.toString()}>
                                                {item.ivrmM_ModuleName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.module && (
                            <p className="text-sm font-medium text-destructive text-red-500">
                                {errors.module.message as string}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
